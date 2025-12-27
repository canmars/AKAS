import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend as ChartLegend
} from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const RiskDistribution = () => {
    const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const data = await api.get('/dashboard/risk-distribution');
                setStats(data);
            } catch (error) {
                console.error("Error fetching risk data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskData();
    }, []);

    const total = stats.high + stats.medium + stats.low;
    const calculatePercentage = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

    const data = {
        labels: ['Yüksek Risk', 'Orta Risk', 'Düşük Risk'],
        datasets: [
            {
                data: [stats.high, stats.medium, stats.low],
                backgroundColor: [
                    '#ef4444', // Red-500
                    '#f97316', // Orange-500
                    '#10b981', // Emerald-500
                ],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
    };

    const riskLevels = [
        { label: 'Yüksek Risk', percentage: `${calculatePercentage(stats.high)}%`, count: stats.high, color: 'bg-red-500' },
        { label: 'Orta Risk', percentage: `${calculatePercentage(stats.medium)}%`, count: stats.medium, color: 'bg-orange-500' },
        { label: 'Düşük Risk', percentage: `${calculatePercentage(stats.low)}%`, count: stats.low, color: 'bg-emerald-500' },
    ];

    if (loading) return <div className="ads-card p-6 h-full animate-pulse flex flex-col">
        <div className="h-6 w-32 bg-slate-100 mb-6" />
        <div className="mx-auto w-40 h-40 rounded-full bg-slate-100 mb-8" />
        <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-100 rounded" />)}
        </div>
    </div>;

    return (
        <div className="ads-card p-6 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Risk Dağılımı</h2>
                <p className="text-xs text-slate-400">Tüm öğrencilerin risk analizi</p>
            </div>

            <div className="relative h-48 mb-8">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900">{total}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Toplam</span>
                </div>
            </div>

            <div className="space-y-4 mt-auto">
                {riskLevels.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                {risk.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{risk.percentage}</span>
                            <span className="text-sm text-slate-400">({risk.count})</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskDistribution;
