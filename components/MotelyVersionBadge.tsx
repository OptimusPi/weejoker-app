"use client";

import { useEffect, useState } from 'react';
import { getVersion } from '@/lib/api/motelyWasm';
import { Loader2 } from 'lucide-react';

export function MotelyVersionBadge() {
    const [version, setVersion] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchVersion = async () => {
            try {
                const info = await getVersion();
                if (mounted) {
                    setVersion(info.version);
                }
            } catch (e) {
                console.error("Failed to get WASM version", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchVersion();
        return () => { mounted = false; };
    }, []);

    // Display package version if available, otherwise fallback to WASM version
    // The user prefers the package version (e.g. 1.2.8) over the assembly version (1.0.0.0)
    // but forbids hardcoded mapping. We read MOTELY_WASM_VERSION from env at build time.
    const packageVersion = process.env.MOTELY_WASM_VERSION;
    const displayVersion = packageVersion || version || 'Unknown';

    return (
        <div className="px-3 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-pixel text-white/30 uppercase tracking-widest flex items-center gap-2">
            {loading ? (
                <Loader2 size={10} className="animate-spin" />
            ) : (
                <span>Motely v{displayVersion}</span>
            )}
        </div>
    );
}
