"use client";
import AIVatar from "./components/AIVatar";
import VoiceMode from "./components/VoiceMode";
import NeuralOrb from "./components/NeuralOrb";


import AuthButton from "./components/AuthButton";

import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/AuthContext";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chat, ChatMessage } from "../types/chat";

type Personality =
  | "normal"
  | "romantic"
  | "caring"
  | "playful"
  | "angry";

type CommandResponse = {
  action: "open";
  target: "youtube" | "google" | "instagram" | "facebook" | "website";
  query?: string;
  play?: boolean; // 🔥 NEW
};


type CommandIntent =
  | {
      action: "open";
      target: "youtube" | "google" | "instagram" | "facebook" | "website";
      query?: string;
      play?: boolean; // ✅ 🔥 YAHI ADD KARNA THA
    }
  | null;


 const detectCommandIntent = (text: string): CommandIntent => {
  const original = text.trim();
  const lower = original.toLowerCase();

  // 🔗 WEBSITE (URL)
  const urlMatch = original.match(
    /(https?:\/\/[^\s]+)/i
  );
  if (urlMatch) {
    return {
      action: "open",
      target: "website",
      query: urlMatch[1],
    };
  }

  // 🔍 GOOGLE SEARCH (SMART)
  const googleTriggers = [
    "google",
    "search",
    "khojo",
    "dhoondo",
    "dekho",
    "find",
    "look up",
  ];

  if (googleTriggers.some((w) => lower.includes(w))) {
    const query = original
      .replace(
        new RegExp(googleTriggers.join("|"), "gi"),
        ""
      )
      .trim();

    if (query.length > 0) {
      return {
        action: "open",
        target: "google",
        query,
      };
    }
  }

 // ▶️ YOUTUBE (SMART + PLAY INTENT)
const youtubeTriggers = [
  "youtube",
  "video",
  "song",
  "gaana",
  "chalao",
  "play",
];

if (youtubeTriggers.some((w) => lower.includes(w))) {
  const playIntent =
    lower.includes("play") ||
    lower.includes("chalao") ||
    lower.includes("gaana");

  const query = original
    .replace(
      new RegExp(youtubeTriggers.join("|"), "gi"),
      ""
    )
    .trim();

  return {
    action: "open",
    target: "youtube",
    query,
    play: playIntent, // 🔥 NEW
  } as any;
}

  // 📸 INSTAGRAM
  if (
    lower.includes("instagram") ||
    lower.includes("insta")
  ) {
    return {
      action: "open",
      target: "instagram",
    };
  }

  // 📘 FACEBOOK
  if (lower.includes("facebook")) {
    return {
      action: "open",
      target: "facebook",
    };
  }

  return null;
};






type AIState = "idle" | "listening" | "thinking" | "speaking";
// 🌈 Personality → Theme mapping
const personalityThemeMap = {
  normal: {
    accent: "cyan",
    userBubble: "bg-cyan-400 text-black",
    aiBubble: "bg-fuchsia-500/80 text-white",
    border: "border-cyan-400/40",
  },
  romantic: {
    accent: "pink",
    userBubble: "bg-pink-400 text-black",
    aiBubble: "bg-rose-500/80 text-white",
    border: "border-pink-400/40",
  },
  caring: {
    accent: "emerald",
    userBubble: "bg-emerald-400 text-black",
    aiBubble: "bg-teal-500/80 text-white",
    border: "border-emerald-400/40",
  },
  playful: {
    accent: "yellow",
    userBubble: "bg-yellow-400 text-black",
    aiBubble: "bg-orange-500/80 text-white",
    border: "border-yellow-400/40",
  },
  angry: {
    accent: "red",
    userBubble: "bg-red-400 text-black",
    aiBubble: "bg-rose-600/80 text-white",
    border: "border-red-400/40",
  },
} as const;


