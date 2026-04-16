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
                // Primary Brand Colors (Refined from Screenshots)
                white: "#FFFFFF",
                black: "#000000",
                red: "#FE5F55", // Vibrant Red
                "red-dark": "#C0392B",
                "red-darkest": "#922B21",

                // The 'Play' Button Blue
                blue: "#0099db",
                "blue-dark": "#006bb3",

                // The 'Orange' UI Elements
                orange: "#f09819",
                "orange-dark": "#d35400",

                gold: "#F1C40F",
                "gold-dark": "#B7950B",

                green: "#2ECC71",
                "green-dark": "#27AE60",

                // Balatro UI Greys (Slate/Cool)
                grey: "#475569", // Slate-600 ish
                "grey-medium": "#334155", // Slate-700
                "grey-dark": "#1e293b", // Slate-800 (Panel BG)
                "grey-darker": "#0f172a", // Slate-900 (Main BG)

                "silver-bright": "#e2e8f0",
                "silver-light": "#cbd5e1",
                "silver-grey": "#94a3b8",

                // Semantic Aliases
                bg: "#0f172a", // Main background
                panel: "#334155", // Card/Modal background
                border: "#94a3b8", // Borders
            },
            fontFamily: {
                header: ["var(--font-header)"],
                pixel: ["var(--font-pixel)"],
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
            boxShadow: {
                'balatro-card': '0 2px 6px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.2)',
                'balatro-card-hover': '0 4px 10px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)',
                'balatro-button': '0 2px 4px 0 rgba(0,0,0,0.4)',
                'balatro-inner': 'inset 0 2px 4px rgba(0,0,0,0.4)',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
