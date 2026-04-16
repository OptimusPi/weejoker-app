import { AnalyzedSeed } from '../seedAnalyzer';
import { JamlClause, JamlFilter } from '../hooks/useJamlFilter';

export interface ClauseMatch {
    clause: JamlClause;
    item: AnalyzedItem;
    ante: number;
    source: string;
    priority: 'must' | 'should' | 'mustNot';
}

export interface EvaluationResult {
    isMatch: boolean;
    score: number;
    matches: ClauseMatch[];
    failedClauses: JamlClause[];
}

export interface AnalyzedItem {
    type: string;
    id: string; // "weejoker", "the_soul"
    name: string; // "Wee Joker", "The Soul"
    ante: number;
    source: string; // "shop", "buffoon_pack", "tag"
    slot?: number;
    edition?: string;
    stickers?: string[];
    // properties for matching
    rank?: string;
    suit?: string;
    enhancement?: string;
    seal?: string;
}

/**
 * Normalizes a clause type or item type for comparison
 */
function normalizeType(type: string): string {
    return type.toLowerCase().replace(/_|\s/g, '');
}

/**
 * Checks if an item matches a specific clause
 */
function isClauseMatch(clause: JamlClause, item: AnalyzedItem): boolean {
    // 1. Check Type (Joker, Tarot, etc.)
    if (clause.type && !['Any', 'Item', ''].includes(clause.type)) {
        const normalizedClauseType = normalizeType(clause.type);
        const normalizedItemType = normalizeType(item.type);

        // Basic category checks
        if (normalizedClauseType === 'joker' && normalizedItemType !== 'joker') return false;
        if (normalizedClauseType === 'tarot' && normalizedItemType !== 'tarot') return false;
        if (normalizedClauseType === 'spectral' && normalizedItemType !== 'spectral') return false;
        if (normalizedClauseType === 'planet' && normalizedItemType !== 'planet') return false;
        if (normalizedClauseType === 'voucher' && normalizedItemType !== 'voucher') return false;
    }

    // 2. Check Name/Value
    const clauseValue = clause.value.toLowerCase().trim();
    const itemName = item.name.toLowerCase().trim();
    const itemId = item.id.toLowerCase().trim();

    // Check for exact name match OR ID match
    const nameMatch = itemName === clauseValue || itemId === clauseValue || itemName.includes(clauseValue);

    if (!nameMatch) return false;

    // 3. Check Ante
    if (clause.antes && clause.antes.length > 0) {
        if (!clause.antes.includes(item.ante)) return false;
    }

    // 4. Check Source
    if (clause.sources && clause.sources.length > 0) {
        // Normalize sources: "buffoon pack" -> "buffoon_pack"
        const normalizedItemSource = item.source.toLowerCase().replace(/\s/g, '_');
        const matchSource = clause.sources.some(s => {
            const normalizedClauseSource = s.toLowerCase().replace(/\s/g, '_');
            return normalizedItemSource.includes(normalizedClauseSource);
        });
        if (!matchSource) return false;
    }

    // 5. Check Edition
    if (clause.edition) {
        if (!item.edition || item.edition.toLowerCase() !== clause.edition.toLowerCase()) return false;
    }

    // 6. Check Stickers (Eternal/Perishable/Rental)
    // JAML might specify "sticker: eternal" or "eternal: true" (handled by stickers array)
    // Note: The Clause interface provided in useJamlFilter doesn't have 'stickers' array yet, 
    // but might use generic properties. For now we skip strict sticker matching unless 
    // it's added to the interface.

    return true;
}

/**
 * flattenAnalyzedSeed converts the rich AnalyzedSeed structure 
 * into a flat list of AnalyzedItems for easy iteration.
 */
