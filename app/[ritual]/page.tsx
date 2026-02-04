import { Suspense } from 'react';
import { DailyRitual } from "@/components/DailyRitual";

export const runtime = 'edge';

export default async function DynamicRitualPage({
    params,
    searchParams
}: {
    params: Promise<{ ritual: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { ritual } = await params;
    const { day } = await searchParams;
    const initialDay = day ? parseInt(day as string, 10) : 0;

    return (
        <main className="min-h-screen">
            <Suspense fallback={<div className="text-center p-20 text-white/50 font-pixel loading-ritual">SUMMONING RITUAL...</div>}>
                <DailyRitual ritualId={ritual} initialDay={initialDay} />
            </Suspense>
        </main>
    );
}
