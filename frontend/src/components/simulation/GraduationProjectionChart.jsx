import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const GraduationProjectionChart = ({ params }) => {
    // Simulated projection logic
    const historical = [42, 58, 52, 68]; // 2021, 2022, 2023, 2024

    // Projection depends on graduationEffect
    let projectionBase = 68;
    const effectMap = {
        'Stabil (Mevcut)': 1,
        'Hızlandırılmış (%20+)': 1.2,
        'Yavaşlatılmış (%20-)': 0.8
    };
    const multiplier = effectMap[params.graduationEffect] || 1;

    const projection = [
        Math.round(projectionBase * multiplier),
        Math.round(projectionBase * multiplier * 1.05),
        Math.round(projectionBase * multiplier * 1.1)
    ];

    const data = {
        labels: ['2021', '2022', '2023', '2024', '2025', '2026', '2027'],
        datasets: [
            {
                label: 'Gerçekleşen',
                data: [...historical, null, null, null],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3,
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Simülasyon',
                data: [null, null, null, historical[3], ...projection],
                borderColor: '#94a3b8',
                borderWidth: 3,
                borderDash: [8, 5],
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 30,
                    font: { size: 12, weight: 'bold' },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: '#1e2532',
                padding: 16,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y} Mezun`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: {
                    font: { size: 12, weight: '600' },
                    color: '#94a3b8',
                    padding: 10
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 12, weight: 'bold' },
                    color: '#64748b',
                    padding: 15
                }
            }
        }
    };

    return (
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Mezuniyet Projeksiyonu</h3>
                </div>
                <span className="bg-gray-50 text-gray-400 text-[10px] font-black px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest">5 Yıllık Tahmin</span>
            </div>

            <div className="flex-1 h-[300px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default GraduationProjectionChart;
