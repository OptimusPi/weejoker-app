"use client";

import dynamic from "next/dynamic";

const DailyRitualFn = dynamic(() => import("@/components/DailyRitual").then(mod => mod.DailyRitual), {
    ssr: false,
    loading: () => <div className="w-96 aspect-[2/3] bg-black/20 rounded-xl animate-pulse" />
});

export function ClientDailyWeeLoader() {
    return <DailyRitualFn />;
}
