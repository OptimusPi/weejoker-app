```
"use client";

import { Badge } from '@/components/ui/badge';

export function WasmStatus() {
    return (
                    WASM ENGINE: {status.toUpperCase()}
                </span>
                {error && <span className="text-[8px] opacity-70 truncate max-w-[200px]">{error}</span>}
            </div>
        </div>
    );
}
