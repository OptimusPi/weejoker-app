import {
    CLAUSE_TYPES, ARRAY_KEYS, ALL_DECKS, ALL_STAKES, ALL_JOKERS, SOUL_JOKERS,
    ALL_VOUCHERS, ALL_TAROTS, ALL_PLANETS, ALL_SPECTRALS, ALL_TAGS, ALL_BOSSES,
    ALL_RANKS, ALL_SUITS, ALL_EDITIONS, STANDARD_CARD_EDITIONS, ALL_SEALS, ALL_ENHANCEMENTS,
    ALL_EVENTS
} from './data';

export interface CompletionData {
    text: string;
    displayText: string;
    description: string;
    priority: number;
}

export enum YamlCompletionContext {
    TopLevelProperty,
    ClauseProperty,
    DeckValue,
    StakeValue,
    TypeValue,
    JokerValue,
    SoulJokerValue,
    TarotValue,
    SpectralValue,
    PlanetValue,
    VoucherValue,
    EditionValue,
    SealValue,
    EnhancementValue,
    RankValue,
    SuitValue,
    EventValue,
    EventTypeValue,
    AntesArray,
    SlotsArray,
    AnchorDefinition,
    AnchorReference
}

export class JamlCompletionService {
    public static getCompletions(textBeforeCursor: string): CompletionData[] {
        const context = this.determineContext(textBeforeCursor);
        const completions: CompletionData[] = [];

        switch (context) {
            case YamlCompletionContext.TopLevelProperty:
                this.addTopLevelCompletions(completions);
                break;
            case YamlCompletionContext.ClauseProperty:
                this.addClausePropertyCompletions(completions, textBeforeCursor);
                break;
            case YamlCompletionContext.DeckValue:
                this.addListCompletions(completions, ALL_DECKS, 5);
                break;
            case YamlCompletionContext.StakeValue:
                this.addListCompletions(completions, ALL_STAKES, 5);
                break;
            case YamlCompletionContext.TypeValue:
                this.addTypeCompletions(completions);
                break;
            case YamlCompletionContext.JokerValue:
                this.addListCompletions(completions, ALL_JOKERS, 5);
                break;
            case YamlCompletionContext.SoulJokerValue:
                this.addListCompletions(completions, SOUL_JOKERS, 10);
                break;
            case YamlCompletionContext.VoucherValue:
                this.addListCompletions(completions, ALL_VOUCHERS, 5);
                break;
            case YamlCompletionContext.TarotValue:
                this.addListCompletions(completions, ALL_TAROTS, 5);
                break;
            case YamlCompletionContext.PlanetValue:
                this.addListCompletions(completions, ALL_PLANETS, 5);
                break;
            case YamlCompletionContext.SpectralValue:
                this.addListCompletions(completions, ALL_SPECTRALS, 5);
                break;
            case YamlCompletionContext.EditionValue:
                this.addListCompletions(completions, ALL_EDITIONS, 8);
                break;
            case YamlCompletionContext.EventValue:
            case YamlCompletionContext.EventTypeValue:
                this.addListCompletions(completions, ALL_EVENTS, 8);
                break;
            case YamlCompletionContext.SealValue:
                this.addListCompletions(completions, ALL_SEALS, 8);
                break;
            case YamlCompletionContext.EnhancementValue:
                this.addListCompletions(completions, ALL_ENHANCEMENTS, 8);
                break;
            case YamlCompletionContext.RankValue:
                this.addListCompletions(completions, ALL_RANKS, 5);
                break;
            case YamlCompletionContext.SuitValue:
                this.addListCompletions(completions, ALL_SUITS, 5);
                break;
            case YamlCompletionContext.AntesArray:
                this.addAnteSnippets(completions);
                break;
            case YamlCompletionContext.SlotsArray:
                this.addSlotSnippets(completions);
                break;
            default:
                this.addTopLevelCompletions(completions);
                break;
        }

        // Sort by priority desc
        return completions.sort((a, b) => b.priority - a.priority);
    }

