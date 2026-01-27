"use client";
import { motion } from "framer-motion";

type AIState = "idle" | "listening" | "thinking" | "speaking";
type Personality =
  | "normal"
  | "romantic"
  | "caring"
  | "playful"
  | "angry";

export default function AIVatar({
  state,
  personality,
  energy,
}: {
  state: AIState;
  personality: Personality;
  energy: number;
}) {

  const personalityColors: Record<Personality, string> = {
    normal: "from-cyan-400 to-fuchsia-500",
    romantic: "from-pink-400 to-rose-500",
    caring: "from-emerald-400 to-teal-500",
    playful: "from-yellow-400 to-orange-500",
    angry: "from-red-500 to-orange-600",
  };
const isMobile =
  typeof window !== "undefined" &&
  window.innerWidth < 640;

  return (
<div className="relative flex items-center justify-center px-4">

      {/* Outer Glow */}
      <motion.div
className="
  absolute
  w-36 h-36
  sm:w-44 sm:h-44
  md:w-48 md:h-48
  lg:w-52 lg:h-52
  rounded-full blur-2xl
"

        style={{
          background:
            personality === "romantic"
              ? "rgba(255,105,180,0.35)"
              : personality === "angry"
              ? "rgba(255,60,60,0.35)"
              : "rgba(56,189,248,0.3)",
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

      {/* Core Avatar */}
      <motion.div
className={`
  w-24 h-24
  sm:w-32 sm:h-32
  md:w-36 md:h-36
  lg:w-40 lg:h-40
  rounded-full
  bg-gradient-to-br ${personalityColors[personality]}
  flex items-center justify-center
  text-3xl sm:text-4xl lg:text-5xl
  font-bold
`}

     animate={{
  rotate: state === "thinking" ? 360 : 0,
  scale: 1 + energy * 0.15,
}}

       transition={{
  repeat: Infinity,
  duration: state === "thinking" ? 6 : 1.6,
  ease: "linear",
}}

      >
        A
      </motion.div>
    </div>
  );
}
