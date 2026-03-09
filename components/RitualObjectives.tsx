"use client";

import { useEffect, useState } from "react";
import { Sprite } from "./Sprite";
import { JimboPanel, JimboInnerPanel } from "@/components/JimboPanel";
import { parseJamlToObjectives } from "@/lib/jaml/jamlObjectives";

interface RitualObjectivesProps {
    jamlConfig: string;
}

interface Objective {
    type: string;
    value: string;
}

export function RitualObjectives({ jamlConfig }: RitualObjectivesProps) {
    const [objectives, setObjectives] = useState<Objective[]>([]);

    useEffect(() => {
        if (!jamlConfig) return;

        const names = parseJamlToObjectives(jamlConfig);
        setObjectives(names.map(name => ({ type: 'Target', value: name })));
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
