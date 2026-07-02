"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Personality } from "../../types/personality";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  personality: Personality;
}

const slides = [
  {
    title: "Welcome to BUBU AI",
    tagline: "Your Glowing Cybernetic Companion",
    icon: "🤖",
    content: (
      <div className="space-y-4 text-sm text-white/70 leading-relaxed">
        <p>
          Meet <span className="text-cyan-400 font-semibold">BUBU</span>, an interactive artificial intelligence voice console that adapts visually and acoustically to your conversations.
        </p>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
          <span className="text-xl">✨</span>
          <span>BUBU shifts styles dynamically based on sentiments, changing colors, voice pitches, and interaction settings.</span>
        </div>
      </div>
    ),
  },
  {
    title: "High-Tech HUD Customizer",
    tagline: "Total Layout Autonomy",
    icon: "🎨",
    content: (
      <div className="space-y-3 text-sm text-white/70 leading-relaxed">
        <p>You can custom-tailor the spatial dashboard layout to suit your workstation screen:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <span className="text-cyan-400 mt-0.5">🔹</span>
            <span><strong>Unlock Mode</strong>: Double-click anywhere on the empty screen background to toggle customization mode.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-cyan-400 mt-0.5">🔹</span>
            <span><strong>Widget Context Menu</strong>: Double-click or long-press on any card or toggle button to unlock or hide it.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-cyan-400 mt-0.5">🔹</span>
            <span><strong>Drag, Scale & Opacity</strong>: Move components freely, use holographic snap lines, and adjust scales/transparencies.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Immersive Voice Mode",
    tagline: "Full Vocal Conversation Console",
    icon: "📞",
    content: (
      <div className="space-y-4 text-sm text-white/70 leading-relaxed">
        <p>Talk to BUBU natively using real-time audio capture and speech synthesis:</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-1">
            <span className="text-base">📞 Full Call</span>
            <span>Click the call button at the footer to enter full-screen calling mode.</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-1">
            <span className="text-base">🎭 Accents</span>
            <span>Pitch and speech rate adjust responsively to BUBU's active emotions.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Modular Addons",
    tagline: "Boost Your Daily Flow",
    icon: "⚡",
    content: (
      <div className="space-y-3 text-sm text-white/70 leading-relaxed">
        <p>Access productivity and sensory plugins directly on your screen canvas:</p>
        <ul className="space-y-2 text-xs">
          <li className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="text-base">🧠</span>
            <span><strong>Memory Vault</strong>: Tracks facts BUBU remembers. Click to add/edit.</span>
          </li>
          <li className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="text-base">📝</span>
            <span><strong>Workspace Planner</strong>: Integrated Todo List & quick Scratchpad.</span>
          </li>
          <li className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="text-base">🎧</span>
            <span><strong>Ambient Player</strong>: Mix Lofi music tracks with Rain & Fireplace SFX.</span>
          </li>
        </ul>
      </div>
    ),
  },
];

const personalityRGB: Record<Personality, string> = {
  normal: "34, 211, 238",
  romantic: "244, 114, 182",
  caring: "52, 211, 153",
  playful: "250, 204, 21",
  angry: "248, 113, 113",
  command: "167, 139, 250",
};

export default function OnboardingModal({ isOpen, onClose, personality }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const currentRGB = personalityRGB[personality] || "34, 211, 238";

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Glowing backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative w-full max-w-lg p-8 rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] flex flex-col gap-6"
          style={{
            background: "rgba(10, 15, 30, 0.72)",
            border: `1px solid rgba(${currentRGB}, 0.25)`,
            boxShadow: `0 0 40px rgba(${currentRGB}, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
          }}
        >
          {/* Animated Personality Core Background Glow */}
          <div
            className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: `rgb(${currentRGB})` }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: `rgb(${currentRGB})` }}
          />

          {/* Skip Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-6 text-xs font-semibold tracking-wider text-white/40 hover:text-white/80 transition-colors cursor-pointer select-none"
          >
            SKIP GUIDE
          </button>

          {/* Slide Content Header */}
          <div className="flex items-center gap-4.5 mt-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border"
              style={{
                backgroundColor: `rgba(${currentRGB}, 0.08)`,
                borderColor: `rgba(${currentRGB}, 0.2)`,
              }}
            >
              {slides[currentSlide].icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {slides[currentSlide].title}
              </h2>
              <p
                className="text-xs font-medium tracking-wider uppercase mt-0.5"
                style={{ color: `rgb(${currentRGB})` }}
              >
                {slides[currentSlide].tagline}
              </p>
            </div>
          </div>

          {/* Slide Main Body (with exit/entry animations) */}
          <div className="relative min-h-[170px] flex items-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {slides[currentSlide].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Footer / Pagination Controls */}
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
            {/* Step Indicators */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: currentSlide === index ? "18px" : "6px",
                    backgroundColor: currentSlide === index ? `rgb(${currentRGB})` : "rgba(255, 255, 255, 0.15)",
                  }}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: `rgb(${currentRGB})`,
                  boxShadow: `0 4px 12px rgba(${currentRGB}, 0.25)`,
                }}
              >
                {currentSlide === slides.length - 1 ? "Let's Go!" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
