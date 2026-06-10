"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Chat, ChatMessage } from "../types/chat";
import { Personality, personalityThemeMap } from "../types/personality";
import { detectMemory } from "@/lib/memory";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import DesktopVisualizer from "./components/DesktopVisualizer";
import VoiceMode from "./components/VoiceMode";
import Header from "./components/Header";

type AIState = "idle" | "listening" | "thinking" | "speaking";

const stripEmojis = (text: string): string => {
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{E000}-\u{F8FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getSpeechParameters = (text: string, personality: Personality) => {
  let pitch = 1.1;
  let rate = 0.95;

  switch (personality) {
    case "romantic":
      pitch = 1.05;
      rate = 0.88;
      break;
    case "caring":
      pitch = 1.08;
      rate = 0.92;
      break;
    case "playful":
      pitch = 1.15;
      rate = 1.05;
      break;
    case "angry":
      pitch = 1.18;
      rate = 1.05;
      break;
    case "command":
      pitch = 1.0;
      rate = 1.0;
      break;
    default:
      pitch = 1.1;
      rate = 0.95;
      break;
  }

  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes("yay") ||
    lowerText.includes("omg") ||
    lowerText.includes("excited") ||
    lowerText.includes("so happy") ||
    lowerText.includes("love it") ||
    text.endsWith("!")
  ) {
    pitch += 0.05;
    rate += 0.08;
  } else if (
    lowerText.includes("sorry") ||
    lowerText.includes("sad") ||
    lowerText.includes("tired") ||
    lowerText.includes("hurt") ||
    lowerText.includes("cry") ||
    lowerText.includes("miss you")
  ) {
    pitch -= 0.05;
    rate -= 0.07;
  } else if (
    lowerText.includes("stop") ||
    lowerText.includes("don't") ||
    lowerText.includes("ugh") ||
    lowerText.includes("annoyed") ||
    lowerText.includes("angry") ||
    lowerText.includes("hmph")
  ) {
    pitch += 0.08;
    rate += 0.05;
  }

  pitch = Math.max(0.5, Math.min(2.0, pitch));
  rate = Math.max(0.5, Math.min(2.0, rate));

  return { pitch, rate };
};

const playConnectionSound = (connected: boolean) => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const t = ctx.currentTime;
  
  if (connected) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(523.25, t); // C5
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
    
    osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
    gain.gain.setValueAtTime(0.05, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);
    
    osc.start(t);
    osc.stop(t + 0.25);
  } else {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(392.00, t); // G4
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.setValueAtTime(0, t + 0.08);
    
    osc.frequency.setValueAtTime(349.23, t + 0.1); // F4
    gain.gain.setValueAtTime(0.05, t + 0.1);
    gain.gain.setValueAtTime(0, t + 0.18);
    
    osc.frequency.setValueAtTime(261.63, t + 0.2); // C4
    gain.gain.setValueAtTime(0.05, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.35);
    
    osc.start(t);
    osc.stop(t + 0.35);
  }
};

