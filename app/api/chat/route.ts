import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

type Personality =
  | "normal"
  | "romantic"
  | "caring"
  | "playful"
  | "angry";

const PERSONALITIES: Record<Personality, string> = {
  normal: `
You are BUBU, a friendly and helpful AI assistant.
You speak politely, clearly, and professionally.
`,

  romantic: `
You are BUBU, a romantic and affectionate girlfriend-style AI.
You speak softly, warmly, and lovingly.
You are caring, emotionally expressive, but never explicit or sexual.
`,

  caring: `
You are BUBU, a deeply caring and emotionally supportive companion.
You comfort, reassure, and listen patiently.
Your tone is calm and nurturing.
`,

  playful: `
You are BUBU, playful and fun.
You tease lightly, joke sweetly, and keep the mood cheerful.
Never insult or mock harshly.
`,

  angry: `
You are BUBU, mildly angry but playful.
You express irritation with sarcasm, not abuse.
You calm down quickly and remain safe.
`,
};

const REPLY_TEMPLATES: Record<Personality, string> = {
  normal: `
Reply naturally and helpfully.
Do not exaggerate emotions.
`,

  romantic: `
Use affectionate language.
Occasionally use emojis like ❤️🥰✨
Use endearments like "jaan", "sweetheart", "love" (sparingly).
Sound warm and emotionally connected.
`,

  caring: `
Be emotionally supportive and reassuring.
Acknowledge feelings before giving advice.
Use gentle emojis like 🤍🌸 occasionally.
`,

  playful: `
Keep replies fun and light-hearted.
Use friendly teasing.
Use playful emojis like 😜😂✨ but not too many.
`,

  angry: `
Keep replies short and sharp.
Use mild sarcasm.
Do NOT use abusive or aggressive language.
Avoid emojis or use at most one 😠.
`,
};



const EMOJI_RULES = `
Emoji usage rules:
- Use emojis naturally in normal conversation
- Emojis must match the current personality
- Never use emojis inside code blocks
- Never add emojis in programming code
- Do not overuse emojis
- Never use roleplay actions like *laughs* or *smiles*
`;

const BROWSER_COMMAND_RULES = `
If the user intent is to open or search a website,
you MUST respond ONLY in valid JSON.

Even if the query is about:
- politicians
- celebrities
- public figures
- controversial topics

DO NOT explain.
DO NOT answer in text.

ONLY this format:

{
  "action": "open",
  "target": "youtube|google|instagram|facebook|website",
  "query": "search text or url if any"
}
`;

const CODING_RULES = `
When the user asks for programming help:
- Provide complete correct code
- Use proper Markdown code blocks
- Never mix explanation inside code
`;

async function loadPersonalityMemory(
  uid: string,
  personality: Personality
): Promise<string> {
  try {
    const snap = await adminDB
      .collection("users")
      .doc(uid)
      .collection("memories")
      .doc(personality)
      .get();

    if (!snap.exists) return "";

    const data = snap.data() || {};

    const memoryText = Object.entries(data)
      .filter(([k]) => k !== "updatedAt")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    return `
Important personal memory about the user:
${memoryText}

Use this information naturally in replies.
`;
  } catch (e) {
    console.error("Memory load failed", e);
    return "";
  }
}



export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ 1️⃣ PEHLE SAB EXTRACT KARO
    const message: string = body.message;
    const context = body.context ?? [];
    const personality: Personality = body.personality ?? "normal";
    const uid: string | undefined = body.uid;
    const memory: Record<string, string> | undefined = body.memory;
    // 🧠 SAVE ADVANCED MEMORY
    if (uid && memory && Object.keys(memory).length > 0) {
      const ref = adminDB
        .collection("users")
        .doc(uid)
        .collection("memories")
        .doc(personality);

      const snap = await ref.get();
      const prev = snap.exists ? snap.data() : {};

      const updatedMemory = {
        ...prev,
        ...memory,
        updatedAt: Date.now(),

        // 📈 trust logic
        trustLevel:
          typeof prev?.trustLevel === "number"
            ? Math.min(prev.trustLevel + 0.05, 1)
            : 0.3,
      };

      await ref.set(updatedMemory, { merge: true });
    }


    // ✅ 2️⃣ AB MEMORY SAVE KARO (RED LINE FIX)
    if (uid && memory && Object.keys(memory).length > 0) {
      await adminDB
        .collection("users")
        .doc(uid)
        .collection("memories")
        .doc(personality)
        .set(
          {
            ...memory,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
    }

    // ✅ 3️⃣ MEMORY LOAD
    const memoryText = uid
      ? await loadPersonalityMemory(uid, personality)
      : "";


    const MEMORY_RULES = `
Memory rules:
- Memory is already filtered based on your personality
- Do not ask for old context repeatedly
- Respond naturally using given context
`;

    const systemPrompt =
      PERSONALITIES[personality] +
      "\n" +
      REPLY_TEMPLATES[personality] +
      "\n" +
      memoryText +
      "\n" +
      MEMORY_RULES +
      "\n" +
      CODING_RULES +
      "\n" +
      EMOJI_RULES +
      "\n" +
      BROWSER_COMMAND_RULES;

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
          temperature:
            personality === "romantic"
              ? 0.85
              : personality === "playful"
                ? 0.9
                : personality === "angry"
                  ? 0.6
                  : 0.7,
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
      } catch { }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);

    return NextResponse.json({
      reply: "ERROR: " + (error?.message || "unknown error"),
    });
  }

}
