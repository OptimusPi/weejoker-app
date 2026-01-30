import { DeckType, deckNames } from '@Blueprint/enum/Deck';
import { StakeType } from '@Blueprint/enum/Stake';
import { Rank } from '@Blueprint/enum/Rank';
import { Suit } from '@Blueprint/enum/Suit';
import { Enhancement } from '@Blueprint/enum/Enhancement';
import { Edition } from '@Blueprint/enum/Edition';
import { Seal } from '@Blueprint/enum/Seal';

// UI Options derived from Enums
export const DECK_OPTIONS = Object.values(DeckType).map(type => deckNames[type]);
export const STAKE_OPTIONS = Object.values(StakeType);

export const ANTE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
export const SLOT_OPTIONS = [1, 2, 3, 4, 5];

export const RANK_OPTIONS = Object.values(Rank);
export const SUIT_OPTIONS = Object.values(Suit);
export const ENHANCEMENT_OPTIONS = Object.values(Enhancement);
export const EDITION_OPTIONS = Object.values(Edition);
export const SEAL_OPTIONS = Object.values(Seal);

export const CLAUSE_TYPES = [
    'Joker', 'Tarot', 'Planet', 'Spectral', 'Voucher', 'Tag', 'Boss', 'PlayingCard', 'StandardCard'
];

export const SOURCE_OPTIONS = [
    'shop', 'arcana_pack', 'celestial_pack', 'spectral_pack', 'buffoon_pack', 'standard_pack',
    'uncommon_tag', 'rare_tag', 'top_up_tag', 'emperor', 'vagabond', 'judgement', 'wraith'
];