    private static determineContext(textBefore: string): YamlCompletionContext {
        // Check for anchor definition (key: &anchor_name)
        if (/:\s*&\w*$/.test(textBefore)) return YamlCompletionContext.AnchorDefinition;

        // Check for anchor reference (*anchor_name)
        if (/\*\w*$/.test(textBefore)) return YamlCompletionContext.AnchorReference;

        // Check strict property contexts
        if (/^deck\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.DeckValue;
        if (/^stake\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.StakeValue;
        if (/type\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.TypeValue;

        if (/edition\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.EditionValue;
        if (/seal\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.SealValue;
        if (/enhancement\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.EnhancementValue;
        if (/rank\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.RankValue;
        if (/suit\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.SuitValue;

        if (/(?:event|eventType)\s*:\s*$/im.test(textBefore)) return YamlCompletionContext.EventValue;

        // Type-aware value completion
        const typeMatch = textBefore.match(/(?:type|Type)\s*:\s*(Joker|SoulJoker|Voucher|Tarot|TarotCard|Planet|PlanetCard|Spectral|SpectralCard|Tag|Boss|BossBlind|StandardCard|Event)/i);

        if (/(?:value|joker|soulJoker)\s*:\s*$/im.test(textBefore)) {
            if (typeMatch) {
                switch (typeMatch[1].toLowerCase()) {
                    case 'joker': return YamlCompletionContext.JokerValue;
                    case 'souljoker': return YamlCompletionContext.SoulJokerValue;
                    case 'voucher': return YamlCompletionContext.VoucherValue;
                    case 'tarot': case 'tarotcard': return YamlCompletionContext.TarotValue;
                    case 'planet': case 'planetcard': return YamlCompletionContext.PlanetValue;
                    case 'spectral': case 'spectralcard': return YamlCompletionContext.SpectralValue;
                    case 'event': return YamlCompletionContext.EventValue;
                }
            }
            // Default guesses based on key name
            if (/soulJoker\s*:\s*$/i.test(textBefore)) return YamlCompletionContext.SoulJokerValue;
            return YamlCompletionContext.JokerValue;
        }

        // Arrays
        if (/antes\s*:\s*\[/im.test(textBefore)) return YamlCompletionContext.AntesArray;
        if (/(?:shop|pack)Slots\s*:\s*\[/im.test(textBefore)) return YamlCompletionContext.SlotsArray;

        // Check indent level for Clause vs Top Level
        const lines = textBefore.split('\n');
        const lastLine = lines[lines.length - 1] || '';
        const indent = lastLine.search(/\S|$/);

        if (indent <= 2) return YamlCompletionContext.TopLevelProperty;
        return YamlCompletionContext.ClauseProperty;
    }

    private static addTopLevelCompletions(completions: CompletionData[]) {
        completions.push(
            { text: 'anchor-param', displayText: 'desired_joker: &desired_joker OopsAll6s', description: 'YAML anchor', priority: 20 },
            { text: 'name', displayText: 'name: My Filter', description: 'Filter Name', priority: 15 },
            { text: 'deck', displayText: 'deck: Red', description: 'Starting Deck', priority: 14 },
            { text: 'must', displayText: 'must:\n  - joker: Blueprint', description: 'Required items', priority: 15 },
            { text: 'should', displayText: 'should:\n  - joker: Blueprint', description: 'Optional items', priority: 15 },
        );
    }

    private static addClausePropertyCompletions(completions: CompletionData[], textBefore: string) {
        const isAndOr = /(?:And|Or)\s*:\s*$/m.test(textBefore);
        if (isAndOr) {
            completions.push(
                { text: 'clauses', displayText: 'clauses:\n  - joker: Blueprint', description: 'Child clauses', priority: 15 },
                { text: 'Mode', displayText: 'Mode: Max', description: 'Logic Mode', priority: 14 }
            );
        } else {
            completions.push(
                { text: 'joker', displayText: 'joker: Blueprint', description: 'Joker', priority: 15 },
                { text: 'voucher', displayText: 'voucher: Telescope', description: 'Voucher', priority: 14 },
                { text: 'edition', displayText: 'edition: Negative', description: 'Edition', priority: 12 },
                { text: 'antes', displayText: 'antes: [1, 2]', description: 'Ante filter', priority: 12 },
                { text: 'sources', displayText: 'sources:\n  shopSlots: [0,1]', description: 'Specific sources', priority: 11 },
            );
        }
    }

    private static addListCompletions(completions: CompletionData[], items: readonly string[], priorityBase: number) {
        items.forEach(item => {
            completions.push({
                text: item,
                displayText: item,
                description: item,
                priority: priorityBase
            });
        });
    }

    private static addTypeCompletions(completions: CompletionData[]) {
        CLAUSE_TYPES.forEach(t => {
            // Capitalize for display
            const display = t.charAt(0).toUpperCase() + t.slice(1);
            completions.push({ text: display, displayText: display, description: t, priority: 10 });
        });
    }

    private static addAnteSnippets(completions: CompletionData[]) {
        completions.push(
            { text: '1-8', displayText: '[1, 2, 3, 4, 5, 6, 7, 8]', description: 'All Antes', priority: 10 },
            { text: '1-4', displayText: '[1, 2, 3, 4]', description: 'Early Game', priority: 9 }
        );
    }

    private static addSlotSnippets(completions: CompletionData[]) {
        completions.push(
            { text: 'all-shop', displayText: '[0, 1, 2, 3, 4, 5]', description: 'All Shop Slots', priority: 10 },
            { text: 'first-3', displayText: '[0, 1, 2]', description: 'First 3 Slots', priority: 9 }
        );
    }
}
