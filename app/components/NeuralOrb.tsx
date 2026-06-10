"use client";
import { useEffect, useRef } from "react";
import { Personality } from "../../types/personality";

type AIState = "idle" | "listening" | "thinking" | "speaking";

const personalityColors: Record<Personality, { r: number; g: number; b: number }> = {
  normal: { r: 34, g: 211, b: 238 },     // cyan-400
  romantic: { r: 244, g: 114, b: 182 },   // pink-400
  caring: { r: 52, g: 211, b: 153 },     // emerald-400
  playful: { r: 250, g: 204, b: 21 },    // yellow-400
  angry: { r: 248, g: 113, b: 113 },      // red-400
  command: { r: 167, g: 139, b: 250 },    // violet-400
};

// Helper to rotate 3D points
const rotate3D = (
  x: number,
  y: number,
  z: number,
  ax: number,
  ay: number,
  az: number
) => {
  // Rotate around X axis
  const cosX = Math.cos(ax);
  const sinX = Math.sin(ax);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  // Rotate around Y axis
  const cosY = Math.cos(ay);
  const sinY = Math.sin(ay);
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  // Rotate around Z axis
  const cosZ = Math.cos(az);
  const sinZ = Math.sin(az);
  const x3 = x2 * cosZ - y1 * sinZ;
  const y3 = x2 * sinZ + y1 * cosZ;

  return { x: x3, y: y3, z: z2 };
};

export default function NeuralOrb({
  state = "idle",
  energy = 0.3,
  fullscreen = false,
  personality = "normal",
}: {
  state?: AIState;
  energy?: number;
  fullscreen?: boolean;
  personality?: Personality;
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

      // 🎥 Projection details
      const zoom = R * 1.6;
      const distance = R * 2.2;
      const color = personalityColors[personality] || personalityColors.normal;

      // 🎭 AI State-based rotation speed and orbital motion scaling
      const speed =
        state === "speaking"
          ? 0.024
          : state === "listening"
          ? 0.016
          : state === "thinking"
          ? 0.012
          : 0.006;

      // Global rotation angles over time
      const rotX = t * 0.4;
      const rotY = t * 0.6;
      const rotZ = t * 0.25;

      // 1. Draw glowing background aura
      const radialGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.9);
      radialGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.18)`);
      radialGlow.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.06)`);
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Helper to draw a projected 3D line segment with depth cueing (alpha/linewidth mapped to Z)
      const draw3DLine = (
        p1: { x: number; y: number; z: number },
        p2: { x: number; y: number; z: number },
        baseAlphaMultiplier = 1.0,
        extraLineWidth = 0
      ) => {
        const midZ = (p1.z + p2.z) / 2;
        // Map z [-R, R] to [0, 1] for visual depth scaling
        const depth = (midZ + R) / (2 * R);

        // Perspective scaling
        const scale1 = zoom / (distance + p1.z);
        const scale2 = zoom / (distance + p2.z);

        const x1 = cx + p1.x * scale1;
        const y1 = cy + p1.y * scale1;
        const x2 = cx + p2.x * scale2;
        const y2 = cy + p2.y * scale2;

        const alpha = Math.max(0.06, depth) * 0.75 * baseAlphaMultiplier;
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.lineWidth = (0.4 + Math.max(0.05, depth) * 1.5) + extraLineWidth;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };

      // 2. Generate and Render Core Sphere (Latitude Circles & Longitude Arcs)
      const numLats = 7;
      const numLons = 16;
      const pts: { x: number; y: number; z: number }[][] = [];

      for (let lat = 0; lat <= numLats; lat++) {
        pts[lat] = [];
        const latAngle = -Math.PI / 2 + (lat / numLats) * Math.PI;
        const cosLat = Math.cos(latAngle);
        const sinLat = Math.sin(latAngle);

        for (let lon = 0; lon < numLons; lon++) {
          const lonAngle = (lon / numLons) * Math.PI * 2;

          // Add displacement wave representing AI conversation energy
          const wave =
            Math.sin(lonAngle * 3 + t * 4) * Math.cos(latAngle * 2) * 12 * energy +
            Math.sin(t * 1.5 + lat) * 4 * energy;

          const currentR = R + wave;
          const x = currentR * cosLat * Math.cos(lonAngle);
          const y = currentR * cosLat * Math.sin(lonAngle);
          const z = currentR * sinLat;

          // Apply rotation
          const rotated = rotate3D(x, y, z, rotX, rotY, rotZ);
          pts[lat][lon] = rotated;
        }
      }

      // Draw latitude rings
      for (let lat = 1; lat < numLats; lat++) {
        for (let lon = 0; lon < numLons; lon++) {
          const nextLon = (lon + 1) % numLons;
          draw3DLine(pts[lat][lon], pts[lat][nextLon], 0.85);
        }
      }

      // Draw longitude arcs
      for (let lon = 0; lon < numLons; lon++) {
        for (let lat = 0; lat < numLats; lat++) {
          draw3DLine(pts[lat][lon], pts[lat + 1][lon], 0.7);
        }
      }

      // 3. Draw Outer Tilted Gyroscope Rings (Planetary/Circular Motion)
      // Outer Ring 1 (Tilted, fast counter-clockwise orbit)
      const outerR1 = R * 1.45;
      const tiltAngle1 = Math.PI / 5; // 36 degrees
      const ringPts1: { x: number; y: number; z: number }[] = [];
      const numRingPts = 32;

      for (let i = 0; i <= numRingPts; i++) {
        const phi = (i / numRingPts) * Math.PI * 2;
        // Base flat circle
        const x = outerR1 * Math.cos(phi);
        const y = outerR1 * Math.sin(phi);
        const z = 0;

        // Apply tilt
        const yt = y * Math.cos(tiltAngle1);
        const zt = y * Math.sin(tiltAngle1);

        // Apply rotation (offset Y speed for independent orbital feel)
        const rotated = rotate3D(x, yt, zt, rotX, rotY + t * 0.4, rotZ);
        ringPts1.push(rotated);
      }

      for (let i = 0; i < numRingPts; i++) {
        draw3DLine(ringPts1[i], ringPts1[i + 1], 1.2, 0.4);
      }

      // Outer Ring 2 (Opposite tilt, slow clockwise orbit)
      const outerR2 = R * 1.75;
      const tiltAngle2 = -Math.PI / 4; // -45 degrees
      const ringPts2: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i <= numRingPts; i++) {
        const phi = (i / numRingPts) * Math.PI * 2;
        const x = outerR2 * Math.cos(phi);
        const y = outerR2 * Math.sin(phi);
        const z = 0;

        const yt = y * Math.cos(tiltAngle2);
        const zt = y * Math.sin(tiltAngle2);

        // Opposite rotation direction
        const rotated = rotate3D(x, yt, zt, rotX, -rotY - t * 0.2, rotZ);
        ringPts2.push(rotated);
      }

      for (let i = 0; i < numRingPts; i++) {
        draw3DLine(ringPts2[i], ringPts2[i + 1], 0.75, 0.1);
      }

      t += speed;
      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener("resize", resize);
  }, [state, energy, fullscreen, personality]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  );
}
