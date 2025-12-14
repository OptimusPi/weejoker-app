import dailySeeds from "@/lib/dailySeeds.json";
import { DailyWee } from "@/components/DailyWee";
import { PastWeekResults } from "@/components/PastWeekResults";

export default function Home() {
    return (
        <main className="min-h-screen py-10">


            {/* HERO: The Daily Wee */}
            <div className="container mx-auto px-4 mb-12">
                <DailyWee seeds={dailySeeds as any[]} />
            </div>

            {/* Past Week Results */}
            <div className="container mx-auto px-4 mb-12">
                <PastWeekResults />
            </div>
        </main>
    );
}
