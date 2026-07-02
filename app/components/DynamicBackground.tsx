"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Personality } from "../../types/personality";

type AIState = "idle" | "listening" | "thinking" | "speaking";

interface DynamicBackgroundProps {
  isDark: boolean;
  personality: Personality;
  state: AIState;
}

const personalityBlobColors: Record<Personality, { blob1: string; blob2: string; blob3: string }> = {
  normal: {
    blob1: "bg-cyan-500/20",
    blob2: "bg-blue-600/15",
    blob3: "bg-teal-500/10",
  },
  romantic: {
    blob1: "bg-pink-500/20",
    blob2: "bg-rose-600/15",
    blob3: "bg-purple-500/10",
  },
  caring: {
    blob1: "bg-emerald-500/20",
    blob2: "bg-teal-600/15",
    blob3: "bg-cyan-500/10",
  },
  playful: {
    blob1: "bg-yellow-500/15",
    blob2: "bg-amber-600/15",
    blob3: "bg-orange-500/10",
  },
  angry: {
    blob1: "bg-red-500/20",
    blob2: "bg-rose-600/15",
    blob3: "bg-orange-600/10",
  },
  command: {
    blob1: "bg-violet-500/20",
    blob2: "bg-indigo-600/15",
    blob3: "bg-purple-500/10",
  },
};

export default function DynamicBackground({ isDark, personality, state }: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const blobs = personalityBlobColors[personality] || personalityBlobColors.normal;

  // Stardust Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track viewport resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle class definition
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      targetAlpha: number;
      speedScale: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05, // slow upward drift
        size: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        targetAlpha: Math.random() * 0.5 + 0.1,
        speedScale: Math.random() * 0.5 + 0.75,
      });
    }

    let tick = 0;

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Color mapping for particles
      let pColor = "34, 211, 238"; // default cyan
      if (personality === "romantic") pColor = "244, 114, 182";
      if (personality === "caring") pColor = "52, 211, 153";
      if (personality === "playful") pColor = "250, 204, 21";
      if (personality === "angry") pColor = "248, 113, 113";
      if (personality === "command") pColor = "167, 139, 250";

      particles.forEach((p) => {
        // Move particle
        let currentVx = p.vx;
        let currentVy = p.vy;

        if (state === "listening") {
          currentVy = p.vy * 1.8; // drift faster upwards
        }

        p.x += currentVx * p.speedScale;
        p.y += currentVy * p.speedScale;

        // Dynamic State-based transformations
        if (state === "thinking") {
          // Orbit/attract toward screen center
          const dxCenter = width / 2 - p.x;
          const dyCenter = height / 2 - p.y;
          const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
          if (distCenter > 80) {
            p.x += (dxCenter / distCenter) * 0.35;
            p.y += (dyCenter / distCenter) * 0.35;
          }
        } else if (state === "speaking") {
          // Horizontal wavy ripple
          p.x += Math.sin(tick * 0.04 + p.y * 0.008) * 0.4;
        }

        // Mouse gravity interaction
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          // Softly push away from cursor
          const force = (180 - dist) / 180;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
        }

        // Fading alphas
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.alpha - p.targetAlpha) < 0.01) {
          p.targetAlpha = Math.random() * (isDark ? 0.6 : 0.3) + 0.1;
        }

        // Wrap around boundaries
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Determine particle radius based on state
        let radius = p.size;
        if (state === "listening") {
          radius = p.size * (1.0 + Math.sin(tick * 0.08 + (p.x + p.y) * 0.01) * 0.45);
        } else if (state === "thinking") {
          radius = p.size * 0.85;
        }

        // Draw particle
        ctx.fillStyle = `rgba(${pColor}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.2, radius), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [personality, isDark, state]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 🔮 AURA GLOB 1 (Top Left-ish) */}
      <motion.div
        className={`absolute w-[450px] h-[450px] rounded-full blur-[130px] filter pointer-events-none ${blobs.blob1}`}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: "-50px",
          left: "5%",
        }}
      />

      {/* 🔮 AURA GLOB 2 (Bottom Right-ish) */}
      <motion.div
        className={`absolute w-[500px] h-[500px] rounded-full blur-[140px] filter pointer-events-none ${blobs.blob2}`}
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          bottom: "-100px",
          right: "5%",
        }}
      />

      {/* 🔮 AURA GLOB 3 (Center-ish / Side) */}
      <motion.div
        className={`absolute w-[350px] h-[350px] rounded-full blur-[120px] filter pointer-events-none ${blobs.blob3}`}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, 60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: "35%",
          left: "30%",
        }}
      />

      {/* 🌐 FUTURISTIC TECH GRID OVERLAY */}
      <div
        className="absolute inset-0 opacity-[0.6] pointer-events-none transition-all duration-500"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)`
            : `linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at center, black 50%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 50%, transparent 95%)",
        }}
      />

      {/* ✨ STARDUST CANVAS PARTICLES */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
