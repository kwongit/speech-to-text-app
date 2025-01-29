// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "ASSEMBLYAI_API_KEY",
});

const FILE_URL = "https://assembly.ai/sports_injuries.mp3";

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters
const data = {
  audio: FILE_URL,
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript.text);
};

run();
