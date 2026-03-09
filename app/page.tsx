import { DailyRitual } from "@/components/DailyRitual";
import { ritualConfig } from "@/lib/config";



export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { day } = await searchParams;
    const initialDay = day ? parseInt(day as string, 10) : 0;

    return (
        <main className="h-full w-full">
            <DailyRitual ritualId={ritualConfig.id} initialDay={initialDay} />
        </main>
    );
}
