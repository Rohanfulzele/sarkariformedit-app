import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
          DEFAULT: "#4f46e5",
          dark: "#3730a3",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        card: "0 1px 2px 0 rgb(15 23 42 / 0.03), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        "card-hover": "0 2px 4px 0 rgb(15 23 42 / 0.04), 0 16px 32px -12px rgb(15 23 42 / 0.16)",
        glow: "0 0 0 1px rgb(79 70 229 / 0.05), 0 8px 24px -8px rgb(79 70 229 / 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #818cf8 100%)",
        "hero-mesh":
          "radial-gradient(60% 50% at 15% 0%, rgb(79 70 229 / 0.12), transparent 60%), radial-gradient(50% 40% at 100% 0%, rgb(99 102 241 / 0.10), transparent 60%)",
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
