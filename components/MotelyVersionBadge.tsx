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
        <div className={cn("jimbo-version-badge font-pixel", className)}>
            {loading ? (
                <Loader2 size={10} className="animate-spin" />
            ) : (
                <span>Motely v{version}</span>
            )}
        </div>
    );
}
