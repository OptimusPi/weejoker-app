export const CLAUSE_TYPES = [
    'joker', 'soulJoker', 'voucher', 'tarotCard', 'planetCard', 'spectralCard',
    'standardCard', 'tag', 'smallBlindTag', 'bigBlindTag', 'boss', 'bossBlind',
    'event', 'erraticRank', 'erraticSuit', 'and', 'or'
] as const;

export const ARRAY_KEYS = ['antes', 'shopSlots', 'packSlots'];

export const ALL_DECKS = [
    'Red', 'Blue', 'Yellow', 'Green', 'Black', 'Magic', 'Nebula',
    'Ghost', 'Abandoned', 'Checkered', 'Zodiac', 'Painted', 'Anaglyph',
    'Plasma', 'Erratic', 'Challenge'
];

export const ALL_STAKES = [
    'White', 'Red', 'Green', 'Black', 'Blue', 'Purple', 'Orange', 'Gold'
];

export const ALL_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const ALL_SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

export const ALL_EDITIONS = ['Foil', 'Holographic', 'Polychrome', 'Negative', 'Eternal', 'Perishable', 'Rental'];
export const STANDARD_CARD_EDITIONS = ['Foil', 'Holographic', 'Polychrome']; // No Negative

export const ALL_SEALS = ['Red', 'Blue', 'Gold', 'Purple'];
export const ALL_ENHANCEMENTS = ['Bonus', 'Mult', 'Wild', 'Glass', 'Steel', 'Stone', 'Lucky', 'Gold'];

// Events for v2 Schema
export const ALL_EVENTS = [
    'LuckyMoney', 'LuckyMult', 'MisprintMult', 'WheelOfFortune',
    'CavendishExtinct', 'GrosMichelExtinct'
];

// Simplified lists for MVP (Ideally this comes from WASM or a full JSON dump later)
// For now, these populate the autocomplete
export const COMMON_JOKERS = [
    'Joker', 'Greedy Joker', 'Lusty Joker', 'Wrathful Joker', 'Gluttonous Joker', 'Jolly Joker',
    'Zany Joker', 'Mad Joker', 'Crazy Joker', 'Droll Joker', 'Sly Joker', 'Wily Joker',
    'Clever Joker', 'Devious Joker', 'Crafty Joker', 'Half Joker', 'Credit Card'
];

export const UNCOMMON_JOKERS = [
    'Joker Stencil', 'Four Fingers', 'Mime', 'Credit Card', 'Ceremonial', 'Marble Joker'
];

export const RARE_JOKERS = [
    'Blueprint', 'Brainstorm', 'DNA', 'Vampire', 'Baron', 'Obelisk', 'Campfire'
];

export const LEGENDARY_JOKERS = [
    'Canio', 'Triboulet', 'Yorick', 'Chicot', 'Perkeo'
];

export const ALL_JOKERS = [
    ...COMMON_JOKERS, ...UNCOMMON_JOKERS, ...RARE_JOKERS, ...LEGENDARY_JOKERS, 'Any'
];

export const SOUL_JOKERS = [...LEGENDARY_JOKERS, 'Any'];

export const ALL_VOUCHERS = [
    'Overstock', 'Overstock Plus', 'Clearance Sale', 'Liquidation', 'Hone', 'Glow Up',
    'Hieroglyph', 'Petroglyph', 'Director\'s Cut', 'Retcon', 'Paint Brush', 'Palette',
    'Blank', 'Antimatter', 'Telescope', 'Observatory', 'Grabber', 'Nacho Tong',
    'Wasteful', 'Recyclomancy', 'Tarot Merchant', 'Tycoon', 'Planet Merchant', 'Trance',
    'Seed Money', 'Money Tree', 'Magic Trick', 'Illusion'
];

export const ALL_TAROTS = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Justice', 'The Hermit',
    'The Wheel of Fortune', 'Strength', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];

export const ALL_PLANETS = [
    'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
    'Planet X', 'Ceres', 'Eris'
];

export const ALL_SPECTRALS = [
    'Familiar', 'Grim', 'Incantation', 'Talisman', 'Aura', 'Wraith', 'Sigil', 'Ouija',
    'Ectoplasm', 'Immolate', 'Ankh', 'Deja Vu', 'Hex', 'Trance', 'Medium', 'Cryptid'
];

export const ALL_TAGS = [
    'Uncommon Tag', 'Rare Tag', 'Negative Tag', 'Foil Tag', 'Holographic Tag',
    'Polychrome Tag', 'Investment Tag', 'Voucher Tag', 'Boss Tag', 'Standard Tag',
    'Charm Tag', 'Meteor Tag', 'Buffoon Tag', 'Handy Tag', 'Garbage Tag', 'Ethereal Tag',
    'Coupon Tag', 'Double Tag', 'Juggle Tag', 'D6 Tag', 'Top-up Tag', 'Speed Tag',
    'Orbital Tag', 'Economy Tag'
];

export const ALL_BOSSES = [
    'The Arm', 'The Club', 'The Eye', 'The Mouth', 'The Plant', 'The Serpent',
    'The Pillar', 'The Goad', 'The Head', 'The Window', 'The Manacle', 'The Hook',
    'The Ox', 'The House', 'The Wall', 'The Wheel', 'The Mark', 'The Fish',
    'The Tooth', 'The Flint', 'The Water', 'The Needle', 'The Psychic', 'Violet Vessel',
    'Crimson Heart', 'Amber Acorn', 'Verdant Leaf', 'Cerulean Bell'
];

export const PROPERTY_KEYS = {
    metadata: ['label'] as const,
    stickers: ['stickers'] as const,
    modifiers: ['edition', 'seal', 'enhancement'] as const,
    playingCard: ['rank', 'suit'] as const,
    sources: ['sources', 'antes'] as const,
    scoring: ['score'] as const,
} as const;