const formatTime = (time: number) => {
  const d = new Date(time);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

export default function Page() {
  const { user } = useAuth();
    const handleCommand = (cmd: CommandResponse) => {
    switch (cmd.target) {
      case "youtube":
        if (cmd.query && cmd.play) {
          setYtVideoQuery(cmd.query); // ✅ RED LINE GAYAB
        } else if (cmd.query) {
          window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
              cmd.query
            )}`,
            "_blank"
          );
        }
        break;

      case "google":
        if (cmd.query) {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(cmd.query)}`,
            "_blank"
          );
        } else {
          window.open("https://www.google.com", "_blank");
        }
        break;

      case "instagram":
        window.open("https://www.instagram.com", "_blank");
        break;

      case "facebook":
        window.open("https://www.facebook.com", "_blank");
        break;

      case "website":
        if (cmd.query) {
          window.open(cmd.query, "_blank");
        }
        break;
    }
  };


  const [state, setState] = useState<AIState>("idle");
  // 🔋 Unified energy level for Avatar + Orb sync
const energyLevel = (() => {
  switch (state) {
    case "listening":
      return 0.6;
    case "thinking":
      return 0.8;
    case "speaking":
      return 1;
    default:
      return 0.25;
  }
})();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const [inputText, setInputText] = useState("");
  const [voiceMode, setVoiceMode] = useState(false); 
  // 📱 Mobile sidebar toggle (ChatGPT style)
const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

const [personality, setPersonality] = useState<Personality>("normal");

const [subtitle, setSubtitle] = useState("");
const [ytVideoQuery, setYtVideoQuery] = useState<string | null>(null);


  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

const [editingChatId, setEditingChatId] = useState<string | null>(null);
const [editTitle, setEditTitle] = useState("");



  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const currentChat =
    chats.find((c) => c.id === currentChatId) || null;

  const chatHistory: ChatMessage[] = currentChat?.messages || [];
  const isDark = theme === "dark";
  const isTyping = state === "thinking"; // ✅ NEW
  // 🎨 Active theme (based on personality)
const themeStyles = personalityThemeMap[personality];

 
  /* 💾 SAVE CHAT HISTORY ON CHANGE */
useEffect(() => {
  if (chats.length > 0) {
    localStorage.setItem("bubu_chats", JSON.stringify(chats));
    localStorage.setItem(
      "bubu_current_chat",
      currentChatId ?? ""
    );
  }
}, [chats, currentChatId]);


  /* 🔄 LOAD CHAT HISTORY ON FIRST LOAD */
useEffect(() => {
  const savedChats = localStorage.getItem("bubu_chats");
  const savedChatId = localStorage.getItem("bubu_current_chat");

  if (savedChats) {
    try {
      const parsedChats: Chat[] = JSON.parse(savedChats);
      setChats(parsedChats);

      if (savedChatId) {
        setCurrentChatId(savedChatId);
      } else if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      }
    } catch (e) {
      console.error("Failed to load chats from storage");
    }
  }
}, []);

  /* 🔁 AUTO SCROLL */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  /* 🆕 NEW CHAT */
  const createNewChat = () => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setState("idle");
  };

const deleteChat = (id: string) => {
  setChats((prev) => prev.filter((c) => c.id !== id));

  if (currentChatId === id) {
    setCurrentChatId(null);
  }
};

const saveChatTitle = (id: string) => {
  setChats((prev) =>
    prev.map((c) =>
      c.id === id ? { ...c, title: editTitle || c.title } : c
    )
  );
  setEditingChatId(null);
};



  /* 🔊 SPEAK (UNCHANGED) */
