import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    // Initialize EdgeTTS with the text and selected voice
    const tts = new EdgeTTS(text, voice || "en-US-AriaNeural");
    const { audio } = await tts.synthesize();

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("TTS server route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate TTS" },
      { status: 500 }
    );
  }
}
