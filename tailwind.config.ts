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
                balatro: {
                    // Primary Brand Colors
                    white: "#FFFFFF",
                    black: "#000000",
                    red: "#ff4c40",
                    "red-dark": "#a02721",
                    "red-darkest": "#70150f",
                    blue: "#0093ff",
                    "blue-dark": "#0057a1",
                    orange: "#ff9800",
                    "orange-dark": "#a05b00",
                    "gold-dark": "#b8883a",
                    green: "#429f79",
                    "green-dark": "#215f46",
                    purple: "#7d60e0",
                    "purple-dark": "#292189",

                    // Special/Text
                    gold: "#eaba44", // BrightGold
                    "green-bright": "#35bd86",

                    // Modal/Panel (Greys)
                    grey: "#3a5055", // ModalBackground
                    "grey-medium": "#33464b",
                    "grey-dark": "#1e2b2d", // DarkBackground, Panel
                    "silver-bright": "#b9c2d2", // ModalBorder
                    "grey-light": "#777e89",
                    "grey-faded": "#565b5c", // DisabledControlText

                    // Shadows
                    "shadow-medium": "#1e2e32",
                    "shadow-dark": "#0b1415",

                    // Disabled
                    "disabled-dark": "#2d2d2d",
                    "disabled": "#5c5c5c",
                    "disabled-light": "#6b6b6b",

                    // Other
                    "red-burnt": "#8f3b36", // ProgressBarRed
                    "silver-light": "#a3acb9",
                    "silver-grey": "#686e78",

                    // Animations
                    "purple-violet": "#9B7EDE",
                    "purple-muted": "#6B5AA8",

                    // Semantic Aliases (mapped to above)
                    bg: "#1e2b2d", // DarkGrey
                    panel: "#3a5055", // Grey
                    border: "#b9c2d2", // BrightSilver
                }
            },
            fontFamily: {
                header: ["var(--font-header)"],
                pixel: ["var(--font-pixel)"],
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
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
