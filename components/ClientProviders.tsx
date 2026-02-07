"use client";

import React, { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { JamlTheme } from '@/Blueprint/src/themes/JamlTheme';
import { preloadWasm } from '@/lib/api/motelyWasm';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        preloadWasm();
    }, []);
    return (
        <MantineProvider theme={JamlTheme} forceColorScheme="dark">
            {children}
        </MantineProvider>
    );
}
