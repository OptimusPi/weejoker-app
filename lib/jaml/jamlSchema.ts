/**
 * JAML Schema Bridge
 * 
 * Central re-export of motely-wasm/jaml-schema.
 * All JAML-aware files import from here — single swap point if the API changes.
 */

export {
    JAML_SCHEMA_VERSION,
    jamlSchema,
    METADATA_KEYS,
    SECTION_KEYS,
    CLAUSE_TYPE_KEYS,
    PROPERTY_KEYS,
    SOURCE_KEYS,
    getValidValuesForKey,
    getAvailablePropsForType,
    isInvalidPropForType,
    isInvalidValueForProp,
    type ValidationState,
} from 'motely-wasm/jaml-schema';

import { getValidValuesForKey, CLAUSE_TYPE_KEYS, METADATA_KEYS, SECTION_KEYS, PROPERTY_KEYS, SOURCE_KEYS } from 'motely-wasm/jaml-schema';

// --- Convenience lookups derived from getValidValuesForKey ---

/** Valid deck values from the JAML schema */
export const DECK_VALUES = getValidValuesForKey('deck') as readonly string[] ?? [];

/** Valid stake values from the JAML schema */
export const STAKE_VALUES = getValidValuesForKey('stake') as readonly string[] ?? [];

/** Valid edition values from the JAML schema */
export const EDITION_VALUES = getValidValuesForKey('edition') as readonly string[] ?? [];

/** Valid seal values from the JAML schema */
export const SEAL_VALUES = getValidValuesForKey('seal') as readonly string[] ?? [];

/** Valid enhancement values from the JAML schema */
export const ENHANCEMENT_VALUES = getValidValuesForKey('enhancement') as readonly string[] ?? [];

/** Valid rank values from the JAML schema */
export const RANK_VALUES = getValidValuesForKey('rank') as readonly string[] ?? [];

/** Valid suit values from the JAML schema */
export const SUIT_VALUES = getValidValuesForKey('suit') as readonly string[] ?? [];

/** Valid sticker values from the JAML schema */
export const STICKER_VALUES = getValidValuesForKey('stickers') as readonly string[] ?? [];

/**
 * All JAML keywords — sections, metadata keys, clause types, and property keys.
 * Used for flat keyword autocompletion in the legacy editor.
 */
export const ALL_JAML_KEYWORDS: string[] = [
    ...SECTION_KEYS,
    ...METADATA_KEYS,
    ...CLAUSE_TYPE_KEYS,
    ...PROPERTY_KEYS,
    ...SOURCE_KEYS,
];
