import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
    Users,
    AlertTriangle,
    BookOpen,
    Scale
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
);

import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, trend, trendDirection, trendLabel, icon: Icon, colorClass, chartData, isChartCard, onClick }) => {

    // Bar Chart Implementation for Active Theses
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false } // Minimalist look
        },
        scales: {
            x: { display: false },
            y: { display: false }
        }
    };

    const chartDataConfig = {
        labels: chartData ? chartData.map((_, i) => i) : [],
        datasets: [
            {
                data: chartData || [],
                backgroundColor: 'rgba(168, 85, 247, 0.3)', // Purple-300 transparent
                hoverBackgroundColor: 'rgba(168, 85, 247, 1)', // Purple-500
                borderRadius: 4,
                barThickness: 8,
            }
        ]
    };

    // Highlight last bar
    if (chartData && chartData.length > 0) {
        const colors = chartData.map((_, i) =>
            i === chartData.length - 1 ? 'rgba(168, 85, 247, 1)' : 'rgba(168, 85, 247, 0.3)'
        );
        chartDataConfig.datasets[0].backgroundColor = colors;
    }

    // Color Configurations
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    };

    const theme = colors[colorClass] || colors.blue;

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
        >
            {/* Background Decoration */}
            {colorClass === 'red' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-gray-500 text-sm font-semibold tracking-wide">{title}</h3>
                    <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                        {value !== null && value !== undefined ? value : '-'}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
            </div>

            <div className="relative z-10 mt-4 h-8 flex items-end">
                {isChartCard && chartData && chartData.length > 0 ? (
                    <div className="w-full h-10">
                        <Bar options={chartOptions} data={chartDataConfig} />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {/* Trend Indicator */}
                        {trend !== undefined && (
                            <div className={`
                                px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1
                                ${trend === 0
                                    ? 'bg-gray-100 text-gray-600'
                                    : trendDirection === 'up'
                                        ? (colorClass === 'red' ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-600')
                                        : (colorClass === 'red' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')
                                } 
                            `}>
                                {trend === 0 ? '•' : (trendDirection === 'up' ? '↗' : '↘')}
                                {trend === 0 ? 'Stabil' : `${Math.abs(trend)}%`}
                            </div>
                        )}

                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            {trendLabel || 'Veri yok'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/kpis');

                // api.js returns the JSON body directly, so 'response' IS the data object.
                // We check if it exists and has keys.
                const data = response;

                if (!data || Object.keys(data).length === 0) {
                    setStats(null); // Explicit no data state
                } else {
                    setStats(data);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Veri alınamadı");
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white h-40 rounded-2xl border border-gray-100" />
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                Veri bulunamadı. Lütfen veritabanı bağlantılarını ve SQL fonksiyonlarını kontrol edin.
            </div>
        );
    }

    // Mapping SQL JSON result to UI components
    const cards = [
        {
            title: "Toplam Öğrenci",
            value: stats.toplam_ogrenci?.value,
            trend: stats.toplam_ogrenci?.trend,
            trendDirection: stats.toplam_ogrenci?.trend_direction,
            trendLabel: stats.toplam_ogrenci?.label,
            icon: Users,
            colorClass: "blue",
            isChartCard: false,
            path: '/student-analysis'
        },
        {
            title: "Riskli Öğrenci",
            value: stats.riskli_ogrenci?.value,
            trend: stats.riskli_ogrenci?.trend,
            trendDirection: stats.riskli_ogrenci?.trend_direction,
            trendLabel: stats.riskli_ogrenci?.label,
            icon: AlertTriangle,
            colorClass: "red",
            isChartCard: false,
            path: '/student-analysis'
        },
        {
            title: "Aktif Tezler",
            value: stats.aktif_tezler?.value,
            trend: stats.aktif_tezler?.trend,
            chartData: stats.aktif_tezler?.chart_data,
            icon: BookOpen,
            colorClass: "purple",
            isChartCard: true,
            path: '/advisor-analysis' // Closest match for thesis management for now
        },
        {
            title: "Ort. Danışman Yükü",
            value: stats.danisman_yuku?.value,
            trend: stats.danisman_yuku?.trend,
            trendDirection: stats.danisman_yuku?.trend_direction,
            trendLabel: stats.danisman_yuku?.label,
            icon: Scale,
            colorClass: "orange",
            isChartCard: false,
            path: '/advisor-analysis'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <StatCard
                    key={index}
                    {...card}
                    onClick={() => card.path && navigate(card.path)}
                />
            ))}
        </div>
    );
};

export default DashboardStats;
