import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#05070d",
        surface: "#0b0f1a",
        "surface-2": "#0f1422",
        "surface-3": "#141a2b",
        border: "#1f2740",
        "border-strong": "#2a3550",
        muted: "#8a93a8",
        "muted-2": "#5d667d",
        ink: "#e7ecf5",
        "ink-2": "#c4cad9",
        brand: {
          DEFAULT: "#2563eb",
          600: "#1d4ed8",
          400: "#3b82f6",
          300: "#60a5fa",
        },
        navy: "#01083c",
        success: "#22c55e",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.02), 0 12px 40px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
