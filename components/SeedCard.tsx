"use client";
import { SeedData } from "@/lib/types";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Sprite } from "./Sprite";
import { PlayingCard } from "./PlayingCard";
import { CardFan } from "./CardFan";
import { DeckSprite } from "./DeckSprite";
import { cn } from "@/lib/utils";
import { parseCardToken } from "@/lib/cardParser";
import { parseDailyRitualSeed, groupItemsByType } from "@/lib/parseDailyRitual";

interface SeedCardProps {
    seed: SeedData;
    dayNumber: number;
    className?: string;
    onAnalyze?: () => void;
    onOpenSubmit?: () => void;
    isLocked?: boolean;
    canSubmit?: boolean;
}

type CardView = 'DEFAULT' | 'PLAY' | 'SCORES';

export function SeedCard({ seed, dayNumber, className, onAnalyze, onOpenSubmit, isLocked, canSubmit }: SeedCardProps) {
    const [view, setView] = useState<CardView>('DEFAULT');
    const [copied, setCopied] = useState(false);
    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);
    const [allScores, setAllScores] = useState<{ id: number, player_name: string; score: number }[]>([]);

    // Fetch Scores
    useEffect(() => {
        if (dayNumber <= 0) return;
        let isMounted = true;
        fetch(`/api/scores?day=${dayNumber}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    const scores = data.scores || [];
                    setAllScores(scores);
                    if (scores.length > 0) {
                        setTopScore({ name: scores[0].player_name, score: scores[0].score });
                    } else {
                        setTopScore(null);
                    }
                }
            })
            .catch(() => {
                if (isMounted) setTopScore(null);
            });
        return () => { isMounted = false; };
    }, [dayNumber]);

    const handleCopy = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(seed.seed);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = seed.seed;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 3140);
    };

    const getItems = (types: ('joker' | 'tarot' | 'spectral' | 'planet' | 'voucher' | 'consumable')[]) => {
        // 1. If we have rich JAMZ relevantEvents, use them (The Templatized Future)
        if (seed.relevantEvents && seed.relevantEvents.length > 0) {
            return seed.relevantEvents
                .filter(e => {
                    if (types.includes('consumable')) {
                        return e.type === 'tarot' || e.type === 'spectral' || e.type === 'planet';
                    }
                    return types.includes(e.type as any);
                })
                .map(e => ({
                    id: e.id,
                    name: e.displayName || e.id,
                    tally: e.count || 1,
                    type: e.type,
                    ante: e.ante
                }));
        }

        // 2. Fallback for legacy flat data (The Hardcoded Past - we'll keep this until data is fully JAMZ)
        const items: { id: string; name: string; tally: number; type: string }[] = [];
        const ITEM_DEFS = [
            { key: 'WeeJoker_Ante1', id: 'weejoker', name: 'Wee Joker', type: 'joker' },
            { key: 'WeeJoker_Ante2', id: 'weejoker', name: 'Wee Joker', type: 'joker' },
            { key: 'Hack_Ante1', id: 'hack', name: 'Hack', type: 'joker' },
            { key: 'Hack_Ante2', id: 'hack', name: 'Hack', type: 'joker' },
            { key: 'HanginChad_Ante1', id: 'hangingchad', name: 'Hanging Chad', type: 'joker' },
            { key: 'HanginChad_Ante2', id: 'hangingchad', name: 'Hanging Chad', type: 'joker' },
            { key: 'blueprint_early', id: 'blueprint', name: 'Blueprint', type: 'joker' },
            { key: 'brainstorm_early', id: 'brainstorm', name: 'Brainstorm', type: 'joker' },
            { key: 'Showman_Ante1', id: 'showman', name: 'Showman', type: 'joker' },
            { key: 'Temperance', id: 'temperance', name: 'Temperance', type: 'consumable' },
            { key: 'Ankh_Ante1', id: 'ankh', name: 'Ankh', type: 'consumable' },
            { key: 'InvisibleJoker', id: 'invisiblejoker', name: 'Invisible Joker', type: 'voucher' },
        ];

        ITEM_DEFS.forEach(def => {
            const val = seed[def.key];
            if (typeof val === 'number' && val > 0 && types.includes(def.type as any)) {
                const existing = items.find(i => i.id === def.id);
                if (existing) existing.tally += val;
                else items.push({ id: def.id, name: def.name, tally: val, type: def.type });
            }
        });

        return items;
    };

    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        if (!isLocked) return;
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            if (diff < 0) { setTimeLeft("00:00:00"); return; }
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLocked]);

    return (
        <div className={cn("relative group flex flex-col", className)}>
            <div className="balatro-panel p-1.5 flex flex-col relative z-10 gap-1.5 !overflow-visible h-full">

                {/* [Seed Display] */}
                <div className="flex w-full overflow-visible rounded-lg border-2 border-black/20 shrink-0 h-16">
                    <div className="w-1/2 bg-black/40 flex items-center justify-center border-r-2 border-black/20 overflow-hidden px-1">
                        {!isLocked ? (
                            <button onClick={handleCopy} className="flex items-center gap-2 outline-none w-full justify-center juice-pop balatro-delay-1">
                                <div className={cn("p-1.5 rounded-md transition-colors shrink-0", copied ? 'bg-[var(--balatro-green)]' : 'bg-transparent')}>
                                    {copied ? <Check size={20} className="text-white" strokeWidth={4} /> : <Copy size={20} className="text-white/60" strokeWidth={3} />}
                                </div>
                                <span className={cn("font-header text-[22px] tracking-widest truncate", copied ? 'text-[var(--balatro-green)]' : 'text-white')}>{copied ? 'Copied!' : seed.seed}</span>
                            </button>
                        ) : (
                            <span className="font-header text-sm text-white/40 tracking-widest leading-none">--------</span>
                        )}
                    </div>
                    <div className="w-1/2 bg-black/20 flex items-center justify-center p-1 overflow-visible relative" style={{ minHeight: '64px' }}>
                        {!isLocked ? (
                            <div className="juice-pop balatro-delay-2 flex items-center gap-2">
                                {/* Stacked cards with deck sprite on top */}
                                <div className="relative" style={{ width: '42px', height: '54px' }}>
                                    {/* Back cards for stack effect - using offset sprites */}
                                    <div className="absolute opacity-40 translate-x-[4px] translate-y-[4px]">
                                        <DeckSprite deck="erratic" size={36} className="grayscale brightness-50" />
                                    </div>
                                    <div className="absolute opacity-60 translate-x-[2px] translate-y-[2px]">
                                        <DeckSprite deck="erratic" size={36} className="grayscale brightness-75" />
                                    </div>
                                    {/* Deck sprite on top */}
                                    <div className="absolute" style={{ left: '0', top: '0' }}>
                                        <DeckSprite deck="erratic" stake={seed.stake || 'white'} size={36} />
                                    </div>
                                </div>
                                {/* Labels to the right */}
                                <div className="flex flex-col gap-0">
                                    <span className="font-header text-[13px] text-white tracking-wide leading-tight">Erratic Deck</span>
                                    <span className="font-header text-[11px] text-white/50 tracking-wide leading-tight">White Stake</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative" style={{ width: '54px', height: '68px' }}>
                                <div className="absolute" style={{ left: '0', top: '0' }}>
                                    <DeckSprite deck="locked" size={48} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-1 justify-center shrink-0 mt-1">
                    {(['DEFAULT', 'PLAY', 'SCORES'] as CardView[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "balatro-tab balatro-button-red min-w-20 py-1.5 text-lg",
                                view === v && "balatro-selected-tab"
                            )}
                        >
                            {v === 'DEFAULT' ? 'Details' : v === 'PLAY' ? 'Strategy' : 'Scores'}
                        </button>
                    ))}
                </div>

                {/* View Container - Direct content, no inner panel */}
                <div className="flex-1 flex flex-col w-full relative overflow-hidden">
                    {view === 'DEFAULT' && (
                        <div className="flex-1 flex flex-col gap-1.5 py-1.5 overflow-visible">

                            {/* DECK Section */}
                            <div className="flex w-full min-h-[96px] bg-[var(--color-medium-grey)] rounded-xl overflow-hidden border-2 border-black/20 mb-2 relative shadow-md">
                                <div className="w-12 flex items-center justify-center relative shrink-0 border-r border-white/10">
                                    <span className="font-header text-[14px] text-white tracking-[0.25em] whitespace-nowrap -rotate-90 absolute uppercase">
                                        Deck
                                    </span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-3">
                                    <CardFan count={seed.startingDeck?.length || 0} cards={seed.startingDeck as string[]} />
                                </div>
                            </div>

                            {/* ITEMS Section - Ante 1 and Ante 2 */}
                            {/* ITEMS Section - Grouped by Type */}
                            {(() => {
                                // Parse items directly from the seed object using our new parser
                                const parsed = parseDailyRitualSeed(seed);
                                const { jokers, consumables, vouchers } = groupItemsByType(parsed.items);

                                // Helper to render a group section
                                const renderGroup = (label: string, items: any[], spriteWidth: number = 71) => (
                                    <div className="flex w-full min-h-[108px] bg-[var(--color-medium-grey)] rounded-xl overflow-hidden border-2 border-black/20 mb-2 relative shadow-md">
                                        {/* Left Label - Rotated Text */}
                                        <div className="w-12 flex items-center justify-center relative shrink-0 border-r border-white/10">
                                            <span className="font-header text-[18px] text-white tracking-[0.3em] whitespace-nowrap -rotate-90 absolute uppercase font-bold">
                                                {label}
                                            </span>
                                        </div>

                                        {/* Content Panel */}
                                        <div className="flex-1 p-2 pl-3 flex flex-wrap content-start items-center gap-3">
                                            {items.length > 0 ? (
                                                items.map((item, idx) => {
                                                    // Wee Joker Logic: It's the standard Joker sprite, just... wee.
                                                    const isWee = item.id === 'weejoker';
                                                    const finalWidth = isWee ? Math.round(spriteWidth * 0.6) : spriteWidth;

                                                    return (
                                                        <div key={`${item.id}-${idx}`} className="relative group/item shrink-0">
                                                            <Sprite name={item.id} width={finalWidth} className="drop-shadow-md transition-transform hover:scale-110 active:scale-95 duration-200" />

                                                            {/* Ante Badge */}
                                                            {item.ante && (
                                                                <div className="absolute -top-1 -right-1 bg-[var(--balatro-red)] text-white font-header text-[9px] min-w-[20px] h-[20px] px-1 rounded-md flex items-center justify-center border-2 border-black/40 shadow-sm z-20">
                                                                    {item.ante}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full py-4 opacity-20">
                                                    <span className="font-pixel text-[10px] uppercase tracking-wider text-white">Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="flex flex-col gap-4 mt-1">
                                        {/* JOKERS */}
                                        {renderGroup("JOKERS", jokers, 71)}

                                        {/* CONSUMABLES & VOUCHERS (Side by Side if space permits, or stacked) */}
                                        {(consumables.length > 0 || vouchers.length > 0) && (
                                            <div className="flex gap-2">
                                                {consumables.length > 0 && (
                                                    <div className="flex-1">
                                                        {renderGroup("CONSUMABLES", consumables, 45)}
                                                    </div>
                                                )}
                                                {vouchers.length > 0 && (
                                                    <div className="flex-1">
                                                        {renderGroup("VOUCHERS", vouchers, 45)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {view === 'PLAY' && (
                        <div className="flex-1 flex flex-col p-2 text-center gap-2 justify-center">
                            <h3 className="font-header text-[var(--balatro-gold)] text-[10px] uppercase tracking-widest shrink-0">Strategy Guide</h3>
                            <div className="font-header text-[9px] text-white/70 leading-relaxed uppercase tracking-wider flex-1 flex flex-col justify-center">
                                {seed.relevantEvents && seed.relevantEvents.length > 0 ? (
                                    seed.relevantEvents.slice(0, 4).map((e, idx) => (
                                        <p key={idx}>{idx + 1}. Find {e.displayName || e.id} (Ante {e.ante})</p>
                                    ))
                                ) : (
                                    <>
                                        <p>1. Buy Wee Joker in Ante {seed.WeeJoker_Ante1 ? '1' : '2'}.</p>
                                        <p>2. Copy it with Hack/Chad.</p>
                                        <p>3. Scale it with 2s.</p>
                                        <p>4. Submit your high score!</p>
                                    </>
                                )}
                            </div>
                            <button onClick={onAnalyze} className="balatro-button balatro-button-blue text-sm py-2 shrink-0">How do I play?</button>
                        </div>
                    )}

                    {view === 'SCORES' && (
                        <div className="flex-1 flex flex-col p-1.5 min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                                {allScores.length > 0 ? allScores.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-1 rounded-sm">
                                        <div className="flex gap-1.5 items-center">
                                            <span className="font-pixel text-[8px] text-white/20 w-3">#{idx + 1}</span>
                                            <span className="font-header text-[9px] text-white uppercase truncate max-w-[70px]">{s.player_name}</span>
                                        </div>
                                        <span className="font-header text-[9px] text-[var(--balatro-gold)]">{s.score.toLocaleString()}</span>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex items-center justify-center font-pixel text-[8px] text-white/10 uppercase italic">No scores yet</div>
                                )}
                            </div>
                            {canSubmit && (
                                <button onClick={onOpenSubmit} className="mt-1 w-full balatro-button balatro-button-gold text-[8px] py-2 uppercase shrink-0">Submit Score</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer UI */}
                <div className="mt-1.5 shrink-0 z-50 flex flex-col gap-1.5">
                    {!isLocked && view === 'DEFAULT' && (
                        <div className="flex gap-1.5">
                            <button
                                onClick={onAnalyze}
                                className="flex-1 balatro-button balatro-button-orange text-sm py-1.5 font-header"
                            >
                                How to play
                            </button>
                            {canSubmit && (
                                <button
                                    onClick={onOpenSubmit}
                                    className="flex-1 balatro-button balatro-button-gold text-sm py-1.5 font-header"
                                >
                                    Submit Score
                                </button>
                            )}
                        </div>
                    )}

                    {isLocked ? (
                        <div className="w-full bg-black/40 text-white/20 font-header text-sm py-2 rounded-lg flex items-center justify-center border border-white/5 tracking-widest">
                            Locked - Wee No. {dayNumber}
                        </div>
                    ) : view === 'DEFAULT' ? (
                        <button
                            onClick={() => setView('PLAY')}
                            className="w-full balatro-button balatro-button-blue text-sm py-1.5 tracking-widest font-header shrink-0"
                        >
                            Play Ritual No. {dayNumber}
                        </button>
                    ) : null}

                    {!isLocked && view !== 'DEFAULT' && (
                        <button
                            onClick={() => setView('DEFAULT')}
                            className="w-full balatro-button balatro-button-orange text-sm py-1.5 tracking-widest font-header shrink-0"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
