import { NextResponse } from "next/server";
import { getPersonalityConfig } from "@/lib/personalities";
import { Personality } from "@/types/personality";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message: string = body.message;
    const context = body.context ?? [];
    const memory = body.memory ?? {};
    const personality: Personality = body.personality ?? "normal";

    const config = getPersonalityConfig(personality);

    let memoryPrompt = "";
    if (Object.keys(memory).length > 0) {
      const memoryText = Object.entries(memory)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      memoryPrompt = `
Important facts you remember about the user from this specific chat session:
${memoryText}

Use these facts naturally when appropriate, but don't force them into every response.
`;
    }

    const localTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });
    const timePrompt = `\nCurrent Date and Time: ${localTime}\n(Use this to answer questions about the current date or time)`;

    const systemPrompt = config.systemPrompt + "\n" + memoryPrompt + "\n" + timePrompt;

    const messages = [
      { role: "system", content: systemPrompt },
      ...context,
      { role: "user", content: message },
    ];

    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: config.temperature,
        }),
      }
    );

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    if (reply.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(reply);
        if (parsed?.action === "open") {
          return NextResponse.json(parsed);
        }
      } catch {}
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    return NextResponse.json({
      reply: "ERROR: " + (error?.message || "unknown error"),
    });
  }
}



