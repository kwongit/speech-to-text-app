"use client";

import { useState, useRef } from "react";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  interface Utterance {
    speaker: number;
    text: string;
  }

  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Step 1: Upload the file directly to AssemblyAI
      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY!,
          "content-type": file.type,
        },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }
      const { upload_url: audioUrl } = await uploadResponse.json();
      
      // Step 2: Send the upload_url to your Next.js API route for transcription
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      });

      const result = await response.json();
      if (result.utterances) {
        setUtterances(result.utterances);
      } else if (result.transcription) {
        setTranscription(result.transcription);
      } else {
        throw new Error(result.error || "Transcription failed");
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during transcription.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = utterances.length > 0
      ? utterances.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n\n")
      : transcription;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      alert("Failed to copy text to clipboard.");
    }
  };

  const handleDownload = () => {
    const textToDownload = utterances.length > 0
      ? utterances.map(u => `Speaker ${u.speaker}: ${u.text}`).join("\n\n")
      : transcription;

    try {
      const blob = new Blob([textToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Dynamically name the file based on the uploaded audio file's name
      if (file) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove the file extension
        a.download = `${fileName}_utterances.txt`; // Append "_utterances.txt"
      } else {
        a.download = "utterances.txt"; // Fallback name
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert("Failed to download transcription.");
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscription("");
    setUtterances([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          aria-label="Upload audio file"
          ref={fileInputRef}
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
          <h2 className="text-xl font-bold">Transcription:</h2>
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

      {/* Show Copy, Download, and Clear Buttons only if there is a transcription */}
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
          <button
            onClick={handleClear}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
