
import { SlidersHorizontal, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    onSearch: (query: string) => void;
    onSortChange: (sort: string) => void;
}

export function FilterBar({ onSearch, onSortChange }: FilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-12 p-3 bg-balatro-panel rounded-lg border-2 border-white shadow-balatro relative">
            {/* Search Section */}
            <div className="flex-1 relative">
                <div className="absolute -top-3 left-4 bg-balatro-red text-white px-2 py-0.5 rounded text-sm font-header uppercase tracking-wider shadow-sm z-10">
                    Search Seeds
                </div>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-10 text-white/50">
                        <Search size={22} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="ENTER SEED..."
                        className="w-full pl-12 pr-4 py-3 bg-black/40 border-2 border-slate-600 rounded-lg text-white font-header text-xl placeholder:text-white/20 focus:outline-none focus:border-balatro-blue focus:ring-0 shadow-inner uppercase tracking-widest"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Sort Section */}
            <div className="flex gap-3">
                <div className="relative">
                    <div className="absolute -top-3 left-4 bg-balatro-red text-white px-2 py-0.5 rounded text-sm font-header uppercase tracking-wider shadow-sm z-10">
                        Sort By
                    </div>
                    <div className="relative h-full">
                        <select
                            onChange={(e) => onSortChange(e.target.value)}
                            className="pl-4 pr-12 py-3 bg-balatro-orange text-white border-b-4 border-orange-700 rounded-lg font-header text-xl shadow-balatro appearance-none hover:brightness-110 focus:outline-none cursor-pointer uppercase tracking-wider h-full w-64 text-center disabled:opacity-50"
                        >
                            <option value="default">Recommended</option>
                            <option value="wee_desc">Wee Joker</option>
                            <option value="hack_desc">Hack Potential</option>
                            <option value="hearts_desc">Hearts</option>
                            <option value="spades_desc">Spades</option>
                        </select>
                        {/* Custom Select Arrows (Red/White Chevrons) */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white"></div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                        </div>
                    </div>
                </div>

                <button className="px-5 py-2 bg-balatro-blue text-white border-b-4 border-blue-800 rounded-lg shadow-balatro hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 active:shadow-none transition-all flex items-center self-end h-[52px]">
                    <SlidersHorizontal size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
