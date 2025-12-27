import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StatCard = ({ title, value, trend, trendValue, icon, chartData, colorClass }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: { display: false, min: 0 }
        }
    };

    const data = {
        labels: ['', '', '', '', '', '', ''],
        datasets: [
            {
                data: chartData,
                backgroundColor: colorClass === 'blue' ? 'rgba(59, 130, 246, 0.5)' :
                    colorClass === 'red' ? 'rgba(239, 68, 68, 0.5)' :
                        'rgba(148, 163, 184, 0.5)',
                borderRadius: 4,
                hoverBackgroundColor: colorClass === 'blue' ? 'rgba(59, 130, 246, 1)' :
                    colorClass === 'red' ? 'rgba(239, 68, 68, 1)' :
                        'rgba(148, 163, 184, 1)',
            }
        ]
    };

    // Special handling for the last bar color in the image
    const lastBarColor = colorClass === 'blue' ? 'rgba(59, 130, 246, 1)' :
        colorClass === 'red' ? 'rgba(239, 68, 68, 1)' :
            'rgba(71, 85, 105, 1)';

    data.datasets[0].backgroundColor = (context) => {
        const index = context.dataIndex;
        return index === 6 ? lastBarColor : data.datasets[0].backgroundColor;
    };

    return (
        <div className="ads-card p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
                    <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-slate-900">{value}</span>
                    </div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                    trend === 'down' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                    }`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
                </div>
            </div>

            <div className="h-12 w-full mt-4">
                <Bar options={options} data={data} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">Son 6 Ay</p>
        </div>
    );
};

const DashboardStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/dashboard/kpis');
                if (!data) throw new Error("No data received from API");

                const mappedStats = [
                    {
                        title: "Toplam Öğrenci",
                        value: (data.toplam_ogrenci || 0).toString(),
                        trend: "up",
                        trendValue: "+5%",
                        colorClass: "blue",
                        chartData: [40, 45, 38, 52, 48, 60, 75]
                    },
                    {
                        title: "Zamanında Mezuniyet",
                        value: `%${data.mezuniyet_orani || 0}`,
                        trend: "up",
                        trendValue: "+2%",
                        colorClass: "blue",
                        chartData: [65, 70, 68, 72, 75, 74, 78]
                    },
                    {
                        title: "Riskli Öğrenciler",
                        value: (data.riskli_ogrenci_sayisi || 0).toString(),
                        trend: "down",
                        trendValue: "Kritik",
                        colorClass: "red",
                        chartData: [15, 18, 12, 25, 20, 22, 24]
                    },
                    {
                        title: "Danışman/Öğrenci",
                        value: data.danisman_ogrenci_orani || "0:0",
                        trend: "stable",
                        trendValue: "Stable",
                        colorClass: "slate",
                        chartData: [12, 12, 12, 12, 12, 12, 12]
                    }
                ];
                setStats(mappedStats);
            } catch (error) {
                console.error("Error fetching stats:", error);
                // Set fallback data if API fails to avoid empty UI
                setStats([
                    { title: "Toplam Öğrenci", value: "0", trend: "stable", trendValue: "Error", colorClass: "slate", chartData: [] },
                    { title: "Zamanında Mezuniyet", value: "%0", trend: "stable", trendValue: "Error", colorClass: "slate", chartData: [] },
                    { title: "Riskli Öğrenciler", value: "0", trend: "stable", trendValue: "Error", colorClass: "slate", chartData: [] },
                    { title: "Danışman/Öğrenci", value: "0:0", trend: "stable", trendValue: "Error", colorClass: "slate", chartData: [] }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="ads-card h-40 bg-slate-100" />)}
    </div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default DashboardStats;
