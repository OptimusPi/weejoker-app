"use client";

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with circular dependencies
const JamlBuilder = dynamic(() => import('@/components/JamlBuilder'), {
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center text-white/50">Loading JAML Builder...</div>
});

export default function JamlBuilderPage() {
    return (
        <main className="min-h-screen w-full">
            <JamlBuilder />
        </main>
    );
}
