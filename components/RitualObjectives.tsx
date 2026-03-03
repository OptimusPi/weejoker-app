"use client";

import { useEffect, useState } from "react";
import { Sprite } from "./Sprite";
import { JimboPanel, JimboInnerPanel } from "@/components/JimboPanel";

interface RitualObjectivesProps {
    jamlConfig: string | null;
}

interface Objective {
    type: string;
    value: string;
    ante?: number;
}

export function RitualObjectives({ jamlConfig }: RitualObjectivesProps) {
    const [objectives, setObjectives] = useState<Objective[]>([]);

    useEffect(() => {
        if (!jamlConfig) return;

        // Simple parsing for "must:" clause list
        // This is a naive regex parser for display purposes only
        const lines = jamlConfig.split('\n');
        const foundObjectives: Objective[] = [];

        let inMustBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('must:')) {
                inMustBlock = true;
                continue;
            }
            if (inMustBlock && (line.startsWith('should:') || line.startsWith('mustNot:'))) {
                break;
            }

            if (inMustBlock && line.startsWith('-')) {
                // Parse "- type: Joker" //       "value: Wee Joker" //       "antes: [1,2]"
                // Hacky visual parser for now: // Look for "value: X" lines inside the must block
                if (line.includes('value:')) {
                    const val = line.split('value:')[1].trim();
                    foundObjectives.push({ type: 'Target', value: val });
                }
            }
        }

        // If naive parsing fails, fallback to regex on the whole block
        const mustBlock = jamlConfig.split('must:')[1]?.split('should:')[0]?.split('mustNot:')[0];
        if (mustBlock) {
            const valueMatches = mustBlock.matchAll(/value:\s*([^\n]+)/g);
            for (const match of valueMatches) {
                if (!foundObjectives.find(o => o.value === match[1].trim())) {
                    foundObjectives.push({ type: 'Find', value: match[1].trim() });
                }
            }
        }

        setObjectives(foundObjectives);
    }, [jamlConfig]);

    if (!jamlConfig || objectives.length === 0) return null;

    return (
        <div className="w-full max-w-[400px] mb-4 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="font-header text-[var(--jimbo-gold)] text-lg uppercase tracking-widest text-shadow-md">
                Current Objectives
            </h3>

            <div className="flex gap-4">
                {objectives.map((obj, i) => (
                    <JimboPanel key={i} className="!p-2 flex items-center gap-3 bg-[var(--jimbo-dark-blue)] border-[var(--jimbo-border-silver)]">
                        <JimboInnerPanel className="w-10 h-10 flex items-center justify-center p-0">
                            <Sprite name={obj.value.replace(/ /g, '').toLowerCase()} width={32} />
                        </JimboInnerPanel>
                        <div className="flex flex-col">
                            <span className="font-pixel text-[10px] uppercase text-[var(--jimbo-grey)] tracking-wider">Target</span>
                            <span className="font-header text-white text-md leading-none">{obj.value}</span>
                        </div>
                    </JimboPanel>
                ))}
            </div>
        </div>
    );
}
