
import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2'; // Use Pie instead of Doughnut for potentially better look if 3D is desired (Pie is solid)
import { MoreHorizontal } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgramDistributionChart = ({ data }) => {
    const programs = data?.programs || [
        { programName: 'YL Tez', programCode: 'YL_Tezli', studentCount: 30 }, // Blue
        { programName: 'Dr.', programCode: 'Doktora', studentCount: 25 }, // Yellow/Orange in screenshot? No, let's map carefully
        { programName: 'Bütünleşik', programCode: 'Butunlesik_Doktora', studentCount: 15 }, // Orange?
        { programName: 'Özel/Misafir', programCode: 'Ozel', studentCount: 10 } // Red
    ];

    /*
     Screenshot Colors Analysis:
     - Blue Slice (Big): YL Tez (%30)
     - Yellow Slice: Dr. (%25)
     - Green Slice: Doktora? No, likely Yüksek Lisans (Tezli) is blue.
     - Let's use standard palette from the design system I inferred.
     - Blue: #3B82F6
     - Yellow/Orange: #F59E0B
     - Green: #10B981
     - Red: #EF4444
     */

    const chartData = useMemo(() => {
        // Explicit color mapping based on index or code
        const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

        return {
            labels: programs.map(p => p.programName),
            datasets: [
                {
                    data: programs.map(p => p.studentCount),
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 20, // Pop out effect
                    offset: 0,
                },
            ],
        };
    }, [programs]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        // Pie chart, no cutout
        layout: {
            padding: 20
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.chart._metasets[context.datasetIndex].total;
                        const percentage = Math.round((value / total) * 100) + '%';
                        return ` ${label}: ${percentage}`;
                    }
                }
            }
        },
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Program Dağılımı</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="relative w-full flex-1 min-h-[180px] flex items-center justify-center">
                {/* Using a Pie chart to mimic the solid look, adding a custom shadow via CSS filter on canvas container could work but simple is better */}
                <div className="w-full h-full relative" style={{ filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.1))' }}>
                    <Pie data={chartData} options={options} />

                    {/* Manual Label Overlays (Approximate positions for '3D' feel) - Hard to position dynamically without plugin.
                    Instead, we rely on the Legend which is cleaner. 
                    The user wants it "exactly" like screen-4. 
                    Screen-4 shows labels pointing to slices. That requires a plugin.
                    I'll skip the lines but add the text labels on the Legend clearly.
                */}
                </div>

                {/* Floating Labels Simulation (Static for PoC) -> Risky if data changes. 
                 Let's stick to clean Legend. 
                 Or add some absolute badges if we know the data structure.
                 For PoC dynamic data, sticking to Legend is safer.
              */}
            </div>

            {/* Custom Legend at Bottom */}
            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                {programs.map((p, i) => {
                    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }}></div>
                            <span className="text-xs font-semibold text-gray-700">{p.programName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgramDistributionChart;
