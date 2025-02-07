import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Step 1: Upload the file to AssemblyAI
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

    // Step 2: Submit transcription request
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true, // Enable speaker labels
      }),
    });
    if (!transcriptResponse.ok) {
      throw new Error("Failed to start transcription");
    }
    const { id: transcriptId } = await transcriptResponse.json();

    // Step 3: Poll for transcription completion
    let status = "queued";
    while (status !== "completed" && status !== "error") {
      const statusResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY!,
          },
        }
      );
      const data = await statusResponse.json();
      status = data.status;
      if (status === "completed") {
        return NextResponse.json({
          transcription: data.text,
          utterances: data.utterances,
        });
      } else if (status === "error") {
        throw new Error("Transcription failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred during transcription" }, { status: 500 });
  }
}
