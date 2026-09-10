import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        inksoft: "var(--ink-soft)",
        line: "var(--line)",
        linestrong: "var(--line-strong)",
        accent: "var(--accent)",
        income: "var(--income)",
        incomebg: "var(--income-bg)",
        outcome: "var(--outcome)",
        outcomebg: "var(--outcome-bg)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
