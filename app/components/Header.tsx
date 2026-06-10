"use client";

import { motion } from "framer-motion";
import { Personality, personalityThemeMap } from "../../types/personality";

interface HeaderProps {
  isMobile: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  personality: Personality;
  voiceMode: boolean;
  setVoiceMode: (v: boolean) => void;
  isDark: boolean;
}

const personalityLabels: Record<Personality, string> = {
  normal: "Normal Mode",
  romantic: "Romantic Mode",
  caring: "Caring Mode",
  playful: "Playful Mode",
  angry: "Angry Mode",
  command: "Command Mode",
};

const personalityPillGlow: Record<Personality, string> = {
  normal: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30 shadow-[0_0_8px_rgba(34,211,238,0.3)]",
  romantic: "bg-pink-400/20 text-pink-400 border-pink-400/30 shadow-[0_0_8px_rgba(244,114,182,0.3)]",
  caring: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
  playful: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30 shadow-[0_0_8px_rgba(250,204,21,0.3)]",
  angry: "bg-red-400/20 text-red-400 border-red-400/30 shadow-[0_0_8px_rgba(248,113,113,0.3)]",
  command: "bg-violet-400/20 text-violet-400 border-violet-400/30 shadow-[0_0_8px_rgba(167,139,250,0.3)]",
};

const accentTextClass: Record<Personality, string> = {
  normal: "text-cyan-400",
  romantic: "text-pink-400",
  caring: "text-emerald-400",
  playful: "text-yellow-400",
  angry: "text-red-400",
  command: "text-violet-400",
};

export default function Header({
  isMobile,
  setMobileSidebarOpen,
  personality,
  voiceMode,
  setVoiceMode,
  isDark,
}: HeaderProps) {
  const currentStyles = personalityThemeMap[personality];

  return (
    <header
      className={`h-16 flex-shrink-0 flex items-center justify-between px-6 backdrop-blur-xl border-b transition-colors duration-500 z-30 ${
        isDark
          ? "bg-black/30 border-white/10"
          : "bg-white/30 border-black/10"
      }`}
      style={{
        borderBottomColor: isDark
          ? `rgba(var(--accent-${currentStyles.accent}), 0.15)`
          : `rgba(var(--accent-${currentStyles.accent}), 0.25)`,
      }}
    >
      {/* 🚀 LEFT SECTION: MOBILE MENU + TITLE */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-300 cursor-pointer text-white flex items-center justify-center shadow-md backdrop-blur-md"
            aria-label="Open Menu"
          >
            <svg
              className={`w-5 h-5 transition-colors duration-500 ${accentTextClass[personality]}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Logo animation */}
          <span className="text-xl animate-pulse">🤖</span>
          <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
            BUBU AI
          </span>
        </div>
      </div>

      {/* 🎭 CENTER SECTION: PERSONALITY BADGE */}
      <div className="hidden sm:flex items-center">
        <motion.div
          key={personality}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold select-none ${personalityPillGlow[personality]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
          <span>{personalityLabels[personality]}</span>
        </motion.div>
      </div>

      {/* 📞 RIGHT SECTION: QUICK LAUNCH */}
      <div className="flex items-center gap-3">
        {!voiceMode && (
          <button
            onClick={() => setVoiceMode(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur transition-all active:scale-95 cursor-pointer ${
              isDark
                ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                : "bg-black/5 border-black/10 text-black hover:bg-black/10"
            }`}
          >
            📞 Call BUBU
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-75">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-white font-medium">Online</span>
        </div>
      </div>
    </header>
  );
}
