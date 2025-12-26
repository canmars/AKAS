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
                                borderRadius: 16,
                                barThickness: 32,
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
                backgroundColor: '#1e2532',
                padding: 16,
                cornerRadius: 16,
                titleFont: { family: 'Outfit', size: 14, weight: '900' },
                bodyFont: { family: 'Outfit', size: 13, weight: '600' },
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
                    font: { family: 'Outfit', size: 12, weight: '700' },
                    color: '#94a3b8',
                    stepSize: 1
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: { family: 'Outfit', weight: '800', size: 11 },
                    color: '#64748b',
                    autoSkip: false,
                }
            }
        }
    };

    if (loading) return (
        <div className="kds-card p-12 h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Veriler İşleniyor...</p>
        </div>
    );

    return (
        <div className="kds-card p-10 h-full flex flex-col">
            <div className="mb-10 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Ders Başarı Analizi</h3>
                    <p className="text-gray-400 font-medium mt-1 uppercase text-xs tracking-widest">En Düşük Ortalamalı 8 Ders</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
            </div>
            <div className="flex-1 min-h-[350px]">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export default CoursePerformanceBars;

