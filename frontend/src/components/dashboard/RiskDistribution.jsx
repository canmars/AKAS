import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend as ChartLegend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const RiskDistribution = () => {
    const [stats, setStats] = useState({ high: 0, medium: 0, low: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const data = await api.get('/dashboard/risk-distribution');
                setStats(data || { high: 0, medium: 0, low: 0, total: 0 });
            } catch (error) {
                console.error("Error fetching risk data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskData();
    }, []);

    const total = stats.total || (stats.high + stats.medium + stats.low);
    const calculatePercentage = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

    const data = {
        labels: ['Yüksek', 'Orta', 'Düşük'],
        datasets: [
            {
                data: [stats.high, stats.medium, stats.low],
                backgroundColor: [
                    '#EF4444', // Red (Yüksek)
                    '#F59E0B', // Orange/Amber (Orta)
                    '#10B981', // Green (Düşük)
                ],
                borderWidth: 0,
                cutout: '70%', // Thinner donut as per design
                hoverOffset: 4
            },
        ],
    };

    const handleChartClick = (event, elements) => {
        // Navigate to student analysis on click
        navigate('/student-analysis');
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick, // Chart interactivity
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (%${percentage})`;
                    }
                }
            },
        },
        onHover: (event, chartElement) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    const riskLevels = [
        { label: 'Düşük', percentage: `${calculatePercentage(stats.low)}%`, color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
        { label: 'Orta', percentage: `${calculatePercentage(stats.medium)}%`, color: 'text-amber-500', dotColor: 'bg-amber-500' },
        { label: 'Yüksek', percentage: `${calculatePercentage(stats.high)}%`, color: 'text-red-500', dotColor: 'bg-red-500' },
    ];

    if (loading) return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Öğrenci Risk Dağılımı</h2>
                <p className="text-sm text-gray-500">Risk skorlarına göre dağılım</p>
            </div>

            <div className="relative flex-1 min-h-[200px] flex items-center justify-center p-4">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{total}</span>
                    <span className="text-xs text-gray-400 font-medium">Toplam Öğrenci</span>
                </div>
                <div className="w-full h-full relative z-0">
                    <Doughnut data={data} options={options} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 border-t border-gray-50 pt-6">
                {riskLevels.map((risk, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        onClick={() => navigate('/student-analysis')}
                    >
                        <span className="text-xs text-gray-400 font-medium mb-1">{risk.label}</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${risk.dotColor}`}></div>
                            <span className={`text-lg font-bold ${risk.color}`}>
                                {risk.percentage}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskDistribution;
