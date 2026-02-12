"use client";

import dynamic from 'next/dynamic';

const JamlUIV2 = dynamic(() => import('@/components/JamlUIV2'), {
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-[var(--balatro-black)]">
            <div className="animate-pulse font-header text-2xl text-[var(--balatro-gold)]">
                BOOTING COMMAND CENTER...
            </div>
        </div>
    ),
    ssr: false
});

export default function JamlBuilderPage() {
    return <JamlUIV2 />;
}
