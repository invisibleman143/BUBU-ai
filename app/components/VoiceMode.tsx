"use client";

import { useEffect, useRef, useState } from "react";
import AIVatar from "./AIVatar";
import NeuralOrb from "./NeuralOrb";
import { Personality } from "../../types/personality";

type AIState = "idle" | "listening" | "thinking" | "speaking";

// Ringtone Synthesizer using Web Audio API
class RingtonePlayer {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;

  start(isIncoming: boolean) {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    const playBeeps = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      if (isIncoming) {
        // Electronic telephone ring (high double tone)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(853, t);
        osc2.frequency.setValueAtTime(960, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
        gain.gain.setValueAtTime(0.08, t + 1.8);
        gain.gain.linearRampToValueAtTime(0, t + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 2.0);
        osc2.stop(t + 2.0);
      } else {
        // Skype-like double beep dial tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(440, t);
        osc2.frequency.setValueAtTime(480, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
        gain.gain.setValueAtTime(0.08, t + 0.5);
        gain.gain.linearRampToValueAtTime(0, t + 0.65);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.7);
        osc2.stop(t + 0.7);

        const osc3 = this.ctx.createOscillator();
        const osc4 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();

        osc3.frequency.setValueAtTime(440, t + 0.8);
        osc4.frequency.setValueAtTime(480, t + 0.8);

        gain2.gain.setValueAtTime(0, t + 0.8);
        gain2.gain.linearRampToValueAtTime(0.08, t + 0.85);
        gain2.gain.setValueAtTime(0.08, t + 1.3);
        gain2.gain.linearRampToValueAtTime(0, t + 1.45);

        osc3.connect(gain2);
        osc4.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc3.start(t + 0.8);
        osc4.start(t + 0.8);
        osc3.stop(t + 1.5);
        osc4.stop(t + 1.5);
      }
    };

    playBeeps();
    this.intervalId = setInterval(playBeeps, isIncoming ? 4000 : 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export default function VoiceMode({
  state,
  energy,
  subtitle,
  personality,
  onMicClick,
  onExit,
  isMuted,
  onMuteToggle,
  onCallConnect,
  isIncomingCall,
  onInterrupt,
}: {
  state: AIState;
  energy: number;
  subtitle: string;
  personality: Personality;
  onMicClick: () => void;
  onExit: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  onCallConnect: () => void;
  isIncomingCall: boolean;
  onInterrupt: () => void;
}) {
  const [callState, setCallState] = useState<"incoming" | "ringing" | "connecting" | "active">(
    isIncomingCall ? "incoming" : "ringing"
  );
  const [timer, setTimer] = useState(0);
  const ringtonePlayerRef = useRef<RingtonePlayer | null>(null);

  // Call connection transitions
  useEffect(() => {
    ringtonePlayerRef.current = new RingtonePlayer();
    ringtonePlayerRef.current.start(isIncomingCall);

    if (isIncomingCall) {
      // Auto hang up after 30 seconds if unanswered
      const hangupTimeout = setTimeout(() => {
        onExit();
      }, 30000);

      return () => {
        clearTimeout(hangupTimeout);
        if (ringtonePlayerRef.current) {
          ringtonePlayerRef.current.stop();
        }
      };
    } else {
      const connectingTimeout = setTimeout(() => {
        setCallState("connecting");
        if (ringtonePlayerRef.current) {
          ringtonePlayerRef.current.stop();
        }
      }, 4000);

      const activeTimeout = setTimeout(() => {
        setCallState("active");
        onCallConnect();
      }, 6000);

      return () => {
        clearTimeout(connectingTimeout);
        clearTimeout(activeTimeout);
        if (ringtonePlayerRef.current) {
          ringtonePlayerRef.current.stop();
        }
      };
    }
  }, [isIncomingCall]);

  // Call timer increment
  useEffect(() => {
    if (callState !== "active") return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const handleAccept = () => {
    if (ringtonePlayerRef.current) {
      ringtonePlayerRef.current.stop();
    }
    setCallState("connecting");
    setTimeout(() => {
      setCallState("active");
      onCallConnect();
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const personalityTitles: Record<Personality, string> = {
    normal: "Bubu",
    romantic: "Babu ❤️",
    caring: "Mera Khayal Rakhne Wali 🥰",
    playful: "Naughty Bubu 😜",
    angry: "Cute Gussa Bubu 😡",
    command: "BUBU Assistant 🤖",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b19] min-h-dvh w-full overflow-hidden text-white">
      {/* Background Soft Glows */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none blur-3xl opacity-50" />

      {/* TOP HEADER */}
      <div className="pt-8 px-6 flex flex-col items-center z-10">
        <span className="text-xs tracking-widest text-slate-400 uppercase font-semibold">
          {callState === "incoming" && "INCOMING CALL..."}
          {callState === "ringing" && "CALLING..."}
          {callState === "connecting" && "CONNECTING CALL"}
          {callState === "active" && "ACTIVE VOICE CALL"}
        </span>
        <h1 className="text-2xl font-bold mt-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
          {personalityTitles[personality]}
        </h1>
        <p className="text-sm text-cyan-400 mt-1 font-medium select-none flex items-center gap-1.5">
          {callState === "incoming" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Incoming Call...
            </>
          )}
          {callState === "ringing" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              Calling...
            </>
          )}
          {callState === "connecting" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Connecting...
            </>
          )}
          {callState === "active" && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {formatTime(timer)}
            </>
          )}
        </p>
      </div>

      {/* CENTER AVATAR + GLOW RINGS */}
      <div
        onClick={() => {
          if (callState === "active") onInterrupt();
        }}
        className={`relative flex-1 flex flex-col items-center justify-center z-10 px-4 select-none transition-all duration-300 ${
          callState === "active" ? "cursor-pointer active:scale-95" : ""
        }`}
        title={callState === "active" ? "Tap to interrupt BUBU" : undefined}
      >
        {/* Pulsing rings for calling / ringing states */}
        {(callState === "ringing" || callState === "incoming") && (
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-green-500/20 animate-pulse flex items-center justify-center">
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-green-500/10 animate-ping" />
          </div>
        )}

        {/* NEURAL ORB */}
        <NeuralOrb
          state={state}
          energy={callState === "active" ? energy : 0.05}
          fullscreen
          personality={personality}
        />

        {/* Core Avatar */}
        <div className="relative z-10">
          <AIVatar
            state={state}
            energy={callState === "active" ? energy : 0.05}
            personality={personality}
            subtitle={subtitle}
          />
        </div>
      </div>

      {/* SUBTITLE DISPLAY (Only when active) */}
      {callState === "active" && (
        <div className="px-8 text-center min-h-[5rem] z-10 flex flex-col items-center justify-center gap-1">
          <p className="text-base text-slate-200 max-w-md mx-auto italic font-medium drop-shadow-md">
            {state === "listening" && "Listening..."}
            {state === "thinking" && "Thinking..."}
            {state === "speaking" && (subtitle || "Speaking...")}
            {state === "idle" && (subtitle || "Say something...")}
          </p>
          {state === "speaking" && (
            <span className="text-xs text-cyan-400/70 select-none animate-pulse font-normal tracking-wide">
              (Tap screen to interrupt)
            </span>
          )}
        </div>
      )}

      {/* BOTTOM CONTROL ACTIONS */}
      <div className="pb-safe pb-12 pt-6 flex justify-center gap-6 items-center z-10">
        {callState === "active" ? (
          <>
            {/* MUTE BUTTON */}
            <button
              onClick={onMuteToggle}
              className={`p-4 rounded-full transition-all duration-300 shadow-md ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white scale-105"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* END CALL BUTTON */}
            <button
              onClick={onExit}
              className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
              title="End Call"
            >
              <svg className="w-7 h-7 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>

            {/* MANUAL SPEAK / PUSH TO TALK */}
            <button
              onClick={onMicClick}
              className={`p-4 rounded-full transition-all duration-300 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 ${
                state === "listening" && "animate-pulse border-cyan-500/50 text-cyan-400"
              }`}
              title="Force Speak"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 006.5-6.5V6a6.5 6.5 0 00-13 0v6a6.5 6.5 0 006.5 6.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4 6v3" />
              </svg>
            </button>
          </>
        ) : callState === "incoming" ? (
          /* INCOMING CALL OPTIONS: ACCEPT AND DECLINE */
          <div className="flex gap-16 items-center">
            {/* DECLINE CALL BUTTON */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onExit}
                className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 hover:shadow-red-600/60 hover:scale-110 active:scale-95 transition-all duration-300 animate-pulse"
                title="Decline"
              >
                <svg className="w-7 h-7 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor" />
                </svg>
              </button>
              <span className="text-xs text-red-500 font-semibold uppercase tracking-widest mt-1">Decline</span>
            </div>

            {/* ACCEPT CALL BUTTON */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="p-5 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/40 hover:shadow-green-500/60 hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce"
                title="Accept"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor" />
                </svg>
              </button>
              <span className="text-xs text-green-500 font-semibold uppercase tracking-widest mt-1">Accept</span>
            </div>
          </div>
        ) : (
          /* DIALING / OUTGOING CALL DECLINE BUTTON */
          <button
            onClick={onExit}
            className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Decline Call"
          >
            <svg className="w-7 h-7 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
