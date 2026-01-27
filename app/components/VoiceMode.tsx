"use client";

import AIVatar from "./AIVatar";
import NeuralOrb from "./NeuralOrb";



type Personality =
  | "normal"
  | "romantic"
  | "caring"
  | "playful"
  | "angry";

type AIState = "idle" | "listening" | "thinking" | "speaking";

export default function VoiceMode({
  state,
  energy,
  subtitle,
  personality,
  onMicClick,
  onExit,
}: {
  state: AIState;
  energy: number; // ✅ ADD THIS
  subtitle: string;
  personality: Personality;
  onMicClick: () => void;
  onExit: () => void;
}) {

  return (
<div className="fixed inset-0 z-50 flex flex-col bg-[#020617] min-h-dvh w-full overflow-hidden pb-safe">


      {/* ❌ EXIT */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 text-xs opacity-70 hover:opacity-100 z-50"
      >
        ✖ Exit
      </button>

{/* 🤖 CENTER AVATAR + CORE ORB */}
<div className="relative flex-1 flex items-center justify-center">
  
  {/* 🌐 NEURAL ORB */}
  <NeuralOrb
    state={state}
    energy={energy}
    fullscreen
  />

  {/* 🧍 AVATAR (AB ORB KE UPAR FLOAT KAREGA) */}
  <div className="relative z-10">
    <AIVatar
      state={state}
      energy={energy}
      personality={personality}
    />
  </div>
</div>


      {/* 💬 SUBTITLE */}
      <div className="px-6 text-center">
        <p className="text-sm opacity-80 max-w-md mx-auto">
          {subtitle || "Say something…"}
        </p>
      </div>

      {/* 🎙 MIC BUTTON (SAFE AREA) */}
      <div className="pb-safe pt-6 flex justify-center">
        <button
          onClick={onMicClick}
          className="px-8 py-4 rounded-full bg-cyan-400 text-black font-semibold shadow-lg active:scale-95 transition"
        >
          🎙 Talk to BUBU
        </button>
      </div>
    </div>
  );
}
