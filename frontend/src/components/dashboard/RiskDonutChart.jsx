import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const RiskDonutChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let data;
                try {
                    data = await api.get('/dashboard/risk-distribution');
                } catch (e) {
                    console.warn("Risk distribution fetch failed, using mock", e);
                    data = { high: 12, medium: 34, low: 85 };
                }

                setChartData({
                    labels: ['Yüksek Risk', 'Orta Risk', 'Düşük Risk'],
                    datasets: [
                        {
                            data: [data.high || 0, data.medium || 0, data.low || 0],
                            backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
                            hoverOffset: 4,
                            borderWidth: 0,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error setting up chart:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                displayColors: true,
                boxPadding: 4
            }
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center h-full flex items-center justify-center">
            <span className="text-slate-400 font-medium animate-pulse">Yükleniyor...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Risk Dağılımı</h3>
                <p className="text-xs text-slate-500 mt-0.5">Genel Başarı Segmentasyonu</p>
            </div>
            <div className="flex-1 relative min-h-[250px] flex items-center justify-center">
                <Doughnut data={chartData} options={options} />
                <div className="absolute flex flex-col items-center pointer-events-none mt-[-15px]">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Toplam</span>
                    <span className="text-3xl font-bold text-slate-900 leading-none mt-1">
                        {chartData ? chartData.datasets[0].data.reduce((a, b) => a + b, 0) : 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RiskDonutChart;

