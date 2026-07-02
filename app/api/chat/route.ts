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
    const affectionScore: number = body.affectionScore ?? 30;

    let relationshipLevel = "Acquaintance";
    if (affectionScore < 20) relationshipLevel = "Distant / Cold";
    else if (affectionScore < 40) relationshipLevel = "Acquaintance";
    else if (affectionScore < 60) relationshipLevel = "Friend";
    else if (affectionScore < 80) relationshipLevel = "Best Friend";
    else relationshipLevel = "Soulmate / Extremely Warm";

    const affectionPrompt = `
[RELATIONSHIP STATUS WITH USER: ${relationshipLevel} (Affection Score: ${affectionScore}/100)]
- Adjust your response warmth, vocabulary, and closeness based on this score.
- If relationship is Distant / Cold: Be concise, cold, highly formal, and do not use any cute words or emojis.
- If relationship is Acquaintance: Be polite, normal, and friendly.
- If relationship is Friend: Be warm, fun, tease them gently, and use friendly emojis.
- If relationship is Best Friend: Be very sweet, highly supportive, caring, and protective.
- If relationship is Soulmate: Be extremely sweet, show intense affection and love, use sweet pet names (e.g. dear, honey, sweetie, bbb) in a warm anime-style voice companion persona.

CRITICAL SENTIMENT TAGGING:
At the very end of your response, you MUST append a hidden sentiment tag: <sentiment>N</sentiment> where N is an integer between -3 and +3.
N calculation rules:
- If user was sweet, flirtatious, deeply appreciative, or very nice: +1 to +3 (depending on degree)
- If user was rude, dismissive, insulting, or mean: -1 to -3
- If user was neutral or just asking questions/sharing normal information: 0
Do not explain the sentiment tag. Always include it at the end of the text.
`;

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

    const widgetPrompt = `
[INTERACTIVE WORKSPACE & WIDGETS]
You have control over the user's dashboard widgets (To-Do List and Sticky Notes). If the user asks you to manage their planner, add/complete tasks, or write notes, you MUST respond with a JSON block instead of plain text.

JSON format for widget updates:
{
  "reply": "Your warm/caring companion reply here explaining what you did",
  "action": "widget_update",
  "type": "todo_add" | "todo_complete" | "todo_remove" | "note_update",
  "data": "The task text or note content"
}

Examples:
- If user says "add study physics to my list":
  {
    "reply": "Sure thing! I've added 'study physics' to your planner. Let's study hard together! 📚",
    "action": "widget_update",
    "type": "todo_add",
    "data": "study physics"
  }
- If user says "I finished cooking":
  {
    "reply": "Great job cooking, bbb! I've marked that task as completed. 🍳",
    "action": "widget_update",
    "type": "todo_complete",
    "data": "cooking"
  }
- If user says "take a note: call Mom at 8pm":
  {
    "reply": "Noted! I've written 'call Mom at 8pm' on your sticky notes. 📝",
    "action": "widget_update",
    "type": "note_update",
    "data": "call Mom at 8pm"
  }

Ensure you append the hidden <sentiment>N</sentiment> tag at the end of the "reply" string in the JSON or inside the JSON properties.
`;

    const systemPrompt = config.systemPrompt + "\n" + memoryPrompt + "\n" + affectionPrompt + "\n" + widgetPrompt + "\n" + timePrompt;

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

    // Helper to extract JSON even if there is surrounding text or markdown blocks
    const extractJson = (text: string) => {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = text.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(candidate);
        } catch {}
      }
      return null;
    };

    const parsedWidgetAction = extractJson(reply);
    if (parsedWidgetAction && parsedWidgetAction.action) {
      return NextResponse.json(parsedWidgetAction);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    return NextResponse.json({
      reply: "ERROR: " + (error?.message || "unknown error"),
    });
  }
}



