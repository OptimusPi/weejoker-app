"use client";

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with circular dependencies
const JamlUIV2 = dynamic(() => import('@/components/JamlUIV2'), {
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center text-white/50">Loading Command Station...</div>
});

export default function JamlBuilderPage() {
    return (
        <JamlUIV2 />
    );
}