export default function Page() {
  const { user } = useAuth();
  const [state, setState] = useState<AIState>("idle");
  const [theme] = useState<"dark" | "light">("dark");
  const [isMobile, setIsMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [personality, setPersonality] = useState<Personality>("normal");
  const [subtitle, setSubtitle] = useState("");
  const [ytVideoQuery, setYtVideoQuery] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const triggerVoiceMode = (v: boolean) => {
    if (v) {
      setIsIncomingCall(false);
    }
    setVoiceMode(v);
  };

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const currentChatMemoryRef = useRef<Record<string, string>>({});
  const lastSpeakingEndTimeRef = useRef<number>(0);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  useEffect(() => {
    currentChatMemoryRef.current = currentChat?.memory || {};
  }, [currentChat]);
  const chatHistory: ChatMessage[] = currentChat?.messages || [];
  const isDark = theme === "dark";
  const isTyping = state === "thinking";
  const themeStyles = personalityThemeMap[personality];

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

  // Track responsive screen width
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync state scrolling
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Load chat session history from storage
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

  // Save chat session history
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("bubu_chats", JSON.stringify(chats));
      localStorage.setItem("bubu_current_chat", currentChatId ?? "");
    }
  }, [chats, currentChatId]);

  // Sync active personality when changing active chat
  useEffect(() => {
    if (currentChat) {
      setPersonality(currentChat.personality || "normal");
    }
  }, [currentChatId, chats]);

  // Change personality for active chat session
  const handleSetPersonality = (p: Personality) => {
    setPersonality(p);
    if (currentChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? { ...c, personality: p } : c))
      );
    }
  };

  // Command Intent Handler
  const handleCommand = (cmd: any) => {
    const query = cmd.query || "";
    switch (cmd.target) {
      case "youtube":
        if (query) {
          window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            "_blank"
          );
        } else {
          window.open("https://www.youtube.com", "_blank");
        }
        break;

      case "spotify":
        if (query) {
          window.open(
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            "_blank"
          );
        } else {
          window.open("https://open.spotify.com", "_blank");
        }
        break;

      case "google":
        if (query) {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
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

      case "github":
        window.open("https://www.github.com", "_blank");
        break;

      case "website":
        if (query) {
          const url = query.startsWith("http") ? query : `https://${query}`;
          window.open(url, "_blank");
        }
        break;
    }
  };


  // Manage Speak (TTS)
  const speak = async (text: string) => {
    if (!window.speechSynthesis) return;

    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }

    const cleanText = stripEmojis(text);
    if (!cleanText) return;

    const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
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
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";

    const heera = voices.find(
      (v) => v.name === "Microsoft Heera - English (India)"
    );

    if (heera) {
      utterance.voice = heera;
    } else {
      const indian = voices.find((v) => v.lang === "en-IN");
      if (indian) utterance.voice = indian;
    }

    // Dynamic voice emotions based on active personality and sentiment analysis
    const { pitch, rate } = getSpeechParameters(cleanText, personality);
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => {
      lastSpeakingEndTimeRef.current = Date.now();
      setState("idle");
    };
    utterance.onerror = () => {
      lastSpeakingEndTimeRef.current = Date.now();
      setState("idle");
    };

    window.speechSynthesis.cancel();

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // Type AIMessage & trigger TTS
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
          updated[updated.length - 1].text = fullText.slice(0, index);
          return { ...c, messages: updated };
        })
      );
      if (index >= fullText.length) clearInterval(interval);
    }, 25);
  };

  // Fetch AI Response completions
  const getAIResponse = async (userText: string, memory?: Record<string, string>) => {

    try {
      setState("thinking");
      if (!currentChat) return;

      const getPersonalityContext = () => {
        const msgs = currentChat.messages;
        switch (personality) {
          case "romantic":
            return msgs.slice(-10);
          case "caring":
            return msgs.filter((m) => m.role === "user").slice(-6);
          case "playful":
            return msgs.slice(-4);
          case "angry":
            return msgs.slice(-2);
          case "command":
            return msgs.slice(-6);
          default:
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
          memory,
        }),
      });

      const data = await res.json();

      if (data?.action === "open") {
        const speakText = data.speak || "Opening website...";
        typeAIMessage(speakText);
        handleCommand(data);
        return;
      }

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

  // Send input text message
  const handleSendText = async () => {
    if (!inputText.trim()) return;
    if (!currentChatId) createNewChat();

    const text = inputText.trim();
    const detected = detectMemory(text);
    setInputText("");

    const accumulatedMemory = {
      ...(currentChat?.memory || {}),
      ...detected,
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [...c.messages, { role: "user", text }],
              title: c.messages.length === 0 ? text.slice(0, 20) : c.title,
              memory: { ...(c.memory || {}), ...detected },
            }
          : c
      )
    );

    getAIResponse(text, accumulatedMemory);
  };

  // Configure Speech Recognition
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setState("listening");
    };

    recognition.onresult = (e: any) => {
      // Prevent feedback loops: Ignore mic inputs if Bubu is speaking or just finished speaking
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        console.log("Ignored mic input: Bubu is speaking.");
        return;
      }
      const silenceBuffer = 1200; // 1.2s buffer
      if (Date.now() - lastSpeakingEndTimeRef.current < silenceBuffer) {
        console.log("Ignored mic input: Buffer active after speaking.");
        return;
      }

      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (!text || !currentChatId) return;

      const detected = detectMemory(text);
      const accumulated = {
        ...currentChatMemoryRef.current,
        ...detected,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [...c.messages, { role: "user", text }],
                title: c.messages.length === 0 ? text.slice(0, 20) : c.title,
                memory: { ...(c.memory || {}), ...detected },
              }
            : c
        )
      );

      getAIResponse(text, accumulated);
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

  // Continuous hands-free loop for calling mode
  useEffect(() => {
    if (voiceMode && state === "idle" && !isMuted) {
      const delay = setTimeout(() => {
        if (!isListeningRef.current) {
          // Double check to verify speech synthesis is not active
          if (window.speechSynthesis && !window.speechSynthesis.speaking) {
            startListening();
          }
        }
      }, 1000); // 1 second buffer to prevent trailing echo pickup
      return () => clearTimeout(delay);
    }
  }, [voiceMode, state, isMuted]);

  // Handle Call Connection initial greeting
  const handleCallConnect = () => {
    playConnectionSound(true);
    const greetingPrompt = `(Call connected. Greet the user in 1 very short sentence in your personality style. Talk directly, no system indicators. Reply in casual English only.)`;
    getAIResponse(greetingPrompt, currentChatMemoryRef.current);
  };

  const handleEndCall = () => {
    playConnectionSound(false);
    setVoiceMode(false);
    setIsMuted(false);
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
    window.speechSynthesis.cancel();
    setState("idle");
  };

  const handleInterrupt = () => {
    if (state === "speaking") {
      window.speechSynthesis.cancel();
      setState("idle");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      isListeningRef.current = false;
      setTimeout(() => {
        startListening();
      }, 100);
    }
  };

  // Create new session
  const createNewChat = () => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      personality: personality,
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setState("idle");
  };

  // Delete chat session
  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  // Save renamed session title
  const saveChatTitle = (id: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: editTitle || c.title } : c
      )
    );
    setEditingChatId(null);
  };

  return (
    <div
      className={`flex flex-col h-dvh transition-colors duration-500 overflow-hidden ${
        isDark ? "bg-[#020617] text-white" : "bg-[#f8fafc] text-gray-900"
      }`}
    >
      {/* 🎧 VOICE MODE OVERLAY */}
      {voiceMode && (
        <VoiceMode
          state={state}
          energy={energyLevel}
          subtitle={subtitle}
          personality={personality}
          onMicClick={startListening}
          onExit={handleEndCall}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onCallConnect={handleCallConnect}
          isIncomingCall={isIncomingCall}
          onInterrupt={handleInterrupt}
        />
      )}

      {/* 🌐 GLOBAL DASHBOARD HEADER */}
      <Header
        isMobile={isMobile}
        setMobileSidebarOpen={setMobileSidebarOpen}
        personality={personality}
        voiceMode={voiceMode}
        setVoiceMode={triggerVoiceMode}
        isDark={isDark}
      />

      {/* 🚀 MAIN CONTENT BODY */}
      <main className="flex-1 flex overflow-hidden">
        {/* 🧾 RESPONSIVE SIDEBAR COMPONENT */}
        <Sidebar
          isMobile={isMobile}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          isDark={isDark}
          personality={personality}
          setPersonality={handleSetPersonality}
          chats={chats}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          createNewChat={createNewChat}
          setVoiceMode={triggerVoiceMode}
          deleteChat={deleteChat}
          editingChatId={editingChatId}
          setEditingChatId={setEditingChatId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          saveChatTitle={saveChatTitle}
        />

        {/* 🤖 MAIN DASHBOARD VIEWPORT */}
        <section
          className={`flex-1 relative ${
            isMobile ? "flex items-center justify-center pt-12 pb-24" : "flex flex-row h-full max-h-full overflow-hidden p-6 gap-6"
          }`}
        >
          {/* Center column animated visualizer (Desktop Only) */}
          {!isMobile && !voiceMode && (
            <DesktopVisualizer
              state={state}
              energyLevel={energyLevel}
              personality={personality}
            />
          )}

          {/* Conversation Box Drawer */}
          {!voiceMode && (
            <ChatPanel
              isMobile={isMobile}
              isDark={isDark}
              ytVideoQuery={ytVideoQuery}
              setYtVideoQuery={setYtVideoQuery}
              chatHistory={chatHistory}
              themeStyles={themeStyles}
              isTyping={isTyping}
              inputText={inputText}
              setInputText={setInputText}
              handleSendText={handleSendText}
              startListening={startListening}
              chatEndRef={chatEndRef}
            />
          )}
        </section>
      </main>
    </div>
  );
}
