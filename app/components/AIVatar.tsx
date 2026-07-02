"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Personality } from "../../types/personality";

type AIState = "idle" | "listening" | "thinking" | "speaking";
type EmotionState = "normal" | "romantic" | "caring" | "playful" | "angry" | "thinking" | "command";

const PERSONALITY_NODES = [
  { id: "normal", emoji: "🙂", color: "from-cyan-400 to-blue-500", glow: "rgba(34,211,238,0.4)" },
  { id: "romantic", emoji: "💖", color: "from-pink-400 to-rose-500", glow: "rgba(244,114,182,0.4)" },
  { id: "caring", emoji: "🥰", color: "from-emerald-400 to-teal-500", glow: "rgba(16,185,129,0.4)" },
  { id: "playful", emoji: "😜", color: "from-yellow-400 to-amber-500", glow: "rgba(234,179,8,0.4)" },
  { id: "angry", emoji: "😡", color: "from-red-500 to-rose-600", glow: "rgba(239,68,68,0.4)" },
  { id: "command", emoji: "🤖", color: "from-violet-400 to-indigo-500", glow: "rgba(139,92,246,0.4)" },
];

export default function AIVatar({
  state,
  personality,
  energy,
  subtitle = "",
  setPersonality,
}: {
  state: AIState;
  personality: Personality;
  energy: number;
  subtitle?: string;
  setPersonality?: (p: Personality) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [clickedOpen, setClickedOpen] = useState(false);

  const getCallEmotion = (): EmotionState => {
    if (state === "thinking") return "thinking";

    const text = subtitle.toLowerCase();

    // Check keywords in subtitle text for real-time response sentiment
    if (
      text.includes("yay") ||
      text.includes("omg") ||
      text.includes("excited") ||
      text.includes("playful") ||
      text.includes("teasing") ||
      text.includes("naughty") ||
      text.includes("😜") ||
      text.includes("😏")
    ) {
      return "playful";
    }
    if (
      text.includes("sorry") ||
      text.includes("sad") ||
      text.includes("tired") ||
      text.includes("hurt") ||
      text.includes("angry") ||
      text.includes("hmph") ||
      text.includes("don't talk") ||
      text.includes("😡") ||
      text.includes("😤")
    ) {
      return "angry";
    }
    if (
      text.includes("love") ||
      text.includes("babe") ||
      text.includes("baby") ||
      text.includes("honey") ||
      text.includes("darling") ||
      text.includes("sweetheart") ||
      text.includes("❤️") ||
      text.includes("😘")
    ) {
      return "romantic";
    }

    // Default to the current personality setting
    if (personality === "romantic") return "romantic";
    if (personality === "playful") return "playful";
    if (personality === "angry") return "angry";
    if (personality === "caring") return "caring";
    if (personality === "command") return "command";
    return "normal";
  };

  const emotion = getCallEmotion();

  // Color mappings
  const emotionGlowColors: Record<EmotionState, string> = {
    normal: "rgba(56,189,248,0.4)", // Cyan
    romantic: "rgba(244,114,182,0.5)", // Blush Pink
    caring: "rgba(16,185,129,0.4)", // Emerald
    playful: "rgba(234,179,8,0.5)", // Glow Yellow
    angry: "rgba(239,68,68,0.6)", // Red Flash
    thinking: "rgba(34,211,238,0.45)", // Cyan/Teal
    command: "rgba(139,92,246,0.4)", // Violet
  };

  const emotionGradients: Record<EmotionState, string> = {
    normal: "from-cyan-400 to-blue-500",
    romantic: "from-pink-400 to-rose-500",
    caring: "from-emerald-400 to-teal-500",
    playful: "from-yellow-400 to-amber-500",
    angry: "from-red-500 to-rose-600",
    thinking: "from-cyan-400 to-blue-600",
    command: "from-violet-400 to-indigo-500",
  };

  const emotionEmojis: Record<EmotionState, string> = {
    normal: "😊",
    romantic: "🥰",
    caring: "🤗",
    playful: "😜",
    angry: "😤",
    thinking: "🤔",
    command: "🤖",
  };

  // Dynamic animations based on current emotion state
  const getAnimationProps = (): any => {
    switch (emotion) {
      case "romantic":
        return {
          scale: [1, 1.08, 1, 1.08, 1],
          transition: {
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "playful":
        return {
          y: [0, -12, 0],
          scale: 1 + energy * 0.12,
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "angry":
        return {
          x: [-3, 3, -3, 3, -2, 2, 0],
          scale: 1.05 + energy * 0.1,
          transition: {
            duration: 0.4,
            repeat: Infinity,
            ease: "linear",
          },
        };
      case "thinking":
        return {
          rotate: 360,
          scale: 1 + energy * 0.1,
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          },
        };
      default:
        return {
          scale: 1 + energy * 0.15,
          transition: {
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
    }
  };

  const isWheelVisible = !!setPersonality && (hovered || clickedOpen);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setClickedOpen(false);
      }}
      className="relative flex items-center justify-center select-none w-80 h-80"
    >
      {/* 1. Outer Halo Glow */}
      <motion.div
        className="absolute w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full blur-2xl pointer-events-none"
        style={{
          background: emotionGlowColors[emotion],
        }}
        animate={{
          scale: 1 + energy * 0.4,
          opacity: 0.35 + energy * 0.45,
        }}
        transition={{
          repeat: Infinity,
          duration: 2.0 - energy * 0.8,
          ease: "easeInOut",
        }}
      />

      {/* 2. Audio Wave Ripple Rings */}
      <motion.div
        className="absolute w-[120%] h-[120%] rounded-full border pointer-events-none"
        style={{
          borderColor: emotionGlowColors[emotion].replace(/0\.\d+/, "0.15"),
          boxShadow: `0 0 15px ${emotionGlowColors[emotion].replace(/0\.\d+/, "0.08")}`,
        }}
        animate={{
          scale: [1, 1.35 + energy * 0.4],
          opacity: [0.75, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="absolute w-[140%] h-[140%] rounded-full border pointer-events-none"
        style={{
          borderColor: emotionGlowColors[emotion].replace(/0\.\d+/, "0.08"),
        }}
        animate={{
          scale: [1, 1.6 + energy * 0.5],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.4,
        }}
      />

      {/* 3. Tilted Gyroscope Rings */}
      <motion.div
        className="absolute w-[108%] h-[108%] rounded-full border border-dashed pointer-events-none"
        style={{
          borderColor: emotionGlowColors[emotion].replace(/0\.\d+/, "0.25"),
          transform: "rotateX(60deg) rotateY(15deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[114%] h-[114%] rounded-full border border-double pointer-events-none"
        style={{
          borderColor: emotionGlowColors[emotion].replace(/0\.\d+/, "0.15"),
          transform: "rotateX(-45deg) rotateY(-30deg)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* 4. Core Glass Sphere Container */}
      <motion.div
        onClick={() => {
          if (setPersonality) {
            setClickedOpen(!clickedOpen);
          }
        }}
        className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full flex items-center justify-center overflow-hidden border border-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-white/5 cursor-pointer z-20"
        style={{
          boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 8px 24px rgba(255,255,255,0.15), 0 0 30px ${emotionGlowColors[emotion].replace(/0\.\d+/, "0.2")}`,
        }}
        animate={getAnimationProps()}
      >
        {/* Glowing Inner Core (Breathing & Rotating) */}
        <motion.div
          className={`absolute w-3/4 h-3/4 rounded-full bg-gradient-to-br ${emotionGradients[emotion]} filter blur-[2px] opacity-75`}
          animate={{
            scale: [0.92, 1.08 + energy * 0.15, 0.92],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 12, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Emoji Glass Overlay */}
        <div className="relative z-10 select-none pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <span className="text-4xl sm:text-5xl lg:text-6xl">{emotionEmojis[emotion]}</span>
        </div>

        {/* Glass Shine Gloss Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none z-20" />
        <motion.div
          className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-25 pointer-events-none"
          animate={{
            left: ["150%", "-100%"],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 2,
          }}
        />
      </motion.div>

      {/* 5. Orbital Personality HUD Wheel */}
      {setPersonality && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          {/* Orbital dashed path ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isWheelVisible ? 0.35 : 0, 
              scale: isWheelVisible ? 1 : 0.8,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute w-[270px] h-[270px] rounded-full border border-dashed border-white/40 pointer-events-none"
          />

          {/* Interactive nodes */}
          {PERSONALITY_NODES.map((node, idx) => {
            const angle = (idx * 60 - 90) * (Math.PI / 180);
            const radius = 135;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isNodeActive = personality === node.id;

            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={
                  isWheelVisible 
                    ? { opacity: 1, x, y, scale: 1 } 
                    : { opacity: 0, x: 0, y: 0, scale: 0 }
                }
                whileHover={{ scale: 1.25, zIndex: 40 }}
                whileTap={{ scale: 0.92 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: isWheelVisible ? idx * 0.04 : 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonality(node.id as Personality);
                  setClickedOpen(false);
                }}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer pointer-events-auto border transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-[#0b0f19]/90
                  ${isNodeActive 
                    ? `border-white ring-2 ring-white/20 scale-110` 
                    : `border-white/10 hover:border-white/30`
                  }`}
                style={{
                  boxShadow: isNodeActive 
                    ? `0 0 15px ${node.glow}, inset 0 0 6px ${node.glow}` 
                    : `0 4px 12px rgba(0,0,0,0.5)`,
                }}
                title={`${node.id.toUpperCase()} MODE`}
              >
                {/* Active indicator dot */}
                {isNodeActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-1 ring-black/40 animate-pulse shadow-[0_0_6px_rgba(255,255,255,1)]" />
                )}
                <span className="relative z-10">{node.emoji}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
