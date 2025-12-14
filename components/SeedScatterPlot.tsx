"use client";

import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { SeedData } from '@/lib/types';
import { motion } from 'framer-motion';

interface SeedScatterPlotProps {
    data: SeedData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-balatro-panel border-2 border-white p-3 rounded shadow-xl z-50">
                <p className="font-header text-balatro-blue text-lg">{data.seed}</p>
                <p className="font-pixel text-white">Score: <span className="text-balatro-gold">{data.score}</span></p>
                <p className="font-pixel text-zinc-400">Rank 2s: {data.twos}</p>
            </div>
        );
    }
    return null;
};

export function SeedScatterPlot({ data }: SeedScatterPlotProps) {
    // Only visualize top 500 to prevent lag
    const chartData = useMemo(() => {
        return data.slice(0, 500).map(s => ({
            ...s,
            // Add slight jitter to avoid total overlap
            jittered_twos: (s.twos || 0) + (Math.random() - 0.5) * 0.5,
            score: s.score || 0
        }));
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] bg-balatro-grey-darker border-2 border-balatro-grey rounded-xl p-4 relative overflow-hidden shadow-balatro-inner"
        >
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-white font-header text-xl uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Seed Distribution</h3>
                <p className="text-balatro-blue font-pixel text-lg">Twos vs. Score</p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        type="number"
                        dataKey="jittered_twos"
                        name="Rank 2 Count"
                        domain={['auto', 'auto']}
                        stroke="#94a3b8"
                        tick={{ fontFamily: 'm6x11plusplus', fontSize: 12 }}
                        label={{ value: 'Rank 2 Count', position: 'bottom', fill: '#64748b', fontSize: 12, fontFamily: 'm6x11plusplus' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="score"
                        name="Score"
                        stroke="#94a3b8"
                        tick={{ fontFamily: 'm6x11plusplus', fontSize: 12 }}
                        label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, fontFamily: 'm6x11plusplus' }}
                    />
                    <ZAxis type="number" range={[50, 400]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Seeds" data={chartData} fill="#8884d8">
                        {chartData.map((entry, index) => {
                            let color = "#ef4444"; // Default Red
                            if (entry.hack_a1) color = "#3b82f6"; // Blue for Hack
                            if (entry.wee_a1_cheap && entry.hack_a1) color = "#a855f7"; // Purple for Synergy
                            if (entry.twos && entry.twos > 15) color = "#eab308"; // Gold for heavy distributions

                            return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7} stroke="white" strokeWidth={1} />
                        })}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
