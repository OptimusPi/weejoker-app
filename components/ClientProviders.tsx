"use client";

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { BalatroTheme } from '@/Blueprint/src/themes/Balatro';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={BalatroTheme} forceColorScheme="dark">
            {children}
        </MantineProvider>
    );
}
