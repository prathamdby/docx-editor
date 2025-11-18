import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        background: "#0a0a0a", // Obsidian
        foreground: "#ededed",
        card: {
          DEFAULT: "#171717", // Graphite
          foreground: "#ededed",
        },
        popover: {
          DEFAULT: "#171717",
          foreground: "#ededed",
        },
        primary: {
          DEFAULT: "#ccff00", // Acid Lime
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#262626", // Dark Grey
          foreground: "#ededed",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#262626",
          foreground: "#ededed",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ededed",
        },
        border: "#262626",
        input: "#262626",
        ring: "#ccff00",
        "text-lime": "#d4ff33", // Text contrast lime
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      borderColor: {
        micro: "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        noise: "url('/noise.svg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
