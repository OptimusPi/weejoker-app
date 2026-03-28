import type { Metadata } from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { BackgroundShader } from '@/components/BackgroundShader';

import localFont from 'next/font/local';
import ClientProviders from '@/components/ClientProviders';
import NavBar from '@/components/NavBar';
import { BalatroFanSiteAttributionFooter } from '@/components/BalatroFanSiteAttributionFooter';

const fontHeader = localFont({
    src: '../public/fonts/m6x11plusplus.otf',
    variable: '--font-header',
    display: 'swap',
});

const fontPixel = localFont({
    src: '../public/fonts/m6x11plusplus.otf',
    variable: '--font-pixel',
    display: 'swap',
});

const fontSans = Outfit({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'The Daily Wee',
    description: 'A daily ritual game revolving around Wee Joker appreciation.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn(
                    'h-[100svh] overflow-hidden font-sans antialiased text-white',
                    fontSans.variable,
                    fontMono.variable,
                    fontHeader.variable,
                    fontPixel.variable
                )}
            >
                <BackgroundShader />

                <div className="ritual-locked-layout h-full overflow-hidden flex flex-col">
                    {/* Navbar - full width, in normal flow */}
                    <header className="w-full px-4 py-2 shrink-0 z-20">
                        <NavBar />
                    </header>

                    <div className="flex-grow flex flex-col min-h-0 overflow-hidden relative z-0">
                        <ClientProviders>
                            {children}
                        </ClientProviders>
                    </div>

                    <BalatroFanSiteAttributionFooter />
                </div>
            </body>
        </html>
    );
}
