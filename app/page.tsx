"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [utterances, setUtterances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.transcription) {
        setTranscription(result.transcription);
      } else {
        throw new Error(result.error || "Transcription failed");
      }
      if (result.utterances) {
        setUtterances(result.utterances);
        setTranscription(""); // Clear the plain text transcription
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

    </div>
  );
}
