"use client";

import NeuralOrb from "./NeuralOrb";
import AIVatar from "./AIVatar";
import { Personality } from "../../types/personality";

interface DesktopVisualizerProps {
  state: "idle" | "listening" | "thinking" | "speaking";
  energyLevel: number;
  personality: Personality;
  setPersonality?: (p: Personality) => void;
  avatarSize?: "small" | "medium" | "large";
  glowLevel?: "off" | "soft" | "neon";
  style?: React.CSSProperties;
  className?: string;
}

export default function DesktopVisualizer({
  state,
  energyLevel,
  personality,
  setPersonality,
  avatarSize = "medium",
  glowLevel = "soft",
  style,
  className,
}: DesktopVisualizerProps) {
  let scaleClass = "scale-[1.0]";
  if (avatarSize === "small") scaleClass = "scale-[0.85]";
  if (avatarSize === "large") scaleClass = "scale-[1.15]";

  return (
    <div className={`relative flex items-center justify-center overflow-visible pointer-events-none transition-all duration-500 ${scaleClass} ${className || "w-full h-80 lg:h-full lg:flex-1 flex-shrink-0"}`} style={style}>
      {/* 🌐 NEURAL ORB */}
      {glowLevel !== "off" && (
        <NeuralOrb state={state} energy={energyLevel} personality={personality} />
      )}

      {/* 🧍 AVATAR FLOATING OVER ORB */}
      <div className="relative z-10 pointer-events-auto">
        <AIVatar
          state={state}
          energy={energyLevel}
          personality={personality}
          setPersonality={setPersonality}
        />
      </div>
    </div>
  );
}
