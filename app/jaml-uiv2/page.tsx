"use client";

import dynamic from 'next/dynamic';

const JamlUIV2 = dynamic(() => import('@/components/JamlUIV2'), {
    ssr: false,
    loading: () => (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <p className="text-white/70 font-pixel">Loading JAML editor…</p>
        </main>
    ),
});

export default function JamlUIV2Page() {
    return <JamlUIV2 />;
}