const speak = async (text: string) => {
  if (!window.speechSynthesis) return;

  // stop mic if listening
  if (recognitionRef.current && isListeningRef.current) {
    recognitionRef.current.stop();
    isListeningRef.current = false;
  }

  const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise(resolve => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  };

  const voices = await loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";

  // 🔒 HARD LOCK: Microsoft Heera
  const heera = voices.find(
    v => v.name === "Microsoft Heera - English (India)"
  );

  if (heera) {
    utterance.voice = heera;
  } else {
    // fallback (rare case)
    const indian = voices.find(v => v.lang === "en-IN");
    if (indian) utterance.voice = indian;
  }

  utterance.pitch = 1.1;
  utterance.rate = 0.95;

  utterance.onstart = () => setState("speaking");
  utterance.onend = () => setState("idle");

  window.speechSynthesis.cancel();

  // ⏳ tiny delay = browser stability
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
};


  /* ✨ TYPEWRITER + SPEAK (UNCHANGED) */
  const typeAIMessage = (fullText: string) => {
    let index = 0;
    speak(fullText);
    setSubtitle(fullText);


    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? { ...c, messages: [...c.messages, { role: "ai", text: "" }] }
          : c
      )
    );

    const interval = setInterval(() => {
      index++;
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== currentChatId) return c;
          const updated = [...c.messages];
          updated[updated.length - 1].text =
            fullText.slice(0, index);
          return { ...c, messages: updated };
        })
      );
      if (index >= fullText.length) clearInterval(interval);
    }, 25);
  };

 const detectMemory = (text: string) => {
  const memory: Record<string, any> = {};

  const lower = text.toLowerCase();

  // 🧍 NAME
  const nameMatch = text.match(/mera naam (\w+)/i);
  if (nameMatch) {
    memory.name = nameMatch[1];
  }

  // ❤️ LIKES
  if (lower.includes("pasand")) {
    memory.likes = text;
  }

  // 🔁 HABITS
  if (lower.includes("roz") || lower.includes("aadat")) {
    memory.habit = text;
  }

  // 😔 EMOTIONS
  if (
    lower.includes("udaas") ||
    lower.includes("akela") ||
    lower.includes("sad")
  ) {
    memory.currentEmotion = "sad";
  }

  if (
    lower.includes("khush") ||
    lower.includes("happy") ||
    lower.includes("excited")
  ) {
    memory.currentEmotion = "happy";
  }

  // 🤝 RELATIONSHIP SIGNAL
  if (
    lower.includes("tum mujhe pasand") ||
    lower.includes("i like you") ||
    lower.includes("love you")
  ) {
    memory.relationshipSignal = "affection";
  }

  return memory;
};




  /* 🤖 AI RESPONSE (UNCHANGED) */
const getAIResponse = async (
  userText: string,
  memory?: Record<string, string>
) => {

// 🧨 BULLETPROOF COMMAND CHECK (BEFORE AI)
const command = detectCommandIntent(userText);

if (command) {
  handleCommand(command);

  // ✅ SPECIAL UX FOR YOUTUBE PLAY
  if (command.target === "youtube" && command.play) {
    typeAIMessage(
      "YouTube khol rahi hoon, bas ek click me gaana chal jayega ❤️"
    );
    return;
  }

  // ✅ NORMAL COMMAND FEEDBACK
  const speakText =
    command.target === "google"
      ? "Google par search kar rahi hoon"
      : command.target === "youtube"
      ? "YouTube khol rahi hoon"
      : command.target === "instagram"
      ? "Instagram khol rahi hoon"
      : "Website open kar rahi hoon";

  typeAIMessage(speakText);
  return;
}


    try {
      setState("thinking");
      if (!currentChat) return;

     // 🧠 Personality-wise memory selection
const getPersonalityContext = () => {
  const msgs = currentChat.messages;

  switch (personality) {
    case "romantic":
      // emotional + personal (thoda zyada context)
      return msgs.slice(-10);

    case "caring":
      // user problems focused
      return msgs.filter(m => m.role === "user").slice(-6);

    case "playful":
      // light & recent
      return msgs.slice(-4);

    case "angry":
      // very short memory
      return msgs.slice(-2);

    default:
      // normal balanced memory
      return msgs.slice(-6);
  }
};

const context = getPersonalityContext().map((m) => ({
  role: m.role === "user" ? "user" : "assistant",
  content: m.text,
}));


      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  message: userText,
  context,
  personality,
  uid: user?.uid,
  memory, // 🔥 THIS WAS MISSING
}),




      });

    const data = await res.json();

// 🧠 COMMAND RESPONSE
if (data?.action === "open") {
  handleCommand(data);

  const speakText =
    data.target === "youtube"
      ? "YouTube khol rahi hoon"
      : data.target === "google"
      ? "Google par search kar rahi hoon"
      : data.target === "instagram"
      ? "Instagram khol rahi hoon"
      : data.target === "facebook"
      ? "Facebook khol rahi hoon"
      : "Website open kar rahi hoon";

  typeAIMessage(speakText);
  return;
}

