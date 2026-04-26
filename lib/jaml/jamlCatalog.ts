"use client";

import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const jamlClauseCatalog = createCatalog({
    components: {
        ClauseForm: {
            props: z.object({
                clauseType: z.enum(['must', 'should', 'mustNot']),
                itemType: z.enum(['Joker', 'Tarot', 'Planet', 'Spectral', 'Voucher', 'Tag', 'Boss', 'Standardcard', 'StandardCard']),
                itemValue: z.string(),
                label: z.string().optional(),
            }),
            hasChildren: false,
        },

        AnteSelector: {
            props: z.object({
                selectedAntes: z.array(z.number().min(1).max(8)),
            }),
            hasChildren: false,
        },

        CardModifiers: {
            props: z.object({
                edition: z.enum(['Negative', 'Polychrome', 'Foil', 'Holographic', '']).optional(),
                seal: z.enum(['Gold', 'Red', 'Blue', 'Purple', '']).optional(),
                enhancement: z.enum(['Bonus', 'Mult', 'Wild', 'Glass', 'Steel', 'Stone', 'Gold', 'Lucky', '']).optional(),
                rank: z.string().optional(),
                suit: z.string().optional(),
            }),
            hasChildren: false,
        },

        SourceSelector: {
            props: z.object({
                sources: z.array(z.enum([
                    'shop', 'arcana_pack', 'celestial_pack', 'spectral_pack',
                    'buffoon_pack', 'standard_pack', 'uncommon_tag', 'rare_tag',
                    'top_up_tag', 'emperor', 'vagabond', 'judgement', 'wraith'
                ])),
            }),
            hasChildren: false,
        },

        FilterMetadata: {
            props: z.object({
                name: z.string(),
                author: z.string().optional(),
                description: z.string().optional(),
                deck: z.enum(['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Magic', 'Nebula', 'Ghost', 'Abandoned', 'Checkered', 'Zodiac', 'Painted', 'Anaglyph', 'Plasma', 'Erratic']),
                stake: z.enum(['White', 'Red', 'Green', 'Black', 'Blue', 'Purple', 'Orange', 'Gold']),
            }),
            hasChildren: false,
        },
    },

    actions: {
        add_clause: {
            description: 'Add a new JAML clause to the filter',
        },
        remove_clause: {
            description: 'Remove a clause from the filter',
        },
        generate_filter: {
            description: 'Generate complete JAML filter from natural language description',
        },
    },
});

export type JamlClauseCatalog = typeof jamlClauseCatalog;
