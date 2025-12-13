import type { Metadata } from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono, Russo_One, VT323 } from 'next/font/google';
import { cn } from '@/lib/utils';
import { DuckDBProvider } from '@/components/DuckDBProvider';

const fontHeader = Russo_One({
    subsets: ['latin'],
    variable: '--font-header',
    weight: '400',
});

const fontPixel = VT323({
    subsets: ['latin'],
    variable: '--font-pixel',
    weight: '400',
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
    title: 'Erratic Explorer | Balatro Seed Hunter',
    description: 'Analyze and find the perfect Balatro erratic deck seeds.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={cn(
                    'min-h-screen bg-transparent font-sans antialiased overflow-x-hidden',
                    fontSans.variable,
                    fontMono.variable,
                    fontHeader.variable,
                    fontPixel.variable
                )}
            >
                <DuckDBProvider>
                    {children}
                </DuckDBProvider>
            </body>
        </html>
    );
}
