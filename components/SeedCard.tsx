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
import { JimboPanel, JimboInnerPanel } from "@/components/JimboPanel";

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

// Helper: Extract featured rank from startingDeck
// In Balatro, ranks are [2,3,4,5...J,Q,K,A]. For Wee Joker ritual, prioritize 2.
function computeFeaturedRank(startingDeck: string[]): "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King" | "Ace" {
    if (!startingDeck || startingDeck.length === 0) return '2';

    const rankCounts: Record<string, number> = {};
    for (const card of startingDeck) {
        const [rank] = card.split('_');
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    }

    // For Wee Joker daily, rank 2 is the priority
    if ((rankCounts['2'] || 0) > 8) return '2'; // Heavy 2s deck

    // Otherwise, find most common rank
    let maxRank = '2';
    let maxCount = rankCounts['2'] || 0;
    for (const [rank, count] of Object.entries(rankCounts)) {
        if (count > maxCount) { maxCount = count; maxRank = rank; }
    }

    const rankMap: Record<string, "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King" | "Ace"> = {
        '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
        'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
    };
    return rankMap[maxRank] || '2';
}

// Helper: Extract featured suit from startingDeck
function computeFeaturedSuit(startingDeck: string[]): "Hearts" | "Clubs" | "Diamonds" | "Spades" {
    if (!startingDeck || startingDeck.length === 0) return 'Hearts';

    const suitCounts: Record<string, number> = {};
    for (const card of startingDeck) {
        const [, suit] = card.split('_');
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    }

    let maxSuit = 'H';
    let maxCount = 0;
    for (const [suit, count] of Object.entries(suitCounts)) {
        if (count > maxCount) { maxCount = count; maxSuit = suit; }
    }

    const suitMap: Record<string, "Hearts" | "Clubs" | "Diamonds" | "Spades"> = {
        'H': 'Hearts', 'C': 'Clubs', 'D': 'Diamonds', 'S': 'Spades',
    };
    return suitMap[maxSuit] || 'Hearts';
}

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
            .then(res => res.json() as Promise<{ scores: any[] }>)
            .then((data) => {
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
            <JimboPanel className="p-1.5 flex flex-col relative z-10 gap-1.5 !overflow-visible h-full">

                {/* [Seed Display] */}
                <div className="flex w-full overflow-visible border-2 border-[var(--jimbo-panel-edge)] rounded-lg shrink-0 h-16 bg-[#1a1a1a]">
                    <div className="w-1/2 flex items-center justify-center border-r-2 border-[var(--jimbo-panel-edge)] px-1">
                        {!isLocked ? (
                            <button onClick={handleCopy} className="flex items-center gap-2 outline-none w-full justify-center juice-pop">
                                <div className={cn("p-1.5 rounded-md transition-colors shrink-0", copied ? 'bg-[var(--jimbo-dark-green)]' : 'bg-transparent')}>
                                    {copied ? <Check size={20} className="text-[var(--jimbo-dark-green)]" strokeWidth={4} /> : <Copy size={20} className="text-[var(--jimbo-grey)]" strokeWidth={3} />}
                                </div>
                                <span className={cn("font-header text-[22px] tracking-widest truncate", copied ? 'text-[var(--jimbo-dark-green)]' : 'text-white')}>{copied ? 'Copied!' : seed.seed}</span>
                            </button>
                        ) : (
                            <span className="font-header text-sm text-[var(--jimbo-grey)] tracking-widest leading-none">--------</span>
                        )}
                    </div>

                    <div className="w-1/2 bg-[var(--jimbo-panel-edge)] flex items-center justify-center p-1 relative overflow-visible" style={{ minHeight: '64px' }}>
                        {!isLocked ? (
                            <div className="juice-pop flex items-center gap-2 relative">
                                <div className="relative juice-pop balatro-delay-2" style={{ width: '60px', height: '80px' }}>
                                    {/* Stacked deck backs - tilted RIGHT */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ transform: 'rotate(12deg)', transformOrigin: 'center' }}
                                    >
                                        <DeckSprite deck="erratic" stake={seed.stake || 'white'} size={48} />
                                    </div>
                                    {/* Card face overlay - tilted LEFT, on top */}
                                    {seed.startingDeck && seed.startingDeck.length > 0 && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center"
                                            style={{ transform: 'rotate(-8deg)', transformOrigin: 'center', zIndex: 1 }}
                                        >
                                            <PlayingCard
                                                rank={computeFeaturedRank(seed.startingDeck)}
                                                suit={computeFeaturedSuit(seed.startingDeck)}
                                                size={40}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0">
                                    <span className="font-header text-[13px] text-white tracking-wide leading-tight">Erratic Deck</span>
                                    <span className="font-header text-[11px] text-[var(--jimbo-grey)] tracking-wide leading-tight">White Stake</span>
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
                                "jimbo-btn min-w-20 py-1.5 text-lg cursor-pointer transition-colors duration-150 active:translate-y-[2px] active:shadow-[0_0_0_0_var(--btn-shadow)] text-white text-shadow-sm font-header text-lg uppercase tracking-widest shadow-[inset_0_2px_0_rgba(255,255,255,0.2),0_4px_0_0_var(--btn-shadow)] flex items-center justify-center gap-2 px-6",
                                view === v ? "bg-[#333] border border-[#555] opacity-50 pointer-events-none" : "jimbo-btn-red"
                            )}
                        >
                            {v === 'DEFAULT' ? 'Details' : v === 'PLAY' ? 'Strategy' : 'Scores'}
                        </button>
                    ))}
                </div>

                {/* View Container */}
                <div className="flex-1 flex flex-col w-full relative overflow-hidden">
                    {view === 'DEFAULT' && (
                        <div className="flex-1 flex flex-col gap-1.5 py-1.5 overflow-visible">
                            {/* DECK Section */}
                            <JimboInnerPanel className="flex w-full min-h-[96px] overflow-hidden mb-2 p-0 flex-row">
                                <div className="w-12 flex items-center justify-center relative shrink-0 border-r border-transparent">
                                    <span className="font-header text-[14px] text-white tracking-[0.25em] whitespace-nowrap -rotate-90 absolute uppercase">
                                        Deck
                                    </span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-3">
                                    <CardFan count={seed.startingDeck?.length || 0} cards={seed.startingDeck as string[]} />
                                </div>
                            </JimboInnerPanel>

                            {/* ITEMS Section */}
                            {(() => {
                                const parsed = parseDailyRitualSeed(seed);
                                const { jokers, consumables, vouchers } = groupItemsByType(parsed.items);

                                const renderGroup = (label: string, items: any[], spriteWidth: number = 71) => (
                                    <JimboInnerPanel className="flex w-full min-h-[108px] overflow-hidden mb-2 p-0 flex-row">
                                        <div className="w-12 flex items-center justify-center relative shrink-0 border-r border-transparent">
                                            <span className="font-header text-[18px] text-white tracking-[0.3em] whitespace-nowrap -rotate-90 absolute uppercase font-bold">
                                                {label}
                                            </span>
                                        </div>

                                        <div className="flex-1 p-2 pl-3 flex flex-wrap content-start items-center gap-3">
                                            {items.length > 0 ? (
                                                items.map((item, idx) => {
                                                    const isWee = item.id === 'weejoker';
                                                    const finalWidth = isWee ? Math.round(spriteWidth * 0.6) : spriteWidth;

                                                    return (
                                                        <div key={`${item.id}-${idx}`} className="relative group/item shrink-0">
                                                            <Sprite name={item.id} width={finalWidth} className="drop-shadow-md transition-transform hover:scale-110 active:scale-95 duration-75 ease-out" />

                                                            {item.ante && (
                                                                <div className="absolute -top-1 -right-1 bg-[var(--jimbo-red)] text-white font-header text-[9px] min-w-[20px] h-[20px] px-1 rounded-md flex items-center justify-center shadow-sm z-20">
                                                                    {item.ante}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full py-4 opacity-50">
                                                    <span className="font-pixel text-[10px] uppercase tracking-wider text-[var(--jimbo-grey)]">Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    </JimboInnerPanel>
                                );

                                return (
                                    <div className="flex flex-col gap-4 mt-1">
                                        {renderGroup("JOKERS", jokers, 71)}
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
                            <h3 className="font-header text-[var(--jimbo-gold)] text-[10px] uppercase tracking-widest shrink-0">Strategy Guide</h3>
                            <div className="font-header text-[9px] text-[var(--jimbo-border-silver)] leading-relaxed uppercase tracking-wider flex-1 flex flex-col justify-center">
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
                            <button onClick={onAnalyze} className="jimbo-btn jimbo-btn-blue text-sm py-2 shrink-0 w-full uppercase">Analyze Seed</button>
                        </div>
                    )}

                    {view === 'SCORES' && (
                        <div className="flex-1 flex flex-col p-1.5 min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                                {allScores.length > 0 ? (
                                    allScores.map((s, idx) => (
                                        <JimboInnerPanel key={idx} className="flex justify-between items-center p-1 py-1 px-2 rounded-sm mb-1">
                                            <div className="flex gap-1.5 items-center">
                                                <span className="font-pixel text-[8px] text-[var(--jimbo-grey)] w-3">#{idx + 1}</span>
                                                <span className="font-header text-[9px] text-white uppercase truncate max-w-[70px] font-bold">{s.player_name}</span>
                                            </div>
                                            <span className="font-header text-[9px] text-[var(--jimbo-gold)]">{s.score.toLocaleString()}</span>
                                        </JimboInnerPanel>
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center font-pixel text-[8px] text-[var(--jimbo-grey)] uppercase italic">No scores yet</div>
                                )}
                            </div>
                            {canSubmit && (
                                <button onClick={onOpenSubmit} className="mt-1 w-full jimbo-btn jimbo-btn-gold text-[8px] py-2 uppercase shrink-0">Submit Score</button>
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
                                className="flex-1 jimbo-btn jimbo-btn-orange text-sm py-1.5 font-header uppercase"
                            >
                                How to play
                            </button>
                            {canSubmit && (
                                <button
                                    onClick={onOpenSubmit}
                                    className="flex-1 jimbo-btn jimbo-btn-gold text-sm py-1.5 font-header uppercase"
                                >
                                    Submit Score
                                </button>
                            )}
                        </div>
                    )}

                    {isLocked ? (
                        <div className="w-full bg-[var(--jimbo-panel-edge)] text-[var(--jimbo-grey)] font-header text-sm py-2 rounded-lg flex items-center justify-center tracking-widest">
                            Locked - Wee No. {dayNumber}
                        </div>
                    ) : view === 'DEFAULT' ? (
                        <button
                            onClick={() => setView('PLAY')}
                            className="w-full jimbo-btn jimbo-btn-blue text-sm py-1.5 tracking-widest font-header shrink-0 uppercase"
                        >
                            Play Ritual No. {dayNumber}
                        </button>
                    ) : null}

                    {!isLocked && view !== 'DEFAULT' && (
                        <button
                            onClick={() => setView('DEFAULT')}
                            className="w-full jimbo-btn jimbo-btn-orange text-sm py-1.5 tracking-widest font-header shrink-0 uppercase"
                        >
                            Back
                        </button>
                    )}
                </div>
            </JimboPanel>
        </div>
    );
}
