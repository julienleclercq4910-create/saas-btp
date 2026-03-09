import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4f6f8",
        foreground: "#111827",
        primary: {
          DEFAULT: "#1f3a5f",
          foreground: "#f8fafc"
        },
        accent: {
          DEFAULT: "#d97706",
          foreground: "#fffbeb"
        },
        muted: {
          DEFAULT: "#e5e7eb",
          foreground: "#4b5563"
        },
        card: "#ffffff",
        border: "#d1d5db",
        danger: "#b91c1c",
        success: "#166534"
      },
      borderRadius: {
        lg: "0.85rem",
        xl: "1rem"
      },
      boxShadow: {
        card: "0 8px 30px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;


