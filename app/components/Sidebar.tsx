"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  onOpenMemory?: () => void;
  affectionScore: number;
  style?: React.CSSProperties;
  className?: string;
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

const personalityCardConfig: Record<Personality, {
  border: string;
  bgActive: string;
  bgHover: string;
  glow: string;
  accent: string;
  badge: string;
  badgeText: string;
  emoji: string;
}> = {
  normal: {
    border: "border-cyan-500/20",
    bgActive: "bg-cyan-950/35 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]",
    bgHover: "hover:bg-cyan-950/15 hover:border-cyan-500/20",
    glow: "shadow-[0_0_15px_rgba(34,211,238,0.1)]",
    accent: "bg-cyan-400",
    badge: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    badgeText: "Normal Mode",
    emoji: "🙂",
  },
  romantic: {
    border: "border-pink-500/20",
    bgActive: "bg-pink-950/35 border-pink-500/40 shadow-[0_0_15px_rgba(244,114,182,0.15)]",
    bgHover: "hover:bg-pink-950/15 hover:border-pink-500/20",
    glow: "shadow-[0_0_15px_rgba(244,114,182,0.1)]",
    accent: "bg-pink-400",
    badge: "bg-pink-400/10 text-pink-300 border-pink-400/20",
    badgeText: "Romantic Mode",
    emoji: "💖",
  },
  caring: {
    border: "border-emerald-500/20",
    bgActive: "bg-emerald-950/35 border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.15)]",
    bgHover: "hover:bg-emerald-950/15 hover:border-emerald-500/20",
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.1)]",
    accent: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    badgeText: "Caring Mode",
    emoji: "🥰",
  },
  playful: {
    border: "border-yellow-500/20",
    bgActive: "bg-yellow-950/35 border-yellow-500/40 shadow-[0_0_15px_rgba(250,204,21,0.15)]",
    bgHover: "hover:bg-yellow-950/15 hover:border-yellow-500/20",
    glow: "shadow-[0_0_15px_rgba(250,204,21,0.1)]",
    accent: "bg-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    badgeText: "Playful Mode",
    emoji: "😜",
  },
  angry: {
    border: "border-red-500/20",
    bgActive: "bg-red-950/35 border-red-500/40 shadow-[0_0_15px_rgba(248,113,113,0.15)]",
    bgHover: "hover:bg-red-950/15 hover:border-red-500/20",
    glow: "shadow-[0_0_15px_rgba(248,113,113,0.1)]",
    accent: "bg-red-400",
    badge: "bg-red-400/10 text-red-300 border-red-400/20",
    badgeText: "Angry Mode",
    emoji: "😠",
  },
  command: {
    border: "border-violet-500/20",
    bgActive: "bg-violet-950/35 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    bgHover: "hover:bg-violet-950/15 hover:border-violet-500/20",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    accent: "bg-violet-400",
    badge: "bg-violet-400/10 text-violet-300 border-violet-400/20",
    badgeText: "Command Mode",
    emoji: "🤖",
  },
};

