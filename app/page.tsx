"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [utterances, setUtterances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setTranscription("");
    setUtterances([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.utterances) {
        setUtterances(result.utterances);
      } else if (result.transcription) {
        setTranscription(result.transcription);
      } else {
        throw new Error(result.error || "Transcription failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during transcription.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to Clipboard Function
  const handleCopy = () => {
    const textToCopy = utterances.length > 0
      ? utterances.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n\n")
      : transcription;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Hide message after 2 seconds
    });
  };

  // Download as Text File Function
  const handleDownload = () => {
    const textToDownload = utterances.length > 0
      ? utterances.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n\n")
      : transcription;

    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Summarize transcription using Claude API
  const handleSummarize = async () => {
    if (!transcription) {
      alert("No transcription available to summarize.");
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await axios.post("/api/summarize", { transcription });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error summarizing:", error);
      alert("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Upload an Audio File for Transcription</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          required
          className="cursor-pointer"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Transcribing..." : "Transcribe"}
        </button>
      </form>

      {isLoading && (
        <div className="mt-5 text-center">
          <ClipLoader color="#09f" size={40} />
          <p>Transcribing your audio... This may take a moment.</p>
        </div>
      )}

      {utterances.length > 0 ? (
        <div className="mt-5">
          <h2 className="text-xl font-bold">Speaker-Separated Transcription:</h2>
          <div className="bg-gray-100 p-4 rounded mt-2">
            {utterances.map((u, index) => (
              <div key={index}>
                <p>
                  <strong>Speaker {u.speaker}: </strong> {u.text}
                </p>
                <br />
              </div>
            ))}
          </div>
        </div>
      ) : (
        transcription && (
          <div className="mt-5">
            <h2 className="text-xl font-bold">Transcription:</h2>
            <pre className="bg-gray-100 p-4 rounded mt-2">{transcription}</pre>
          </div>
        )
      )}

      {/* Show Copy & Download Buttons only if there is a transcription */}
      {(transcription || utterances.length > 0) && (
        <div className="mt-3 flex gap-2">
          <div className="relative inline-block">
            <button
              onClick={handleCopy}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Copy
            </button>
            {copied && (
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                Copied!
              </span>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download
          </button>
        </div>
      )}

      <button
        onClick={handleSummarize}
        disabled={isSummarizing}
        className="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        {isSummarizing ? "Summarizing..." : "Summarize"}
      </button>

      {summary && (
        <div className="mt-5 bg-gray-100 p-4 rounded">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}


    </div>
  );
}
