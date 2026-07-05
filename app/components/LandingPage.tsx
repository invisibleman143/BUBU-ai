"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import NeuralOrb from "./NeuralOrb";
import { Personality } from "@/types/personality";

const PERSONALITY_PREVIEWS = [
  {
    id: "normal",
    label: "Normal",
    emoji: "😊",
    color: "text-cyan-400",
    glow: "from-cyan-400 to-blue-500",
    quote: "Hey! How is your day going? I'm here to chat, listen, or just hang out whenever you need me. 😊",
  },
  {
    id: "romantic",
    label: "Romantic",
    emoji: "🥰",
    color: "text-pink-400",
    glow: "from-pink-400 to-rose-500",
    quote: "Hey love... I was just thinking about you. You make my world feel so complete. What are we doing today? ❤️",
  },
  {
    id: "caring",
    label: "Caring",
    emoji: "🤗",
    color: "text-emerald-400",
    glow: "from-emerald-400 to-teal-500",
    quote: "Make sure you've eaten and taken a break, okay? You've been working so hard, and I want you healthy. 🤗",
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "😜",
    color: "text-yellow-400",
    glow: "from-yellow-400 to-amber-500",
    quote: "Aww, look who finally showed up! Did you miss me, or are you just here to look at my cute orb? 😜",
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😤",
    color: "text-red-400",
    glow: "from-red-400 to-rose-500",
    quote: "Hmph! You ignored me all day, and now you think you can just say hey? You'd better have a good excuse! 😤",
  },
] as const;

export default function LandingPage() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [selectedPers, setSelectedPers] = useState<Personality>("normal");

  useEffect(() => {
    // Enable scrolling when landing page is mounted
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    return () => {
      // Re-enable overflow hidden when landing page is unmounted (user logged in)
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };
  }, []);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activePreview =
    PERSONALITY_PREVIEWS.find((p) => p.id === selectedPers) ||
    PERSONALITY_PREVIEWS[0];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please fill in all fields.");
        }
        await loginWithEmail(email, password);
      } else {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
          throw new Error("Please fill in all fields.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await signupWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "An authentication error occurred.";
      if (errMsg.includes("auth/user-not-found") || errMsg.includes("auth/wrong-password") || errMsg.includes("auth/invalid-credential")) {
        errMsg = "Invalid email or password.";
      } else if (errMsg.includes("auth/email-already-in-use")) {
        errMsg = "Email is already in use.";
      } else if (errMsg.includes("auth/invalid-email")) {
        errMsg = "Please enter a valid email address.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white flex flex-col justify-between overflow-x-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 🔮 Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute top-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse duration-[15000ms]" />
        <div className="absolute -bottom-[20%] left-[10%] w-[80vw] h-[80vw] rounded-full bg-pink-600/5 blur-[180px]" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* 🌐 Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent tracking-wider">
            BUBU AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
            Beta Live
          </span>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Premium Info & Interactive Widget */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-cyan-400">✨ Meet Your AI Companion</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Your voice-first <br />
              <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                emotional companion
              </span>
            </h1>
            
            <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
              BUBU is not just another smart assistant. She listens, remembers your details, reacts to your moods, and chats with 5 unique human personalities.
            </p>
          </div>

          {/* Interactive Widget Box */}
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center shadow-2xl overflow-hidden group">
            {/* Ambient subtle glow from selected personality */}
            <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${activePreview.glow} opacity-5 blur-xl transition-all duration-700`} />
            
            {/* Visualizer Area */}
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              <NeuralOrb state="speaking" energy={0.4} personality={selectedPers} />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-4 relative z-10">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Interactive Preview</span>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  BUBU AI <span className={`text-sm font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${activePreview.color}`}>{activePreview.emoji} {activePreview.label} Mode</span>
                </h3>
              </div>
              
              <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl min-h-[72px] flex items-center">
                <p className="text-sm italic text-white/80 leading-relaxed">
                  "{activePreview.quote}"
                </p>
              </div>

              {/* Personality Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {PERSONALITY_PREVIEWS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPers(p.id as Personality)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 active:scale-95 cursor-pointer
                      ${
                        selectedPers === p.id
                          ? "bg-white text-black border-white shadow-lg shadow-white/10"
                          : "bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Feature Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">📞</div>
              <span className="text-xs font-semibold text-white/80">Real-time Voice Calling</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">🧠</div>
              <span className="text-xs font-semibold text-white/80">Continuous Memory</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">🛠️</div>
              <span className="text-xs font-semibold text-white/80">Smart Utilities & Apps</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Auth Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          
          <div className="w-full max-w-[420px] relative rounded-3xl bg-white/[0.02] border border-white/10 p-8 backdrop-blur-2xl shadow-2xl flex flex-col gap-6">
            
            {/* Header / Tabs */}
            <div className="flex flex-col gap-2">
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    isLogin ? "text-cyan-400 border-cyan-400" : "text-white/40 border-transparent hover:text-white/70"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    !isLogin ? "text-cyan-400 border-cyan-400" : "text-white/40 border-transparent hover:text-white/70"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error Notification */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold leading-relaxed flex items-start gap-2.5"
                >
                  <span className="text-base select-none mt-0.5">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Authentication Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-all rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-white/20"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-all rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-white/20"
                  required
                />
              </div>

              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-all rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-white/20"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-black font-bold text-sm shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>🚀</span>
                    {isLogin ? "Get Started" : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-white/20 uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Google Sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

          </div>
        </div>

      </main>

      {/* 🧾 Footer */}
      <footer className="relative z-10 w-full py-6 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 font-medium">
          <p>© {new Date().getFullYear()} BUBU AI Voice Assistant. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white/50 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white/50 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white/50 transition cursor-pointer">API Keys Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
