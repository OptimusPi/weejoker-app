"use client";

import dynamic from "next/dynamic";

const DailyRitualFn = dynamic(() => import("@/components/DailyRitual").then(mod => mod.DailyRitual), {
    ssr: false,
    loading: () => <div className="w-96 aspect-[2/3] bg-[#111] border border-[var(--jimbo-panel-edge)] animate-pulse" />
});

export function ClientDailyWeeLoader() {
    return <DailyRitualFn />;
}
