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
                            hoverOffset: 15,
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
                    padding: 25,
                    font: { size: 11, family: 'Outfit', weight: '700' },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: '#1e2532',
                padding: 16,
                cornerRadius: 16,
                titleFont: { family: 'Outfit', size: 13, weight: '900' },
                bodyFont: { family: 'Outfit', size: 12, weight: '600' },
                displayColors: true,
                boxPadding: 6
            }
        }
    };

    if (loading) return <div className="kds-card p-12 h-64 flex flex-col items-center justify-center animate-pulse"><div className="w-8 h-8 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div></div>;

    return (
        <div className="kds-card p-10 h-full flex flex-col">
            <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Risk Dağılımı</h3>
                <p className="text-gray-400 font-medium mt-1 uppercase text-xs tracking-widest">Genel Başarı Segmentasyonu</p>
            </div>
            <div className="flex-1 relative min-h-[250px] flex items-center justify-center">
                <Doughnut data={chartData} options={options} />
                <div className="absolute flex flex-col items-center pointer-events-none mt-[-15px]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam Takip</span>
                    <span className="text-3xl font-black text-gray-900 leading-none mt-1">
                        {chartData ? chartData.datasets[0].data.reduce((a, b) => a + b, 0) : 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RiskDonutChart;

