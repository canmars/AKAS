import React, { useEffect, useState } from 'react';
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
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CoursePerformanceBars = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/dashboard/course-performance');

                if (Array.isArray(data)) {
                    const sorted = [...data]
                        .sort((a, b) => parseFloat(a.ders_ortalamasi) - parseFloat(b.ders_ortalamasi))
                        .slice(0, 8);

                    const labels = sorted.map(d => d.ders_adi || d.ders_kodu);
                    const averages = sorted.map(d => parseFloat(d.ders_ortalamasi));

                    const bgColors = averages.map(avg => avg < 2.0 ? '#EF4444' : '#F59E0B');

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: 'Ders Ortalaması',
                                data: averages,
                                backgroundColor: bgColors,
                                borderRadius: 4,
                                barThickness: 24,
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error("Error loading course bars", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                displayColors: false,
                callbacks: {
                    label: (context) => `Ortalama: ${context.parsed.x}`
                }
            }
        },
        scales: {
            x: {
                min: 0,
                max: 4.0,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: {
                    font: { size: 11 },
                    color: '#94a3b8',
                    stepSize: 1
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: { weight: '500', size: 11 },
                    color: '#64748b',
                    autoSkip: false,
                }
            }
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 h-full flex items-center justify-center">
            <span className="text-slate-400 font-medium animate-pulse">Yükleniyor...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Ders Başarı Analizi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">En Düşük Ortalamalı 8 Ders</p>
                </div>
            </div>
            <div className="flex-1 min-h-[350px]">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export default CoursePerformanceBars;

