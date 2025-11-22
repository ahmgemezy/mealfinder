import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // In Tailwind v4, theme configuration is handled in CSS.
  // Keeping this file minimal to avoid conflicts, but ensuring content paths are correct.
  theme: {},
  plugins: [],
};

export default config;
