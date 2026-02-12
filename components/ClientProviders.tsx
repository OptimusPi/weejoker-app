"use client";

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { JamlTheme } from '@/styles/JamlTheme';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={JamlTheme} forceColorScheme="dark">
            {children}
        </MantineProvider>
    );
}
