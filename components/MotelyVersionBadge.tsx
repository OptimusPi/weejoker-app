"use client";

import { useEffect, useState } from 'react';
import { getCapabilities, type CapabilitiesInfo } from '@/lib/api/motelyWasm';
import { Loader2, Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MotelyVersionBadgeProps {
    className?: string;
    minimal?: boolean;
}

export function MotelyVersionBadge({ className, minimal = false }: MotelyVersionBadgeProps) {
    const [caps, setCaps] = useState<CapabilitiesInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchCaps = async () => {
            try {
                const info = await getCapabilities();
                if (mounted) {
                    setCaps(info);
                }
            } catch (e) {
                console.error("Failed to get WASM capabilities", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchCaps();
        return () => { mounted = false; };
    }, []);

    const version = caps?.version || '...';

    if (minimal) {
        if (loading) return <span className={cn("font-pixel text-[10px] text-white/10 animate-pulse", className)}>Initializing...</span>;
        
        return (
            <span className={cn("font-pixel text-[10px] text-white/20 flex items-center gap-2", className)}>
                <span>v{version}</span>
                {caps?.simd && <span title="SIMD Enabled" className="text-[var(--balatro-blue)]">⚡</span>}
                {caps?.threads && <span title="Multi-threaded" className="text-[var(--balatro-green)]">🧵</span>}
            </span>
        );
    }

    return (
        <div className={cn("px-3 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-pixel text-white/30 tracking-widest flex items-center gap-3", className)}>
            {loading ? (
                <Loader2 size={10} className="animate-spin" />
            ) : (
                <>
                    <span>Motely v{version}</span>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        {caps?.simd && (
                            <span title="SIMD Active">
                                <Zap size={10} className="text-[var(--balatro-blue)]" />
                            </span>
                        )}
                        {caps?.threads && (
                            <span title={`Multi-threaded (${caps.processorCount} cores)`}>
                                <Cpu size={10} className="text-[var(--balatro-green)]" />
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
