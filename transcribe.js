import "dotenv/config";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const audioFile = "/Users/kevin/Desktop/New Recording.m4a";

const params = {
  audio: audioFile,
  speaker_labels: true,
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  if (transcript.status === "error") {
    console.error(`Transcription failed: ${transcript.error}`);
    process.exit(1);
  }

  // console.log(transcript.text);

  for (let utterance of transcript.utterances) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

run();
