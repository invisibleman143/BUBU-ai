"use client";
import { useEffect, useRef } from "react";

type AIState = "idle" | "listening" | "thinking" | "speaking";

export default function NeuralOrb({
  state = "idle",
  energy = 0.3,
  fullscreen = false,
}: {
  state?: AIState;
  energy?: number;
  fullscreen?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const size = fullscreen
        ? Math.min(window.innerWidth, window.innerHeight)
        : Math.min(window.innerWidth, window.innerHeight) * 0.55;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / (2 * dpr);
      const cy = canvas.height / (2 * dpr);
      const R = canvas.width / (2.6 * dpr);

      // 🎭 STATE-BASED SPEED
      const speed =
        state === "speaking"
          ? 0.05
          : state === "listening"
          ? 0.035
          : state === "thinking"
          ? 0.025
          : 0.015;

      const layers = 42; // wireframe density

      for (let i = 0; i < layers; i++) {
        const depth = i / layers;
        const alpha = 0.15 + depth * 0.6;

        ctx.strokeStyle = `rgba(
          ${120 + depth * 80},
          ${160 + depth * 40},
          255,
          ${alpha}
        )`;

        ctx.lineWidth = 0.6 + depth * 0.6;
        ctx.beginPath();

        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const wave =
            Math.sin(a * 3 + t + i) * 8 * energy +
            Math.sin(t * 0.7 + i) * 6 * energy;

          const r = R * (0.75 + depth * 0.4) + wave;

          const x = cx + r * Math.cos(a + t * 0.2);
          const y = cy + r * Math.sin(a);

          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      t += speed;
      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener("resize", resize);
  }, [state, energy, fullscreen]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
    />
  );
}
