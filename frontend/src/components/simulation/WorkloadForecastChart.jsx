import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

const WorkloadForecastChart = ({ params }) => {
    // Mock simulation logic: increase load based on quota and advisor limit
    const baseLoad = [8, 12, 18, 10, 9, 13, 7];
    const simulatedLoad = baseLoad.map(load => {
        const factor = (params.newQuota / 50) * (15 / params.advisorLimit);
        return Math.round(load * factor);
    });

    const data = {
        labels: ['Dr. A. Yılmaz', 'Dr. B. Kaya', 'Dr. C. Demir', 'Dr. D. Şahin', 'Dr. E. Çelik', 'Dr. F. Koç', 'Dr. G. Yıldız'],
        datasets: [
            {
                data: simulatedLoad,
                backgroundColor: simulatedLoad.map(load =>
                    load > 15 ? '#EF4444' : load > 11 ? '#F59E0B' : '#10B981'
                ),
                borderRadius: 16,
                borderSkipped: false,
                barThickness: 48,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e2532',
                padding: 16,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
                callbacks: {
                    label: (context) => `Tahmini Yük: ${context.parsed.y} Öğrenci`
                }
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 15,
                        yMax: 15,
                        borderColor: '#94a3b8',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            display: true,
                            content: 'Kritik Yük Sınırı: 15',
                            position: 'start',
                            backgroundColor: 'transparent',
                            color: '#94a3b8',
                            font: { size: 11, weight: 'bold' },
                            padding: { left: 0, bottom: 10 }
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 25,
                grid: {
                    color: '#f1f5f9',
                    drawBorder: false,
                },
                ticks: {
                    font: { size: 12, weight: '600' },
                    color: '#94a3b8',
                    stepSize: 5,
                    padding: 10
                }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    font: { size: 11, weight: 'bold' },
                    color: '#64748b',
                    padding: 15
                }
            }
        }
    };

    return (
        <div className="w-full h-[400px] relative">
            <Bar data={data} options={options} />
            <div className="absolute -bottom-1 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            <div className="flex justify-end mt-4 gap-4 px-2">
                <div className="flex items-center gap-1.5 opacity-40">
                    <div className="w-6 h-2 bg-gray-200 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Yeni Kadro</span>
                </div>
            </div>
        </div>
    );
};

export default WorkloadForecastChart;
