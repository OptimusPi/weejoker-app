import React, { useCallback, useEffect, useState } from 'react';
import yaml from 'js-yaml';
import { JimboPanel, JimboInnerPanel, cn } from '@jimbo-ui/components/Panel';
import { JimboColorOption } from '@jimbo-ui/types';


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
        <JimboPanel className={cn("min-h-[500px]", className)}>
            <textarea
                title="JAML Editor"
                placeholder="Enter JAML..."
                value={text}
                onChange={(e) => emitChange(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="flex-1 w-full resize-none outline-none border-none p-4 bg-transparent text-white font-mono text-[13px] leading-[1.8]"
            />
            <JimboInnerPanel className="mt-0 p-2 flex flex-wrap gap-4 text-[12px] text-[var(--jimbo-grey)] font-mono">
                <span className="flex items-center gap-1.5">
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                            backgroundColor: isValid ? JimboColorOption.DARK_GREEN : JimboColorOption.RED,
                            boxShadow: `0 0 8px ${isValid ? JimboColorOption.DARK_GREEN : JimboColorOption.RED}`
                        }}
                    ></span>
                    <span style={{ color: isValid ? JimboColorOption.DARK_GREEN : JimboColorOption.RED }}>
                        {isValid ? 'JAML VIBES' : 'JAML ERROR'}
                    </span>
                </span>
                <span className="ml-auto opacity-60">plain text only</span>
            </JimboInnerPanel>
        </JimboPanel>
    );
}