function flattenAnalyzedSeed(seedData: AnalyzedSeed): AnalyzedItem[] {
    const items: AnalyzedItem[] = [];

    // Helper to push items
    const pushItem = (
        type: string,
        baseItem: { id: string, name: string, ante: number, source: string, edition?: string, slot?: number }
    ) => {
        items.push({
            type,
            id: baseItem.id,
            name: baseItem.name,
            ante: baseItem.ante,
            source: baseItem.source,
            slot: baseItem.slot,
            edition: baseItem.edition
        });
    };

    // Jokers
    seedData.jokers.forEach(j => pushItem('Joker', j));

    // Consumables
    seedData.consumables.forEach(c => pushItem(c.type, c)); // type is 'tarot', 'spectral', etc.

    // Vouchers
    seedData.vouchers.forEach(v => items.push({
        type: 'Voucher',
        id: v.id,
        name: v.name,
        ante: v.ante,
        source: 'shop' // Vouchers usually in shop
    }));

    // Bosses
    seedData.bosses.forEach(b => items.push({
        type: 'Boss',
        id: b.boss,
        name: b.boss,
        ante: b.ante,
        source: 'blinds'
    }));

    // Tags
    seedData.tags.forEach(t => items.push({
        type: 'Tag',
        id: t.tag,
        name: t.tag,
        ante: t.ante,
        source: 'blinds'
    }));

    // Shop Queue (Contains everything visible in shop)
    Object.values(seedData.antes).forEach((anteData, index) => {
        const anteNum = parseInt(Object.keys(seedData.antes)[index]); // Wait, dictionary keys might not be ordered? Use index+1 or key?
        // Actually AnalyzedSeed.antes is Record<number, ...> so we should iterate keys

        // Items in shop queue (already captured by jokers/consumables arrays mostly? 
        // Blueprint's transform logic pushes shop items to jokers/consumables arrays.
        // But let's ensuring we capture everything if AnalyzedSeed is robust.)
    });

    return items;
}


export function evaluateSeed(seedData: AnalyzedSeed, filter: JamlFilter): EvaluationResult {
    const allItems = flattenAnalyzedSeed(seedData);
    const matches: ClauseMatch[] = [];
    const failedClauses: JamlClause[] = [];
    let score = 0;

    // 1. Evaluate MUST clauses
    // All MUST clauses must be matched by at least one item.
    let allMustPassed = true;
    for (const clause of filter.must) {
        const match = allItems.find(item => isClauseMatch(clause, item));
        if (match) {
            matches.push({ clause, item: match, ante: match.ante, source: match.source, priority: 'must' });
        } else {
            allMustPassed = false;
            failedClauses.push(clause);
        }
    }

    // 2. Evaluate MUST NOT clauses
    // NO item should match any MUST NOT clause
    let mustNotViolation = false;
    for (const clause of filter.mustNot) {
        const match = allItems.find(item => isClauseMatch(clause, item));
        if (match) {
            mustNotViolation = true;
            matches.push({ clause, item: match, ante: match.ante, source: match.source, priority: 'mustNot' });
            failedClauses.push({ ...clause, label: `Violated: Found ${match.name}` }); // Mark violation
        }
    }

    // 3. Evaluate SHOULD clauses
    // Add score for each match (optionally allow multiple matches? JAML usually counts unique *clauses* matched or occurrences?)
    // For now: Count each item that matches a clause.
    // If a clause matches multiple items (e.g. "Wee Joker" found twice), should it score twice?
    // Usually yes for score runs.
    for (const clause of filter.should) {
        // specific to scoring: sum up provided score or default
        const clauseScore = clause.score || 10;

        const clauseMatches = allItems.filter(item => isClauseMatch(clause, item));
        clauseMatches.forEach(item => {
            matches.push({ clause, item, ante: item.ante, source: item.source, priority: 'should' });
            score += clauseScore;
        });
    }

    // Add base score from header if matches
    if (allMustPassed && !mustNotViolation) {
        score += (filter.defaults.score || 0);
    } else {
        // If not a match, score might be considered 0 or just the partial score? 
        // Usually for a filter check, isMatch is key.
    }

    return {
        isMatch: allMustPassed && !mustNotViolation,
        score,
        matches,
        failedClauses
    };
}
