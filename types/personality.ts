export type Personality =
  | "normal"
  | "romantic"
  | "caring"
  | "playful"
  | "angry"
  | "command";

export const personalityThemeMap = {
  normal: {
    accent: "cyan",
    userBubble: "bg-cyan-400 text-black",
    aiBubble: "bg-fuchsia-500/80 text-white",
    border: "border-cyan-400/40",
  },
  romantic: {
    accent: "pink",
    userBubble: "bg-pink-400 text-black",
    aiBubble: "bg-rose-500/80 text-white",
    border: "border-pink-400/40",
  },
  caring: {
    accent: "emerald",
    userBubble: "bg-emerald-400 text-black",
    aiBubble: "bg-teal-500/80 text-white",
    border: "border-emerald-400/40",
  },
  playful: {
    accent: "yellow",
    userBubble: "bg-yellow-400 text-black",
    aiBubble: "bg-orange-500/80 text-white",
    border: "border-yellow-400/40",
  },
  angry: {
    accent: "red",
    userBubble: "bg-red-400 text-black",
    aiBubble: "bg-rose-600/80 text-white",
    border: "border-red-400/40",
  },
  command: {
    accent: "violet",
    userBubble: "bg-violet-400 text-black",
    aiBubble: "bg-indigo-500/80 text-white",
    border: "border-violet-400/40",
  },
} as const;
