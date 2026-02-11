import { SeedExplorer } from '@/components/SeedExplorer';

export default function IceLakePage() {
    return (
        <div className="min-h-screen bg-[var(--balatro-black)] text-white font-pixel p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-header text-white mb-2 flex items-center gap-3">
                        <span className="text-[var(--balatro-blue)]">ICE</span> LAKE
                    </h1>
                    <p className="text-white/60">
                        Direct connection to the R2 Seed Repository.
                        <br />
                        Query 2.3 Trillion seeds using WASM + Parquet.
                    </p>
                </div>

                <SeedExplorer />
                
                <div className="mt-8 p-4 border border-white/5 rounded-lg bg-black/20 text-xs text-white/40 leading-relaxed">
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
