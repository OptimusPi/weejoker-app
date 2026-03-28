/**
 * BalatroFanSiteAttributionFooter
 *
 * Zero-dependency React component. Drop this into any Balatro fan site.
 * Same message. Same m6x11plus pixel font (via @font-face or your own CSS).
 * Same suit animation. Same link.
 *
 * npm install balatro-fansite-footer   (coming soon 😄)
 *
 * Props:
 *   hidden   — pass true to fade out (e.g. when a chat UI is open)
 *   className — extra classes on the outer wrapper if you need to tweak positioning
 */

import React from "react";

const SUITS = [
    { char: "♥️", keyframe: "bff-heart" },
    { char: "♠️", keyframe: "bff-spade" },
    { char: "♦️", keyframe: "bff-diamond" },
    { char: "♣️", keyframe: "bff-club" },
] as const;

const CYCLE = "5s";
const BASE_STYLE: React.CSSProperties = {
    fontFamily: "var(--font-pixel), monospace",
    fontSize: "clamp(11px, 0.8vw + 8px, 14px)",
};
const BALATRO_GOLD = "#FFD85C";

export interface BalatroFanSiteAttributionFooterProps {
    /** Fade the footer out (e.g. when a modal or chat input is covering it). */
    hidden?: boolean;
    /** Extra className on the outermost div. */
    className?: string;
}

export function BalatroFanSiteAttributionFooter({
    hidden = false,
    className = "",
}: BalatroFanSiteAttributionFooterProps) {
    return (
        <div
            className={[
                "fixed right-0 bottom-0 left-0 w-screen min-w-full transition-opacity duration-200",
                hidden ? "pointer-events-none opacity-0" : "opacity-100",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.9)", padding: "0 1rem 3px", textAlign: "center" }}>
                <p
                    style={{ ...BASE_STYLE, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0 0.5rem", color: "white", margin: 0 }}
                >
                    <span>Not affiliated with LocalThunk or PlayStack</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        Made with{" "}
                        {/* Suits stacked — CSS cycles them */}
                        <span style={{ position: "relative", display: "inline-block", width: "1.5em", height: "1em", verticalAlign: "middle" }}>
                            {SUITS.map(({ char, keyframe }, _) => (
                                <span
                                    key={char}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        animationName: keyframe,
                                        animationDuration: CYCLE,
                                        animationDelay: "0s",
                                        animationIterationCount: "infinite",
                                        animationTimingFunction: "ease-out",
                                    }}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>{" "}
                        for the{" "}
                        <a
                            href="https://playbalatro.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: BALATRO_GOLD, textDecoration: "none" }}
                        >
                            Balatro
                        </a>{" "}
                        community
                    </span>
                </p>
            </div>

            {/* Self-contained keyframes — no stylesheet needed */}
            <style>{`
                @keyframes bff-heart {
                    0%    { opacity: 0; transform: scale(1);    }
                    1%    { opacity: 1; transform: scale(1.45); }
                    3.5%  { opacity: 1; transform: scale(1);    }
                    61.5% { opacity: 1; transform: scale(1);    }
                    62%   { opacity: 0; transform: scale(1);    }
                    100%  { opacity: 0; transform: scale(1);    }
                }
                @keyframes bff-spade {
                    0%,  61.5% { opacity: 0; transform: scale(1);    }
                    62%        { opacity: 1; transform: scale(1.45);  }
                    64.5%      { opacity: 1; transform: scale(1);     }
                    71.5%      { opacity: 1; transform: scale(1);     }
                    72%        { opacity: 0; transform: scale(1);     }
                    100%       { opacity: 0; }
                }
                @keyframes bff-diamond {
                    0%,  71.5% { opacity: 0; transform: scale(1);    }
                    72%        { opacity: 1; transform: scale(1.45);  }
                    74.5%      { opacity: 1; transform: scale(1);     }
                    81.5%      { opacity: 1; transform: scale(1);     }
                    82%        { opacity: 0; transform: scale(1);     }
                    100%       { opacity: 0; }
                }
                @keyframes bff-club {
                    0%,  81.5% { opacity: 0; transform: scale(1);    }
                    82%        { opacity: 1; transform: scale(1.45);  }
                    84.5%      { opacity: 1; transform: scale(1);     }
                    95%        { opacity: 1; transform: scale(1);     }
                    96%        { opacity: 0; transform: scale(1);     }
                    100%       { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

/**
 * Vanilla JS version — paste this script tag anywhere for non-React sites:
 *
 * <link rel="stylesheet" href="https://unpkg.com/balatro-fansite-footer/dist/style.css">
 * <script src="https://unpkg.com/balatro-fansite-footer/dist/vanilla.js"></script>
 * <balatro-footer></balatro-footer>
 *
 * (Web Component wrapper, coming in v1 when the package drops 🎴)
 */