// 💬 NORMAL CHAT
if (data?.reply) {
  typeAIMessage(data.reply);
  return;
}

setState("idle");

    } catch {
      speak("Sorry, I am having trouble thinking.");
      setState("idle");
    }
  };

  /* ⌨️ SEND TEXT MESSAGE (UNCHANGED) */
const handleSendText = async () => {
  if (!inputText.trim()) return;
  if (!currentChatId) createNewChat();

  const text = inputText.trim();
 const memory = detectMemory(text);
  setInputText("");
  setChats((prev) =>
    prev.map((c) =>
      c.id === currentChatId
        ? {
            ...c,
            messages: [...c.messages, { role: "user", text }],
            title:
              c.messages.length === 0
                ? text.slice(0, 20)
                : c.title,
          }
        : c
    )
  );


getAIResponse(text, detectMemory(text));

};


  /* 🎤 SPEECH RECOGNITION (UNCHANGED) */
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setState("listening");
    };

    recognition.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (!text || !currentChatId) return;

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [...c.messages, { role: "user", text }],
                title:
                  c.messages.length === 0
                    ? text.slice(0, 20)
                    : c.title,
              }
            : c
        )
      );

      getAIResponse(text);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (state !== "speaking") setState("idle");
    };

    recognitionRef.current = recognition;
  }, [state, currentChatId]);

  const startListening = () => {
    if (!recognitionRef.current || isListeningRef.current) return;
    if (!currentChatId) createNewChat();
    recognitionRef.current.start();
  };

  /* 🎨 UI */
  return (
<main
  className={`flex min-h-dvh transition-colors duration-500 ${

        isDark
          ? "bg-[#020617] text-white"
          : "bg-[#f8fafc] text-gray-900"
      }`}
    >
      {voiceMode && (
<VoiceMode
  state={state}
  energy={energyLevel}
  subtitle={subtitle}
  personality={personality}
  onMicClick={startListening}
  onExit={() => setVoiceMode(false)}
/>
    )}
{/* 📱 MOBILE TOP BAR */}
{isMobile && !voiceMode && (
  <div className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-4 backdrop-blur-xl bg-black/60 border-b border-white/10">
    <button
      onClick={() => setMobileSidebarOpen(true)}
      className="text-xl"
    >
      ☰
    </button>
    <span className="ml-4 font-semibold tracking-wide">
      BUBU
    </span>
  </div>
)}


      {/* SIDEBAR unchanged */}
{!isMobile && (
  <aside
  
    className={`w-80 p-6 backdrop-blur-xl border-r flex flex-col ${
      isDark
        ? "bg-white/5 border-white/10"
        : "bg-black/5 border-black/10"
    }`}
  >

  {/* 🔰 HEADER */}
  <h1 className="text-3xl font-bold text-cyan-400">BUBU</h1>
  <p className="text-xs opacity-70 mt-1">RealAi </p>

  {/* 🔼 TOP CONTENT */}
  <div className="flex-1">
 <div className="mt-6 space-y-3">
  <button
    onClick={createNewChat}
    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-black font-semibold shadow-lg hover:scale-[1.02] transition"
  >
    ✨ New Chat
  </button>

  <button
    onClick={() => setVoiceMode(true)}
    className="w-full py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur text-sm hover:bg-white/20 transition"
  >
    🎧 Voice Mode
  </button>
</div>



{/* 🎭 PERSONALITY CHANGER */}
<div className="mt-4">
  <p className="text-xs mb-2 uppercase tracking-widest text-white/40">
    Personality
  </p>

  <div className="flex gap-2 flex-wrap">
    {[
      { id: "normal", label: "🙂 Normal", glow: "from-cyan-400 to-blue-500" },
      { id: "romantic", label: "❤️ Romantic", glow: "from-pink-400 to-rose-500" },
      { id: "caring", label: "🤍 Caring", glow: "from-emerald-400 to-teal-500" },
      { id: "playful", label: "😜 Playful", glow: "from-yellow-400 to-orange-500" },
      { id: "angry", label: "😠 Angry", glow: "from-red-400 to-rose-600" },
    ].map((p) => {
      const active = personality === p.id;

      return (
        <motion.button
          key={p.id}
          onClick={() => setPersonality(p.id as Personality)}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`relative px-3 py-1.5 rounded-xl text-xs font-medium border overflow-hidden
            ${active
              ? "text-black border-transparent"
              : "text-white/70 border-white/10 hover:text-white"
            }`}
        >
          {/* 🌈 ACTIVE GLOW */}
          {active && (
            <motion.div
              layoutId="personality-glow"
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${p.glow}`}
              transition={{ type: "spring", stiffness: 200 }}
            />
          )}

          <span className="relative z-10">
            {p.label}
          </span>
        </motion.button>
      );
    })}
  </div>
</div>

    
  <p className="mt-6 mb-2 text-xs uppercase tracking-widest text-white/40">
  Chat History
</p>

{/* 🧊 GLASS CARD WRAPPER */}
<div className="mt-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg p-2">
  
  {/* 🧾 SCROLL AREA */}
  <div className="flex flex-col gap-2 overflow-y-auto max-h-[42vh] pl-1 direction-rtl glass-scrollbar">
    {chats.map((chat) => (
      <motion.div
        key={chat.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (confirm("Delete this chat?")) {
            deleteChat(chat.id);
          }
        }}
        className={`direction-ltr w-full rounded-xl border px-3 py-2 transition-colors duration-150 ${
          chat.id === currentChatId
            ? "border-cyan-400/40 bg-cyan-400/15"
            : isDark
            ? "bg-white/5 border-white/10 hover:bg-white/10"
            : "bg-black/5 border-black/10 hover:bg-black/10"
        }`}
      >
        <div
          className="flex items-center justify-between gap-2 cursor-pointer"
          onClick={() => setCurrentChatId(chat.id)}
          onDoubleClick={() => {
            setEditingChatId(chat.id);
            setEditTitle(chat.title);
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-cyan-400 text-sm">💬</span>

            {editingChatId === chat.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveChatTitle(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveChatTitle(chat.id);
                  if (e.key === "Escape") setEditingChatId(null);
                }}
                className="bg-transparent border-b border-cyan-400 text-sm outline-none w-full"
              />
            ) : (
              <span className="truncate text-sm">
                {chat.title}
              </span>
            )}
          </div>

          {/* RIGHT */}
          <span className="text-[10px] text-white/40 whitespace-nowrap">
            {formatTime(chat.createdAt)}
          </span>
        </div>
      </motion.div>
    ))}
  </div>
</div>
</div>

  {/* 🔽 BOTTOM FIXED LOGIN / LOGOUT */}
  <div className="mt-auto pt-4">
    <AuthButton />
  </div>
  </aside>

)}
{/* 📱 MOBILE SLIDE SIDEBAR */}
{isMobile && mobileSidebarOpen && (
  <>
    {/* 🌑 OVERLAY */}
    <div
      className="fixed inset-0 z-40 bg-black/60"
      onClick={() => setMobileSidebarOpen(false)}
    />

    {/* 📱 SIDEBAR PANEL */}
<aside className="fixed top-0 left-0 bottom-0 z-50 w-72 p-6 bg-[#020617] border-r border-white/10 flex flex-col">  
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-cyan-400">
          BUBU
        </h1>
        <button onClick={() => setMobileSidebarOpen(false)}>
          ✕
        </button>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">
        <button
          onClick={() => {
            createNewChat();
            setMobileSidebarOpen(false);
          }}
          className="w-full py-3 rounded-xl bg-cyan-400 text-black font-semibold"
        >
          ➕ New Chat
        </button>

        <button
          onClick={() => {
            setVoiceMode(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full py-3 rounded-xl bg-white/10 border border-white/20"
        >
          🎧 Voice Mode
        </button>
      </div>
{/* 🎭 PERSONALITY */}
<div className="mt-6">
  <p className="text-xs mb-2 uppercase tracking-widest text-white/40">
    Personality
  </p>

  <div className="flex gap-2 flex-wrap">
    {[
      { id: "normal", label: "🙂 Normal", glow: "from-cyan-400 to-blue-500" },
      { id: "romantic", label: "❤️ Romantic", glow: "from-pink-400 to-rose-500" },
      { id: "caring", label: "🤍 Caring", glow: "from-emerald-400 to-teal-500" },
      { id: "playful", label: "😜 Playful", glow: "from-yellow-400 to-orange-500" },
      { id: "angry", label: "😠 Angry", glow: "from-red-400 to-rose-600" },
    ].map((p) => {
      const active = personality === p.id;

      return (
        <motion.button
          key={p.id}
          onClick={() => setPersonality(p.id as Personality)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`relative px-3 py-1.5 rounded-xl text-xs font-medium border overflow-hidden
            ${
              active
                ? "text-black border-transparent"
                : "text-white/70 border-white/10 hover:text-white"
            }`}
        >
          {/* 🌈 ACTIVE GLOW */}
          {active && (
            <motion.div
              layoutId="mobile-personality-glow"
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${p.glow}`}
              transition={{ type: "spring", stiffness: 200 }}
            />
          )}

          <span className="relative z-10">
            {p.label}
          </span>
        </motion.button>
      );
    })}
  </div>
</div>


  {/* 🕘 CHAT HISTORY */}
<div className="mt-6 flex-1 flex flex-col min-h-0">
  <p className="text-xs mb-2 uppercase tracking-widest text-white/40">
    Chats
  </p>

  {/* 🔽 SCROLLABLE CHAT LIST ONLY */}
  <div className="space-y-2 overflow-y-auto pr-1 glass-scrollbar">
    {chats.map((chat) => (
      <div
        key={chat.id}
        onClick={() => {
          setCurrentChatId(chat.id);
          setMobileSidebarOpen(false);
        }}
        className="px-3 py-2 rounded-lg bg-white/5 text-sm truncate"
      >
        {chat.title}
      </div>
    ))}
  </div>
</div>
      {/* 🔐 AUTH */}
      <div className="mt-6">
        <AuthButton />
      </div>
    </aside>
  </>
)}
      {/* MAIN CHAT */}
      <section className="flex-1 relative flex items-center justify-center">
   <div
  className={`flex flex-col backdrop-blur-xl border ${
    isMobile
      ? "fixed inset-0 rounded-none pt-12 pb-24"
      : "absolute right-6 top-6 bottom-6 w-[440px] rounded-3xl"
  } ${
    isDark
      ? "bg-white/5 border-white/10"
      : "bg-black/5 border-black/10"
  }`}
