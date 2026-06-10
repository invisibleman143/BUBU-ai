"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefObject } from "react";
import { ChatMessage } from "../../types/chat";

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
}

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
}: ChatPanelProps) {
  return (
    <div
      className={`flex flex-col backdrop-blur-xl border flex-shrink-0 ${
        isMobile
          ? "fixed inset-x-0 bottom-0 top-16 rounded-none pb-24"
          : "w-[440px] h-full rounded-3xl"
      } ${
        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
      }`}
    >
      {/* HEADER */}
      <div className="px-5 py-4 border-b opacity-70 font-medium text-sm">
        Conversation
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
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm ${
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
              <div className="px-4 py-2 rounded-2xl bg-white/10 text-sm flex gap-1 items-center">
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
        className={`p-3 border-t flex gap-2 ${
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl pb-safe z-50"
            : ""
        }`}
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 outline-none text-sm text-white placeholder-white/40 border border-white/5 focus:border-cyan-400/30 transition-colors"
        />

        <button
          onClick={handleSendText}
          className={`px-4 py-2 rounded-xl font-semibold text-black transition-transform active:scale-95 cursor-pointer ${themeStyles.userBubble}`}
        >
          ➤
        </button>

        <button
          onClick={startListening}
          className={`px-4 py-2 rounded-xl font-semibold text-black transition-transform active:scale-95 cursor-pointer ${themeStyles.userBubble}`}
        >
          🎙
        </button>
      </div>
    </div>
  );
}
