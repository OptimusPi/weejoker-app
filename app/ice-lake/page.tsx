import { SeedExplorer } from '@/components/SeedExplorer';

export default function IceLakePage() {
    return (
        <div className="min-h-screen bg-[var(--balatro-black)] text-white font-pixel p-2 md:p-6">
            <div className="max-w-md md:max-w-5xl mx-auto">
                <div className="mb-4 md:mb-8 text-center md:text-left">
                    <h1 className="text-2xl md:text-4xl font-header text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                        <span className="text-[var(--balatro-blue)]">ICE</span> LAKE
                    </h1>
                    <p className="text-white/60 text-xs md:text-base">
                        Direct connection to the R2 Seed Repository.
                        <br className="hidden md:block" />
                        <span className="md:ml-1">Query 1 Billion+ seeds using WASM + Parquet.</span>
                    </p>
                </div>

                <SeedExplorer />
                
                <div className="mt-4 md:mt-8 p-3 border border-white/5 rounded-lg bg-black/20 text-[10px] md:text-xs text-white/40 leading-relaxed hidden md:block">
                    <p className="mb-2 font-bold text-white/60">HOW IT WORKS:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Data is stored in Cloudflare R2 as partitioned Parquet files (e.g., <code>ranks/2s.parquet</code>).</li>
                        <li>Your browser uses DuckDB WASM to fetch <b>only</b> the metadata and specific columns needed.</li>
                        <li>Selected partitions are streamed into the Motley Engine (C# WASM) for deep analysis.</li>
                        <li>Zero-backend processing: All logic runs locally in your browser.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