>


          <div className="px-5 py-4 border-b opacity-70">
            Conversation
          </div>

<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 glass-scrollbar">

          {/* 🎧 YOUTUBE AUTO-PLAY EMBED */}
{ytVideoQuery && (
  <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
  <p className="text-xs opacity-70 mt-1">
  ▶️ Click video to start playback
</p>

<div className="responsive-yt">
  <iframe
    src={`https://www.youtube.com/embed?autoplay=1&mute=1&playsinline=1`}
    allow="autoplay; encrypted-media"
    allowFullScreen
  />
</div>


    <button
      onClick={() => setYtVideoQuery(null)}
      className="w-full text-xs py-2 bg-black/40 hover:bg-black/60 transition"
    >
      ❌ Close Player
    </button>
  </div>
)}

            <AnimatePresence>
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
              <div
  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
    msg.role === "user"
      ? themeStyles.userBubble
      : themeStyles.aiBubble
  }`}
>

                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ✨ TYPING INDICATOR */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-2 rounded-2xl bg-white/10 text-sm flex gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce delay-100">•</span>
                    <span className="animate-bounce delay-200">•</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          {/* INPUT BAR unchanged */}
<div
  className={`p-3 border-t flex gap-2 ${
    isMobile
      ? "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl pb-safe z-50"
      : ""
  }`}
>

            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSendText()
              }
              placeholder="Type a message…"
              className="flex-1 px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 outline-none text-sm"
            />

            <button
              onClick={handleSendText}
         className={`px-4 py-2 rounded-xl font-semibold text-black ${themeStyles.userBubble}`}
            >
              ➤
            </button>

            <button
              onClick={startListening}
className={`px-4 py-2 rounded-xl font-semibold text-black ${themeStyles.userBubble}`}

            >
              🎙
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
