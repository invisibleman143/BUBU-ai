"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefObject } from "react";
import { ChatMessage } from "../../types/chat";
import { Personality } from "../../types/personality";

interface ChatPanelProps {
  isMobile: boolean;
  isDark: boolean;
  ytVideoQuery: string | null;
  setYtVideoQuery: (q: string | null) => void;
  chatHistory: ChatMessage[];
  themeStyles: {
    accent: string;
    userBubble: string;
    aiBubble: string;
    border: string;
  };
  isTyping: boolean;
  inputText: string;
  setInputText: (t: string) => void;
  handleSendText: () => void;
  startListening: () => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
  personality: Personality;
  voiceMode?: boolean;
  setVoiceMode?: (v: boolean) => void;
  ambientPlayerOpen?: boolean;
  setAmbientPlayerOpen?: (open: boolean) => void;
}

const bubbleThemeStyles: Record<
  Personality,
  { user: string; ai: string; emoji: string }
> = {
  normal: {
    user: "bg-cyan-500/10 border-cyan-400/25 shadow-[0_4px_16px_rgba(6,182,212,0.12)] text-cyan-100",
    ai: "bg-fuchsia-500/15 border-fuchsia-400/25 shadow-[0_4px_16px_rgba(217,70,239,0.12)] text-fuchsia-100",
    emoji: "🙂",
  },
  romantic: {
    user: "bg-pink-500/10 border-pink-400/25 shadow-[0_4px_16px_rgba(244,114,182,0.12)] text-pink-100",
    ai: "bg-rose-500/15 border-rose-400/25 shadow-[0_4px_16px_rgba(244,63,94,0.12)] text-rose-100",
    emoji: "💖",
  },
  caring: {
    user: "bg-emerald-500/10 border-emerald-400/25 shadow-[0_4px_16px_rgba(16,185,129,0.12)] text-emerald-100",
    ai: "bg-teal-500/15 border-teal-400/25 shadow-[0_4px_16px_rgba(20,184,166,0.12)] text-teal-100",
    emoji: "🥰",
  },
  playful: {
    user: "bg-yellow-500/10 border-yellow-400/25 shadow-[0_4px_16px_rgba(234,179,8,0.12)] text-yellow-100",
    ai: "bg-orange-500/15 border-orange-400/25 shadow-[0_4px_16px_rgba(249,115,22,0.12)] text-orange-100",
    emoji: "😜",
  },
  angry: {
    user: "bg-red-500/10 border-red-400/25 shadow-[0_4px_16px_rgba(239,68,68,0.12)] text-red-100",
    ai: "bg-rose-600/15 border-rose-500/25 shadow-[0_4px_16px_rgba(239,68,68,0.12)] text-rose-100",
    emoji: "😡",
  },
  command: {
    user: "bg-violet-500/10 border-violet-400/25 shadow-[0_4px_16px_rgba(139,92,246,0.12)] text-violet-100",
    ai: "bg-indigo-500/15 border-indigo-400/25 shadow-[0_4px_16px_rgba(99,102,241,0.12)] text-indigo-100",
    emoji: "🤖",
  },
};

export default function ChatPanel({
  isMobile,
  isDark,
  ytVideoQuery,
  setYtVideoQuery,
  chatHistory,
  themeStyles,
  isTyping,
  inputText,
  setInputText,
  handleSendText,
  startListening,
  chatEndRef,
  personality,
  voiceMode = false,
  setVoiceMode,
  ambientPlayerOpen = false,
  setAmbientPlayerOpen,
  widthClass,
  style,
  className,
}: ChatPanelProps & { widthClass?: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`flex flex-col border flex-shrink-0 custom-glass-panel ${
        isMobile
          ? "fixed inset-x-0 bottom-0 top-16 rounded-none pb-24"
          : className || widthClass || "w-full lg:w-[440px] flex-1 lg:flex-none lg:h-full rounded-3xl max-w-[520px] lg:max-w-none self-center lg:self-auto"
      }`}
      style={style}
    >
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-white/10 opacity-70 font-semibold text-sm tracking-wide text-white/95">
        Conversation Thread
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 glass-scrollbar">
        {/* 🎧 YOUTUBE AUTO-PLAY EMBED */}
        {ytVideoQuery && (
          <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-black/30">
            <p className="text-[10px] opacity-75 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
              <span>▶️ Click video to start playback</span>
              <span className="font-mono text-cyan-400 font-semibold">{ytVideoQuery}</span>
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
              className="w-full text-xs py-2 bg-black/40 hover:bg-black/60 transition cursor-pointer font-medium"
            >
              ❌ Close Player
            </button>
          </div>
        )}

        {/* BUBBLE THREAD */}
        <AnimatePresence>
          {chatHistory.map((msg, i) => {
            const isUser = msg.role === "user";
            const currentMood = bubbleThemeStyles[personality] || bubbleThemeStyles.normal;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`flex gap-2.5 items-end ${
                  isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
                }`}
              >
                {/* Avatar Icon */}
                {isUser ? (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80 select-none shadow-md backdrop-blur-md flex-shrink-0">
                    👤
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center text-xs select-none shadow-md backdrop-blur-md flex-shrink-0">
                    {currentMood.emoji}
                  </div>
                )}

                {/* Message Bubble Card */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] border backdrop-blur-md transition-all duration-300 hover:scale-[1.015] ${
                    isUser ? currentMood.user : currentMood.ai
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ✨ TYPING INDICATOR */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start gap-2.5 items-end"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center text-xs select-none shadow-md backdrop-blur-md flex-shrink-0">
                💬
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-sm text-cyan-400 flex gap-1 items-center shadow-sm">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-100">•</span>
                <span className="animate-bounce delay-200">•</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLL ANCHOR */}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div
        className={`p-3 border-t border-white/10 flex gap-2 items-center ${
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl pb-safe z-50"
            : ""
        }`}
      >
        {/* Quick Launch Buttons (hidden on desktop/laptop, shown on mobile/tablet portrait) */}
        <div className="flex lg:hidden gap-2 flex-shrink-0">
          {/* 📞 Call BUBU Button */}
          <button
            onClick={() => setVoiceMode?.(true)}
            className={`w-9 h-9 rounded-xl border text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md backdrop-blur-md flex-shrink-0
              ${isDark 
                ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                : "bg-black/5 border-black/10 text-black hover:bg-black/10"
              }`}
            title="Call BUBU (Voice Mode)"
          >
            📞
          </button>
        </div>

        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 outline-none text-sm text-white placeholder-white/40 border border-white/10 focus:border-cyan-400/30 transition-colors"
        />

        <button
          onClick={handleSendText}
          className={`px-4 py-2 rounded-xl font-semibold text-black transition-transform active:scale-95 hover:scale-[1.03] cursor-pointer ${themeStyles.userBubble}`}
        >
          ➤
        </button>

        <button
          onClick={startListening}
          className={`px-4 py-2 rounded-xl font-semibold text-black transition-transform active:scale-95 hover:scale-[1.03] cursor-pointer ${themeStyles.userBubble}`}
        >
          🎙
        </button>
      </div>
    </div>
  );
}