export const getAffectionDetails = (score: number) => {
  if (score < 20) {
    return {
      title: "Distant / Cold",
      emoji: "❄️",
      colorClass: "from-blue-400 to-cyan-500",
      glowColor: "rgba(34, 211, 238, 0.2)",
      pulseDuration: 2.5,
    };
  } else if (score < 40) {
    return {
      title: "Acquaintance",
      emoji: "👤",
      colorClass: "from-slate-400 to-slate-200",
      glowColor: "rgba(255, 255, 255, 0.1)",
      pulseDuration: 1.8,
    };
  } else if (score < 60) {
    return {
      title: "Friend",
      emoji: "🙂",
      colorClass: "from-emerald-400 to-green-500",
      glowColor: "rgba(52, 211, 153, 0.2)",
      pulseDuration: 1.2,
    };
  } else if (score < 80) {
    return {
      title: "Best Friend",
      emoji: "💖",
      colorClass: "from-pink-400 to-rose-500",
      glowColor: "rgba(244, 114, 182, 0.35)",
      pulseDuration: 0.7,
    };
  } else {
    return {
      title: "Soulmate",
      emoji: "💞",
      colorClass: "from-red-500 via-rose-500 to-pink-500",
      glowColor: "rgba(239, 68, 68, 0.5)",
      pulseDuration: 0.4,
    };
  }
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
  onOpenMemory,
  affectionScore,
  style,
  className,
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
          </div>

          {/* 🎭 PERSONALITY CHANGER (Mobile Only) */}
          {isMobileView && (
            <div className="mt-6">
              <p className="text-[10px] mb-3 uppercase tracking-widest text-white/40 font-extrabold flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
                Companion Type
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
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold border overflow-hidden cursor-pointer transition-all duration-300 flex items-center gap-1.5
                        ${
                          active
                            ? "text-black border-transparent font-bold"
                            : "text-white/70 border-white/10 hover:text-white bg-white/[0.01] hover:bg-white/[0.04]"
                        }`}
                    >
                      {/* Active glow bezel */}
                      {active && (
                        <motion.div
                          layoutId={layoutIdString}
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${p.glow}`}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        />
                      )}

                      {/* Blinking select indicator LED */}
                      {active && (
                        <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,1)] animate-pulse" />
                      )}

                      <span className="relative z-10">{p.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🧾 CHAT HISTORY */}
          <p className="mt-6 mb-3 text-xs uppercase tracking-widest text-white/40 font-bold">
            {isMobileView ? "Chats" : "Chat History"}
          </p>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 glass-scrollbar mt-1">
            {chats.map((chat) => {
              const chatPersonality = chat.personality || "normal";
              const config = personalityCardConfig[chatPersonality];
              const isActive = chat.id === currentChatId;
              const lastMsg = chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].text 
                : "No messages yet";
              
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative w-full rounded-2xl border pl-4 pr-3.5 py-3 transition-all duration-300 flex-shrink-0 cursor-pointer overflow-hidden
                    ${isActive
                      ? `${config.bgActive} border-transparent`
                      : isDark
                        ? `bg-white/[0.02] border-white/5 ${config.bgHover}`
                        : `bg-black/[0.02] border-black/5 ${config.bgHover}`
                    }`}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    if (isMobileView) setMobileSidebarOpen(false);
                  }}
                >
                  {/* Left accent strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300
                    ${isActive ? `${config.accent} opacity-100` : `bg-white/10 group-hover:${config.accent} group-hover:opacity-60`}
                  `} />

                  {/* Content Container */}
                  <div className="flex flex-col gap-1.5">
                    {/* Top Row: Title / Time / Actions */}
                    <div className="flex items-center justify-between gap-2">
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
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/5 border border-cyan-400/40 rounded-lg px-2 py-0.5 text-xs outline-none w-full text-white"
                        />
                      ) : (
                        <span className={`truncate text-sm font-semibold tracking-wide transition-colors duration-300 flex-1
                          ${isActive ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                          {chat.title}
                        </span>
                      )}

                      {/* Time or Quick Actions (hidden on non-hover desktop, always shown mobile) */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-white/35 lg:group-hover:hidden whitespace-nowrap transition-all duration-300">
                          {formatTime(chat.createdAt)}
                        </span>
                        
                        <div className="flex lg:hidden lg:group-hover:flex items-center gap-1 transition-all duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditTitle(chat.title);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-cyan-400 transition"
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this chat?")) {
                                deleteChat(chat.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Last message snippet */}
                    <p className={`text-xs truncate transition-colors duration-300 leading-normal
                      ${isActive ? "text-white/60" : "text-white/40 group-hover:text-white/50"}`}>
                      {lastMsg}
                    </p>

                    {/* Bottom Row: Companion mode badge */}
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${config.badge}`}>
                        <span>{config.emoji}</span>
                        <span>{config.badgeText}</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>


      </>
    );
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* 🌑 OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* 📱 SIDEBAR PANEL */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 p-6 border-r flex flex-col shadow-[8px_0_24px_rgba(0,0,0,0.5)] custom-glass-panel"
            >
              {renderSidebarBody(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar rendering
  return (
    <aside
      className={`max-h-full overflow-hidden p-6 border flex flex-col flex-shrink-0 transition-colors duration-500 custom-glass-panel ${className || "w-80 h-full border-r"}`}
      style={{
        borderRightColor: isDark
          ? `rgba(var(--accent-${personalityThemeMap[personality].accent}), 0.15)`
          : `rgba(var(--accent-${personalityThemeMap[personality].accent}), 0.25)`,
        ...style
      }}
    >
      {renderSidebarBody(false)}
    </aside>
  );
}
