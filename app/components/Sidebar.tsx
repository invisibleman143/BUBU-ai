"use client";

import { motion } from "framer-motion";
import { Chat } from "../../types/chat";
import { Personality, personalityThemeMap } from "../../types/personality";
import AuthButton from "./AuthButton";

interface SidebarProps {
  isMobile: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isDark: boolean;
  personality: Personality;
  setPersonality: (p: Personality) => void;
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  createNewChat: () => void;
  setVoiceMode: (v: boolean) => void;
  deleteChat: (id: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  saveChatTitle: (id: string) => void;
}

const formatTime = (time: number) => {
  const d = new Date(time);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const PERSONALITIES = [
  { id: "normal", label: "🙂 Normal", glow: "from-cyan-400 to-blue-500" },
  { id: "romantic", label: "❤️ Romantic", glow: "from-pink-400 to-rose-500" },
  { id: "caring", label: "🤍 Caring", glow: "from-emerald-400 to-teal-500" },
  { id: "playful", label: "😜 Playful", glow: "from-yellow-400 to-orange-500" },
  { id: "angry", label: "😠 Angry", glow: "from-red-400 to-rose-600" },
  { id: "command", label: "🤖 Command", glow: "from-violet-400 to-indigo-500" },
] as const;

const personalityChatHighlight: Record<Personality, string> = {
  normal: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400 shadow-[0_2px_10px_rgba(34,211,238,0.1)]",
  romantic: "border-pink-400/30 bg-pink-400/10 text-pink-400 shadow-[0_2px_10px_rgba(244,114,182,0.1)]",
  caring: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_2px_10px_rgba(52,211,153,0.1)]",
  playful: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400 shadow-[0_2px_10px_rgba(250,204,21,0.1)]",
  angry: "border-red-400/30 bg-red-400/10 text-red-400 shadow-[0_2px_10px_rgba(248,113,113,0.1)]",
  command: "border-violet-400/30 bg-violet-400/10 text-violet-400 shadow-[0_2px_10px_rgba(139,92,246,0.1)]",
};

export default function Sidebar({
  isMobile,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  isDark,
  personality,
  setPersonality,
  chats,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  setVoiceMode,
  deleteChat,
  editingChatId,
  setEditingChatId,
  editTitle,
  setEditTitle,
  saveChatTitle,
}: SidebarProps) {

  // Inner content rendered for both Desktop and Mobile sidebars
  const renderSidebarBody = (isMobileView: boolean) => {
    return (
      <>
        {/* 🔰 HEADER */}
        {isMobileView && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition cursor-pointer text-white/70 hover:text-white flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* 🔼 TOP CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="mt-2 space-y-3">
            <button
              onClick={() => {
                createNewChat();
                if (isMobileView) setMobileSidebarOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-black font-bold text-sm shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.4)] active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>✨</span> New Chat
            </button>

            <button
              onClick={() => {
                setVoiceMode(true);
                if (isMobileView) setMobileSidebarOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/95 text-sm font-medium hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📞</span> Call BUBU
            </button>


          </div>

          {/* 🎭 PERSONALITY CHANGER */}
          <div className="mt-6">
            <p className="text-xs mb-3 uppercase tracking-widest text-white/40 font-bold">
              Personality
            </p>

            <div className="flex gap-2 flex-wrap">
              {PERSONALITIES.map((p) => {
                const active = personality === p.id;
                const layoutIdString = isMobileView
                  ? "mobile-personality-glow"
                  : "personality-glow";

                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setPersonality(p.id as Personality)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold border overflow-hidden cursor-pointer transition-colors duration-300
                      ${
                        active
                          ? "text-black border-transparent"
                          : "text-white/70 border-white/10 hover:text-white"
                      }`}
                  >
                    {/* 🌈 ACTIVE GLOW */}
                    {active && (
                      <motion.div
                        layoutId={layoutIdString}
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${p.glow}`}
                        transition={{ type: "spring", stiffness: 200 }}
                      />
                    )}

                    <span className="relative z-10">{p.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 🧾 CHAT HISTORY */}
          <p className="mt-6 mb-3 text-xs uppercase tracking-widest text-white/40 font-bold">
            {isMobileView ? "Chats" : "Chat History"}
          </p>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 direction-rtl glass-scrollbar mt-1">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (confirm("Delete this chat?")) {
                    deleteChat(chat.id);
                  }
                }}
                className={`group direction-ltr w-full rounded-xl border px-3.5 py-2.5 transition-all duration-300 flex-shrink-0 ${
                  chat.id === currentChatId
                    ? personalityChatHighlight[personality]
                    : isDark
                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    : "bg-black/5 border-black/10 hover:bg-black/10 hover:border-black/20"
                }`}
              >
                <div
                  className="flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    if (isMobileView) setMobileSidebarOpen(false);
                  }}
                  onDoubleClick={() => {
                    setEditingChatId(chat.id);
                    setEditTitle(chat.title);
                  }}
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <span className={`text-sm transition-colors duration-300 ${chat.id === currentChatId ? "" : "text-white/40 group-hover:text-cyan-400"}`}>
                      💬
                    </span>

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
                        className="bg-transparent border-b border-cyan-400 text-sm outline-none w-full text-white"
                      />
                    ) : (
                      <span className={`truncate text-sm font-medium transition-colors duration-300 ${
                        chat.id === currentChatId ? "text-white" : "text-white/70 group-hover:text-white"
                      }`}>
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* RIGHT */}
                  <span className="text-[10px] text-white/40 whitespace-nowrap group-hover:text-white/60 transition-colors duration-300">
                    {formatTime(chat.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 🔽 BOTTOM FIXED LOGIN / LOGOUT */}
        <div className="mt-auto pt-4 flex flex-col">
          <AuthButton />
        </div>
      </>
    );
  };

  if (isMobile) {
    if (!mobileSidebarOpen) return null;
    return (
      <>
        {/* 🌑 OVERLAY */}
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
        {/* 📱 SIDEBAR PANEL */}
        <aside className="fixed top-0 left-0 bottom-0 z-50 w-72 p-6 bg-[#020617]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-[8px_0_24px_rgba(0,0,0,0.5)] transition duration-500">
          {renderSidebarBody(true)}
        </aside>
      </>
    );
  }

  // Desktop sidebar rendering
  return (
    <aside
      className={`w-80 h-full max-h-full overflow-hidden p-6 backdrop-blur-xl border-r flex flex-col flex-shrink-0 transition-colors duration-500 ${
        isDark ? "bg-[#020617]/30 border-white/10" : "bg-white/30 border-black/10"
      }`}
      style={{
        borderRightColor: isDark
          ? `rgba(var(--accent-${personalityThemeMap[personality].accent}), 0.15)`
          : `rgba(var(--accent-${personalityThemeMap[personality].accent}), 0.25)`,
      }}
    >
      {renderSidebarBody(false)}
    </aside>
  );
}
