// UI Options derived from motely-wasm/jaml-schema (source of truth)
import {
    DECK_VALUES,
    STAKE_VALUES,
    EDITION_VALUES,
    SEAL_VALUES,
    ENHANCEMENT_VALUES,
    RANK_VALUES,
    SUIT_VALUES,
    CLAUSE_TYPE_KEYS,
    SOURCE_KEYS,
} from '@/lib/jaml/jamlSchema';

export const DECK_OPTIONS = [...DECK_VALUES];
export const STAKE_OPTIONS = [...STAKE_VALUES];

export const ANTE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
export const SLOT_OPTIONS = [1, 2, 3, 4, 5];

export const RANK_OPTIONS = [...RANK_VALUES];
export const SUIT_OPTIONS = [...SUIT_VALUES];
export const ENHANCEMENT_OPTIONS = [...ENHANCEMENT_VALUES];
export const EDITION_OPTIONS = [...EDITION_VALUES];
export const SEAL_OPTIONS = [...SEAL_VALUES];

export const CLAUSE_TYPES = [...CLAUSE_TYPE_KEYS];
export const SOURCE_OPTIONS = [...SOURCE_KEYS];
