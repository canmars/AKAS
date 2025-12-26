import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const CoursePerformanceChart = () => {
    const [chartData, setChartData] = useState({ datasets: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/dashboard/course-performance');

                // Map API data to Chart.js format
                // Expected format: [{ ders_adi: "...", ogrenci_sayisi: 32, ders_ortalamasi: 1.85 }, ...]
                const points = data.map(d => ({
                    x: d.ogrenci_sayisi,
                    y: d.ders_ortalamasi,
                    label: d.ders_adi // Custom property for tooltip
                }));

                const backgroundColors = data.map(d => d.ders_ortalamasi < 2.0 ? '#EF4444' : '#3B82F6');

                setChartData({
                    datasets: [
                        {
                            label: 'Ders Performansı',
                            data: points,
                            backgroundColor: backgroundColors,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching course performance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Öğrenci Sayısı'
                },
                beginAtZero: true
            },
            y: {
                title: {
                    display: true,
                    text: 'Ders Ortalaması (4.0)'
                },
                min: 0,
                max: 4,
                beginAtZero: true
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const point = context.raw;
                        return `${point.label}: Ort ${point.y} (${point.x} Öğrenci)`;
                    }
                }
            },
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false,
        responsive: true,
    };

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ders Performans Analizi</h3>
            <div className="h-64">
                <Scatter data={chartData} options={options} />
            </div>
            <div className="mt-4 flex gap-4 justify-center text-sm">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">Başarılı (Ort &gt; 2.0)</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-gray-600">Riskli (Ort &lt; 2.0)</span>
                </div>
            </div>
        </div>
    );
};

export default CoursePerformanceChart;
