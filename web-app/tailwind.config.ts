import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#3b82f6",
          600: "#2563eb",
        },
        priority: {
          p5: "#ef4444",
          p4: "#f97316",
          p3: "#eab308",
          p2: "#3b82f6",
          p1: "#10b981",
        }
      },
    },
  },
  plugins: [],
};
export default config;
