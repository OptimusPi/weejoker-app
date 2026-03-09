import React, { useCallback, useEffect, useState } from 'react';
import yaml from 'js-yaml';

const COLORS = {
    green: 'var(--jimbo-dark-green)',
    red: 'var(--jimbo-red)',
};

interface InteractiveJamlEditorProps {
    initialJaml?: string;
    onJamlChange?: (jamlYaml: string, parsed: unknown, isValid: boolean) => void;
    className?: string;
}

const DEFAULT_JAML = `# My JAML Filter
name: My Filter
deck: Red
stake: White

must:
  - joker: Blueprint
    edition: Negative
    antes: [1, 2, 3]

should:
  - soulJoker: Any
    score: 5
`;

export default function JamlEditor({ initialJaml, onJamlChange, className }: InteractiveJamlEditorProps) {
    const [text, setText] = useState(initialJaml || DEFAULT_JAML);
    const [isValid, setIsValid] = useState(true);

    const emitChange = useCallback((nextText: string) => {
        setText(nextText);
        if (!onJamlChange) return;
        try {
            onJamlChange(nextText, yaml.load(nextText), true);
            setIsValid(true);
        } catch {
            onJamlChange(nextText, null, false);
            setIsValid(false);
        }
    }, [onJamlChange]);

    useEffect(() => {
        setText(initialJaml || DEFAULT_JAML);
    }, [initialJaml]);

    return (
        <div className={`flex flex-col bg-[#111] text-white rounded-lg overflow-hidden min-h-[500px] border border-[var(--jimbo-panel-edge)] ${className ?? ''}`}>
            <textarea
                value={text}
                onChange={(e) => emitChange(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="flex-1 w-full resize-none outline-none border-none p-4 bg-[#111] text-white font-mono text-[13px] leading-[1.8]"
            />
            <div className="mt-0 p-2 bg-[#222] border-t border-[var(--jimbo-panel-edge)] flex flex-wrap gap-4 text-[12px] text-[var(--jimbo-grey)] font-mono">
                <span className="flex items-center gap-1.5">
                    <span className="jaml-legend-dot" style={{ backgroundColor: isValid ? COLORS.green : COLORS.red }}></span>
                    {isValid ? 'yaml ok' : 'yaml invalid'}
                </span>
                <span className="ml-auto opacity-60">plain text only</span>
            </div>
        </div>
    );
}
