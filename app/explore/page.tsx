"use client";

import dynamic from 'next/dynamic';
import { DuckDBProvider } from '@/components/DuckDBProvider';
import NavBar from '@/components/NavBar';
import { PageFooter } from '@/components/PageFooter';

const SeedExplorer = dynamic(() => import('@/components/SeedExplorer').then(m => ({ default: m.SeedExplorer })), {
    ssr: false,
    loading: () => (
        <div className="flex flex-1 items-center justify-center text-white/30 font-pixel text-xs">
            Loading Ice Lake...
        </div>
    ),
});

export default function ExplorePage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--balatro-black)]">
            <NavBar />
            <main className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
                <div className="mb-4">
                    <h1 className="font-header text-2xl text-white mb-1">Ice Lake</h1>
                    <p className="text-[11px] text-white/30 font-pixel">
                        Query pre-sorted Erratic deck seeds via Parquet on R2.
                        Only the top 0.5% most interesting seeds are here — those with extreme rank or suit duplication.
                    </p>
                </div>
                <DuckDBProvider>
                    <SeedExplorer />
                </DuckDBProvider>
            </main>
            <PageFooter />
        </div>
    );
}
