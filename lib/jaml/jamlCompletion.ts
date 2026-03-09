import {
    ALL_JAML_KEYWORDS,
    getValidValuesForKey,
    SECTION_KEYS,
    METADATA_KEYS,
    PROPERTY_KEYS,
} from './jamlSchema';

export interface CompletionData {
    text: string;
    displayText: string;
    type: 'keyword' | 'value';
}

export interface YamlCompletionContext {
    key?: string;
    indent: number;
}

export class JamlCompletionService {
    /**
     * Flat keyword completions (legacy — used by the interactive editor).
     */
    static getCompletions(currentValue: string): CompletionData[] {
        const lower = currentValue.toLowerCase();
        return ALL_JAML_KEYWORDS
            .filter(k => k.toLowerCase().includes(lower))
            .map(k => ({
                text: k,
                displayText: k,
                type: 'keyword'
            }));
    }

    /**
     * Context-aware value completions.
     * Given a JAML key (e.g. "joker", "voucher", "edition"),
     * returns valid values from the schema.
     */
    static getValueCompletions(key: string, currentValue: string): CompletionData[] {
        const validValues = getValidValuesForKey(key);
        if (!validValues) return [];

        const lower = currentValue.toLowerCase();
        return (validValues as string[])
            .filter(v => v.toLowerCase().includes(lower))
            .map(v => ({
                text: v,
                displayText: v,
                type: 'value' as const,
            }));
    }

    /**
     * Key completions for a given context.
     * At root level: metadata + section keys.
     * Inside a clause: property keys.
     */
    static getKeyCompletions(indent: number, currentValue: string): CompletionData[] {
        const keys = indent === 0
            ? [...METADATA_KEYS, ...SECTION_KEYS]
            : [...PROPERTY_KEYS];

        const lower = currentValue.toLowerCase();
        return keys
            .filter(k => k.toLowerCase().includes(lower))
            .map(k => ({
                text: k,
                displayText: k,
                type: 'keyword' as const,
            }));
    }
}
