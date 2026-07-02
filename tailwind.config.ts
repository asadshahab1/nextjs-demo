import type { Config } from "tailwindcss";

// KILN design tokens. Porcelain/ink base with a single pine accent —
// deliberately not the cream+terracotta palette that reads as AI-default.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        porcelain: "#FAF9F6",
        ink: "#1B1A17",
        smoke: "#6B6A63",
        pine: "#0F5C4E",
        "pine-bright": "#177E6B",
        clay: "#C8B8A1",
        line: "#E6E3DB",
      },
      fontFamily: {
        // Bound to next/font CSS variables set in app/layout.tsx
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "1180px" },
    },
  },
  plugins: [],
};
export default config;
