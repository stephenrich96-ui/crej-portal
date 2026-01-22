import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "#000000",
        crej: {
          primary: "#1e40af", // Deep blue - adjust based on CREJLLC.net
          secondary: "#0ea5e9", // Sky blue
          accent: "#3b82f6", // Bright blue
          dark: "#1e293b", // Dark slate
          light: "#f8fafc", // Light gray
        },
      },
    },
  },
  plugins: [],
};
export default config;
