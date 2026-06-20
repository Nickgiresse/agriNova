import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00450d",
        "primary-container": "#1b5e20",
        "on-primary": "#ffffff",
        "on-primary-fixed-variant": "#0c5216",
        "secondary": "#006e1c",
        "secondary-fixed": "#78dc77",
        "surface": "#f7fbf1",
        "surface-container": "#ecefe6",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191d17",
        "on-surface-variant": "#41493e",
        "outline": "#717a6d",
        "outline-variant": "#c0c9bb",
        "error": "#ba1a1a",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
