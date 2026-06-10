"use client";

import NeuralOrb from "./NeuralOrb";
import AIVatar from "./AIVatar";
import { Personality } from "../../types/personality";

interface DesktopVisualizerProps {
  state: "idle" | "listening" | "thinking" | "speaking";
  energyLevel: number;
  personality: Personality;
}

export default function DesktopVisualizer({
  state,
  energyLevel,
  personality,
}: DesktopVisualizerProps) {
  return (
    <div className="flex-1 relative flex items-center justify-center overflow-hidden pointer-events-none">
      {/* 🌐 NEURAL ORB */}
      <NeuralOrb state={state} energy={energyLevel} personality={personality} />

      {/* 🧍 AVATAR FLOATING OVER ORB */}
      <div className="relative z-10 pointer-events-auto">
        <AIVatar
          state={state}
          energy={energyLevel}
          personality={personality}
        />
      </div>
    </div>
  );
}
