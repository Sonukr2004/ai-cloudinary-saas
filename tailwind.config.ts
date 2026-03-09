import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        cloudcraft: {
          primary: "#6366f1",
          "primary-content": "#ffffff",
          secondary: "#22c55e",
          "secondary-content": "#02140a",
          accent: "#f97316",
          neutral: "#111827",
          "base-100": "#020617",
          "base-200": "#020617",
          "base-300": "#0b1120",
          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#eab308",
          error: "#ef4444",
        },
      },
      "light",
      "dark",
      "cupcake",
    ],
  },
};
export default config;
