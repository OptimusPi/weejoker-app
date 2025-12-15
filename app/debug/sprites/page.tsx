"use client";

import { Sprite } from "@/components/Sprite";

export default function SpriteDebugPage() {
    // List of keys we want to test
    // Based on what I find in the JSON, I'll update these.
    // For now assuming "weejoker", "hack", "blueprint", "brainstorm" exist.
    const showcase = [
        "weejoker",
        "hack",
        "hangingchad",
        "sockandbuskin",
        "pareidolia",
        "blueprint",
        "brainstorm",
        "joker" // Standard
    ];

    return (
        <div className="min-h-screen bg-[#333] p-10 text-white font-sans">
            <h1 className="text-3xl mb-8 border-b border-white/20 pb-4">Sprite Service Debug</h1>

            <section className="mb-12">
                <h2 className="text-xl mb-4 text-[#429f79] font-bold">1. Scale Test (Wee Joker)</h2>
                <div className="flex items-end gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="text-center">
                        <Sprite name="weejoker" width={35} />
                        <p className="text-xs mt-2 text-zinc-400">35px (Tiny)</p>
                    </div>
                    <div className="text-center">
                        <Sprite name="weejoker" width={71} />
                        <p className="text-xs mt-2 text-zinc-400">71px (Native)</p>
                    </div>
                    <div className="text-center">
                        <Sprite name="weejoker" width={142} />
                        <p className="text-xs mt-2 text-zinc-400">142px (2x)</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl mb-4 text-[#0093ff] font-bold">2. Synergy Synergy</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {showcase.map(name => (
                        <div key={name} className="flex flex-col items-center bg-black/40 p-4 rounded-lg border border-white/5">
                            <Sprite name={name} />
                            <code className="mt-4 text-sm bg-black px-2 py-1 rounded text-[#eaba44]">
                                {name}
                            </code>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
