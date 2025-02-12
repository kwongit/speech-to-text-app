import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { transcription } = await req.json();
    if (!transcription) {
      return NextResponse.json({ error: "Transcription is required" }, { status: 400 });
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3.5-sonnet",
        max_tokens: 500,
        messages: [{ role: "user", content: `Summarize the following transcription:\n\n${transcription}` }],
      },
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CLAUDE_API_KEY!,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
      }
    );

    return NextResponse.json({ summary: response.data.content[0].text });
  } catch (error: any) {
    console.error("Error summarizing:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to generate summary." }, { status: 500 });
  }
}
