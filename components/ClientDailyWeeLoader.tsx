"use client";

import dynamic from "next/dynamic";

const DailyWeeFn = dynamic(() => import("@/components/DailyWee").then(mod => mod.DailyWee), {
    ssr: false,
    loading: () => <div className="w-96 aspect-[2/3] bg-black/20 rounded-xl animate-pulse" />
});

export function ClientDailyWeeLoader() {
    return <DailyWeeFn />;
}
