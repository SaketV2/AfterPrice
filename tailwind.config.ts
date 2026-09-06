import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--surface-subtle) / <alpha-value>)",
          foreground: "hsl(var(--foreground-secondary) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          foreground: "hsl(var(--surface) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Manrope", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        major: "var(--radius-major)",
        dashboard: "var(--radius-dashboard)",
        card: "var(--radius-card)",
        input: "var(--radius-input)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        focus: "var(--shadow-focus)",
      },
    },
  },
  plugins: [],
};

export default config;
