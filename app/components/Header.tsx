"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Personality, personalityThemeMap } from "../../types/personality";
import { useAuth } from "../../lib/context/AuthContext";
import { getAffectionDetails } from "./Sidebar";
import AuthButton from "./AuthButton";

interface HeaderProps {
  isMobile: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  personality: Personality;
  isDark: boolean;
  ambientPlayerOpen: boolean;
  setAmbientPlayerOpen: (open: boolean) => void;
  affectionScore: number;
  style?: React.CSSProperties;
  className?: string;
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
  isDark,
  ambientPlayerOpen,
  setAmbientPlayerOpen,
  affectionScore,
  style,
  className,
}: HeaderProps) {
  const currentStyles = personalityThemeMap[personality];
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header
      className={`flex items-center justify-between px-6 border transition-colors duration-500 z-30 custom-glass-panel ${className || "h-16 flex-shrink-0 border-b"}`}
      style={{
        borderBottomColor: isDark
          ? `rgba(var(--accent-${currentStyles.accent}), 0.15)`
          : `rgba(var(--accent-${currentStyles.accent}), 0.25)`,
        ...style
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

        <div className="flex items-center gap-2 select-none">
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
        {isMobile && (
          <>
            {/* 🎧 Ambient Player */}
            <button
              onClick={() => setAmbientPlayerOpen(!ambientPlayerOpen)}
              className={`w-9 h-9 rounded-xl border text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md backdrop-blur-md
                ${ambientPlayerOpen 
                  ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.25)]" 
                  : isDark 
                    ? "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:text-white" 
                    : "bg-black/5 border-black/10 text-black/90 hover:bg-black/10 hover:text-black"
                }`}
              title="Ambient Music"
            >
              🎧
            </button>

          </>
        )}

        {/* Vertical Separator */}
        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* Online indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-75 mr-1 select-none">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">Online</span>
        </div>

        {/* 👤 PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 flex items-center justify-center text-sm font-semibold transition-all duration-300 cursor-pointer active:scale-95 shadow-md"
          >
            {user ? (
              <span className="text-white select-none">
                {user.email ? user.email[0].toUpperCase() : "👤"}
              </span>
            ) : (
              <span className="select-none text-white/70">👤</span>
            )}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-0 mt-2 w-64 p-4 rounded-2xl border border-white/10 bg-[#090d16]/98 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 text-white flex flex-col gap-3.5"
              >
                {/* Account Profile Header */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/35 flex items-center justify-center font-bold text-cyan-300 select-none">
                    {user && user.email ? user.email[0].toUpperCase() : "G"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">
                      {user && user.email ? user.email : "Guest Partner"}
                    </h4>
                    <p className="text-[9px] text-white/30 tracking-wide uppercase font-semibold">Active Session</p>
                  </div>
                </div>

                {/* Housed Bond Meter in dropdown */}
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[9px] text-white/40 font-bold uppercase tracking-wider select-none">
                    <span>Bond Status</span>
                    <span>{affectionScore}/100</span>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-lg">{getAffectionDetails(affectionScore).emoji}</span>
                    <span className="text-xs font-semibold">{getAffectionDetails(affectionScore).title}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1 relative">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getAffectionDetails(affectionScore).colorClass}`}
                      style={{ width: `${affectionScore}%` }}
                    />
                  </div>
                </div>

                {/* Login/Logout Button Wrapper */}
                <div className="flex flex-col pt-1.5">
                  <AuthButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
