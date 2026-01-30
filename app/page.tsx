
import dynamic from "next/dynamic";
import { PastWeekResults } from "@/components/PastWeekResults";
import { PageFooter } from "@/components/PageFooter";

// December 12th, 2025 (Project Zero Point)
import { DailyRitual } from "@/components/DailyRitual";



export default function Home() {
    return (
        <main className="min-h-screen">
            <DailyRitual />
        </main>
    );
}
