import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RiskDistributionChart = () => {
    // Hardcoded mock data to match the UI visual request (55%, 30%, 15%)
    // In a real app, this would be calculated from the student risk scores
    const data = {
        labels: ['Düşük', 'Orta', 'Yüksek'],
        datasets: [
            {
                data: [55, 30, 15],
                backgroundColor: [
                    '#10B981', // Green-500
                    '#F59E0B', // Amber-500
                    '#EF4444', // Red-500
                ],
                borderWidth: 0,
                cutout: '75%', // Thinner donut
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-between">
            <div className="w-full text-left mb-4">
                <h3 className="text-lg font-bold text-gray-900">Öğrenci Risk Dağılımı</h3>
                <p className="text-sm text-gray-500">Risk skorlarına göre dağılım</p>
            </div>

            <div className="relative w-48 h-48">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900">450</span>
                    <span className="text-xs text-gray-400">Toplam Öğrenci</span>
                </div>
            </div>

            <div className="w-full flex justify-between px-2 mt-6">
                <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1">Düşük</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-lg font-bold text-green-500">55%</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1">Orta</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-lg font-bold text-amber-500">30%</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1">Yüksek</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-lg font-bold text-red-500">15%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskDistributionChart;
