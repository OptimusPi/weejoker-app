import type { Metadata } from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BackgroundShader } from '@/components/BackgroundShader';
import { NavBar } from '@/components/NavBar';
import { PageFooter } from '@/components/PageFooter';

import localFont from 'next/font/local';
import ClientProviders from '@/components/ClientProviders';

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
                    'h-screen overflow-hidden font-sans antialiased text-white',
                    fontSans.variable,
                    fontMono.variable,
                    fontHeader.variable,
                    fontPixel.variable
                )}
            >
                <BackgroundShader />

                <div className="relative z-10 h-full flex flex-col">
                    <NavBar />
                    <div className="flex-grow flex flex-col min-h-0 relative z-0">
                        <ClientProviders>
                            {children}
                        </ClientProviders>
                    </div>

                    {/* Footer is now rendered client-side for cycling suits */}
                    {/* <PageFooter /> */}
                </div>
            </body>
        </html>
    );
}
