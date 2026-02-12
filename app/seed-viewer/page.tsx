"use client";

import dynamic from 'next/dynamic';

const SeedViewer = dynamic(() => import('@/components/SeedViewer'), {
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-[var(--balatro-black)]">
            <div className="animate-pulse font-header text-2xl text-[var(--balatro-blue)]">
                LOADING ANALYTICS...
            </div>
        </div>
    ),
    ssr: false
});

export default function SeedViewerPage() {
    return (
        <div className="flex-1 flex flex-col bg-[#1c2629] overflow-hidden">
            <SeedViewer />
        </div>
    );
}
