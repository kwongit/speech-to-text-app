"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
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
    } catch (error) {
      console.error(error);
      alert("An error occurred during transcription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload an Audio File for Transcription</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Transcribing..." : "Transcribe"}
        </button>
      </form>

      {transcription && (
        <div>
          <h2>Transcription:</h2>
          <pre>{transcription}</pre>
        </div>
      )}
    </div>
  );
}
