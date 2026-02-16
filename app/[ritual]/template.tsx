"use client";

import { useEffect, useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    // This template will re-mount whenever the route segment changes
    // which helps ensure our DailyRitual component resets its internal state
    // when switching between rituals (if we ever do) or if deep linking
    return (
        <div className="contents">
            {children}
        </div>
    );
}
