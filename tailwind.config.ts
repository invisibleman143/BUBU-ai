import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* 📱 MOBILE HEIGHT FIX */
      height: {
        dvh: "100dvh",
      },

      /* 📱 SAFE AREA (iOS NOTCH) */
      padding: {
        safe: "env(safe-area-inset-bottom)",
      },

      /* 🎞️ ANIMATIONS */
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "pulse-soft": "pulse 4s ease-in-out infinite",
        "wave": "wave 1.5s ease-in-out infinite",
      },

      keyframes: {
        wave: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
      },

      /* 📱 MOBILE FONT CONTROL */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
