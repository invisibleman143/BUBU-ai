"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AmbientPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const MUSIC_TRACKS = [
  { id: "cozy", name: "☕ Cozy Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "sunset", name: "🌅 Sunset Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "midnight", name: "🌌 Midnight Drive", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
];

const AMBIENT_FX = [
  { id: "rain", name: "🌧️ Rainfall", url: "https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav" },
  { id: "fire", name: "🔥 Campfire", url: "https://assets.mixkit.co/active_storage/sfx/2432/2432-84.wav" },
];

export default function AmbientPlayer({ isOpen, onClose, style, className }: AmbientPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string>("cozy");
  const [selectedFX, setSelectedFX] = useState<string | null>(null);

  const [musicVolume, setMusicVolume] = useState(0.4);
  const [fxVolume, setFxVolume] = useState(0.3);

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const fxAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    musicAudioRef.current = new Audio();
    musicAudioRef.current.loop = true;

    fxAudioRef.current = new Audio();
    fxAudioRef.current.loop = true;

    return () => {
      musicAudioRef.current?.pause();
      fxAudioRef.current?.pause();
    };
  }, []);

  // Sync music track selection and playing state
  useEffect(() => {
    if (!musicAudioRef.current) return;

    const track = MUSIC_TRACKS.find((t) => t.id === selectedMusic);
    if (track) {
      const wasPlaying = isPlaying;
      musicAudioRef.current.src = track.url;
      musicAudioRef.current.volume = musicVolume;
      if (wasPlaying) {
        musicAudioRef.current.play().catch((e) => console.log("Audio play blocked", e));
      }
    }
  }, [selectedMusic]);

  // Sync FX track selection and playing state
  useEffect(() => {
    if (!fxAudioRef.current) return;

    if (selectedFX) {
      const fx = AMBIENT_FX.find((f) => f.id === selectedFX);
      if (fx) {
        const wasPlaying = isPlaying;
        fxAudioRef.current.src = fx.url;
        fxAudioRef.current.volume = fxVolume;
        if (wasPlaying) {
          fxAudioRef.current.play().catch((e) => console.log("Audio play blocked", e));
        }
      }
    } else {
      fxAudioRef.current.pause();
    }
  }, [selectedFX]);

  // Sync Volume levels
  useEffect(() => {
    if (musicAudioRef.current) musicAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    if (fxAudioRef.current) fxAudioRef.current.volume = fxVolume;
  }, [fxVolume]);

  // Handle master play/pause
  const togglePlay = () => {
    if (!musicAudioRef.current || !fxAudioRef.current) return;

    if (isPlaying) {
      musicAudioRef.current.pause();
      fxAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Play selected music if not set to None
      if (selectedMusic) {
        musicAudioRef.current.play().catch((e) => console.log("Playback error", e));
      }
      // Play selected ambient FX if any
      if (selectedFX) {
        fxAudioRef.current.play().catch((e) => console.log("Playback error", e));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className={`z-40 p-5 rounded-2xl bg-[#090d16]/95 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col gap-4 text-white ${className || "absolute bottom-6 right-6 w-80"}`}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎧</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Ambient Music</h4>
            <p className="text-[10px] text-white/40">Cozy background beats & loops</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>

      {/* Playing state visualizer */}
      <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">Currently Playing</span>
          <span className="text-xs font-semibold truncate max-w-[150px]">
            {isPlaying ? MUSIC_TRACKS.find(t => t.id === selectedMusic)?.name : "Paused"}
          </span>
        </div>

        {/* Master Play Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 shadow-md
            ${isPlaying ? "bg-cyan-500 text-black shadow-cyan-500/20" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* Music Tracks Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Select Beats</label>
        <div className="grid grid-cols-3 gap-1.5">
          {MUSIC_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedMusic(track.id)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border truncate transition cursor-pointer select-none
                ${selectedMusic === track.id
                  ? "bg-white/10 border-cyan-400 text-cyan-400 shadow-sm"
                  : "bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              {track.name.split(" ").slice(1).join(" ") || track.name}
            </button>
          ))}
        </div>
        {/* Music Volume */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] text-white/40">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] text-white/40">{Math.round(musicVolume * 100)}%</span>
        </div>
      </div>

      {/* Ambient Sound Effects Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ambient FX Overlay</label>
        <div className="grid grid-cols-3 gap-1.5">
          {AMBIENT_FX.map((fx) => (
            <button
              key={fx.id}
              onClick={() => setSelectedFX(selectedFX === fx.id ? null : fx.id)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border truncate transition cursor-pointer select-none
                ${selectedFX === fx.id
                  ? "bg-white/10 border-indigo-400 text-indigo-400 shadow-sm"
                  : "bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              {fx.name.split(" ").slice(1).join(" ")}
            </button>
          ))}
          <button
            onClick={() => setSelectedFX(null)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer select-none
              ${selectedFX === null
                ? "bg-white/10 border-white/20 text-white shadow-sm"
                : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"}`}
          >
            None
          </button>
        </div>
        {/* FX Volume */}
        {selectedFX && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-white/40">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fxVolume}
              onChange={(e) => setFxVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <span className="text-[10px] text-white/40">{Math.round(fxVolume * 100)}%</span>
          </div>
        )}
      </div>

      {/* Small soundwave animation when active */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1 h-3 pt-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-cyan-400 rounded-full"
              animate={{ height: ["20%", "100%", "20%"] }}
              transition={{
                duration: 0.6 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
