"use client";
import { motion } from "framer-motion";
import { Personality } from "../../types/personality";

type AIState = "idle" | "listening" | "thinking" | "speaking";

type EmotionState = "normal" | "romantic" | "caring" | "playful" | "angry" | "thinking" | "command";

export default function AIVatar({
  state,
  personality,
  energy,
  subtitle = "",
}: {
  state: AIState;
  personality: Personality;
  energy: number;
  subtitle?: string;
}) {
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
        // Heartbeat pulse scaling
        return {
          scale: [1, 1.08, 1, 1.08, 1],
          transition: {
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "playful":
        // Bouncing up and down
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
        // Shaking vibration
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
        // Smooth continuous spin
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
        // Soft standard pulse
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

  return (
    <div className="relative flex items-center justify-center px-4 select-none">
      {/* Outer Halo Glow */}
      <motion.div
        className="absolute w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full blur-2xl"
        style={{
          background: emotionGlowColors[emotion],
        }}
        animate={{
          scale: 1 + energy * 0.5,
          opacity: 0.4 + energy * 0.4,
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2 - energy,
          ease: "easeInOut",
        }}
      />

      {/* Core Avatar Sphere */}
      <motion.div
        className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br ${emotionGradients[emotion]} flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl font-bold shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20`}
        animate={getAnimationProps()}
      >
        <span className="drop-shadow-md">{emotionEmojis[emotion]}</span>
      </motion.div>
    </div>
  );
}
