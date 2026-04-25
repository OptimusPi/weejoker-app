import { SeedData } from "@/lib/types";
import { X } from "lucide-react";

interface SeedAnalysisOverlayProps {
    seed: SeedData;
    onClose: () => void;
}

export function SeedAnalysisOverlay({ seed, onClose }: SeedAnalysisOverlayProps) {
    const events = seed.relevantEvents ?? [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/95 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto balatro-panel bg-balatro-panel p-6 animate-in zoom-in-95 duration-200 border-4 border-white/20 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-balatro-red text-white rounded border-b-4 border-red-800 hover:bg-red-500 active:translate-y-1 active:border-b-0 transition-all font-header shadow-balatro"
                    aria-label="Close"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <h2 className="text-3xl font-header text-white mb-6 flex items-center gap-3">
                    <span className="text-balatro-blue bg-black/30 px-3 py-1 rounded">#{seed.seed}</span>
                    <span className="text-white/60 text-xl font-pixel">Analysis</span>
                </h2>

                <div className="mb-4 flex gap-3 font-pixel text-lg">
                    <span className="px-4 py-1 rounded bg-balatro-blue text-white border-2 border-white/20">
                        Score: {seed.score}
                    </span>
                </div>

                {events.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-base font-header text-white/70 uppercase tracking-wider mb-3">Notable Items</h3>
                        {events.map((ev, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded bg-black/30 border border-white/10 font-pixel text-sm text-white">
                                <span className="text-balatro-blue">A{ev.ante}</span>
                                <span className="text-white/50 capitalize">{ev.source.replace('_', ' ')}</span>
                                <span className="font-bold">{ev.displayName ?? ev.id}</span>
                                {ev.edition && <span className="text-yellow-400 capitalize">{ev.edition}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {events.length === 0 && (
                    <p className="text-gray-500 italic font-pixel text-sm">No notable events tracked for this seed.</p>
                )}
            </div>
        </div>
    );
}
