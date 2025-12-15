
import dynamic from "next/dynamic";
import { PastWeekResults } from "@/components/PastWeekResults";

// December 12th, 2025 (Project Zero Point)
import { ClientDailyWeeLoader } from "@/components/ClientDailyWeeLoader";



export default function Home() {
    return (
        <main className="min-h-screen">
            <ClientDailyWeeLoader />

            {/* Past Week Results */}
            <div className="container mx-auto px-4 py-12">
                <PastWeekResults />
            </div>
        </main>
    );
}
