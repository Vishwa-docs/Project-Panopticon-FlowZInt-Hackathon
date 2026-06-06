import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./remotion/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121212",
        panel: "#f5f3ee",
        terminal: "#111311",
        line: "#d8d2c5",
        action: "#0e7c66",
        warn: "#b15d16",
        danger: "#ad2e24"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(18, 18, 18, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
