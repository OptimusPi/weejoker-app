"use client";

import React, { useRef } from 'react';
import Editor, { OnMount, loader } from "@monaco-editor/react";
import { Copy, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JimboPanel, JimboInnerPanel } from './JimboPanel';

interface JamlEditorMonacoProps {
    value: string;
    onChange: (value: string | undefined) => void;
    diagnostics?: any;
    className?: string;
}

export default function JamlEditorMonaco({ value, onChange, diagnostics, className }: JamlEditorMonacoProps) {
    const editorRef = useRef<any>(null);

    const handleEditorWillMount = (monaco: any) => {
        // Define Jimbo Theme
        monaco.editor.defineTheme('jimbo-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '5f7377', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'fe5f55' }, // Jimbo Red
                { token: 'string', foreground: 'eac058' },  // Jimbo Gold
                { token: 'number', foreground: '009dff' },  // Jimbo Blue
                { token: 'type', foreground: '4bc292' },    // Jimbo Green
            ],
            colors: {
                'editor.background': '#1e2b2d', // Authentic G.C.BLACK variant
                'editor.foreground': '#ffffff',
                'editorLineNumber.foreground': '#4f6367',
                'editorLineNumber.activeForeground': '#eac058',
                'editor.selectionBackground': '#ffffff20',
                'editor.inactiveSelectionBackground': '#ffffff10',
                'editor.lineHighlightBackground': '#00000020',
                'editorCursor.foreground': '#eac058',

                // Widget/Popover Colors
                'editorWidget.background': '#1a1a1a', // Jimbo Dark
                'editorWidget.border': '#333333',
                'editorWidget.foreground': '#ffffff',

                // Suggestion List Colors
                'list.activeSelectionBackground': '#d8b97d', // Jimbo Gold Selection
                'list.activeSelectionForeground': '#1a1a1a', // Dark text on gold
                'list.hoverBackground': '#2a2a2a',
                'list.hoverForeground': '#ffffff',
                'list.focusBackground': '#d8b97d',
                'list.focusForeground': '#1a1a1a',
            }
        });
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        // Focus editor
        editor.focus();
    };

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
    };

    const hasErrors = diagnostics?.errors?.length > 0;

    return (
        <JimboInnerPanel className={cn("flex flex-col h-full !p-0 overflow-hidden group", className)}>
            {/* Toolbar */}
            <div className="h-10 bg-[#111] border-b border-[var(--jimbo-panel-edge)] flex items-center justify-between px-4 shrink-0 overflow-hidden">
                <div className="flex items-center gap-4">
                    <span className="font-header text-xs text-[var(--jimbo-red)] tracking-widest uppercase flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--jimbo-red)] animate-pulse" />
                        JAML EDITOR
                    </span>
                    <div className="h-4 w-px bg-[var(--jimbo-panel-edge)]" />
                    <div className="flex items-center gap-3">
                        <button onClick={handleFormat} className="text-[9px] font-pixel text-[var(--jimbo-grey)] hover:text-white uppercase tracking-tighter transition-colors">Format</button>
                        <button onClick={handleCopy} className="text-[9px] font-pixel text-[var(--jimbo-grey)] hover:text-white uppercase tracking-tighter transition-colors flex items-center gap-1">
                            <Copy size={10} /> Copy
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasErrors ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#211] border border-[var(--jimbo-red)] rounded text-[9px] font-pixel text-[var(--jimbo-red)]">
                            <AlertCircle size={10} />
                            <span>{diagnostics.errors.length} syntax error(s)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#121] border border-[var(--jimbo-dark-green)] rounded text-[9px] font-pixel text-[var(--jimbo-dark-green)]">
                            <Check size={10} />
                            <span>Syntax valid</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 min-h-0 relative">
                <Editor
                    height="100%"
                    defaultLanguage="yaml"
                    value={value}
                    theme="jimbo-dark"
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    beforeMount={handleEditorWillMount}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: 'var(--font-mono)',
                        lineNumbers: 'on',
                        roundedSelection: true,
                        readOnly: false,
                        cursorStyle: 'line',
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        suggest: {
                            showKeywords: true,
                            showSnippets: true,
                        }
                    }}
                />
            </div>

            {/* Quick Status Footer */}
            <div className="h-6 bg-[#111] border-t border-[var(--jimbo-panel-edge)] flex items-center px-4 justify-between shrink-0">
                <div className="text-[8px] font-pixel text-[var(--jimbo-grey)] uppercase">
                    Lines: {value.split('\n').length} | Encoding: UTF-8
                </div>
                <div className="text-[8px] font-pixel text-[var(--jimbo-grey)] uppercase tracking-widest">
                    Motely JAML Engine v1.0.4
                </div>
            </div>
        </JimboInnerPanel>
    );
}
