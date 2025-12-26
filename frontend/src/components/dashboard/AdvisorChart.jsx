import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdvisorChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/advisors/load-distribution');
                const advisors = response.data;

                const labels = advisors.map((advisor) => `${advisor.ad} ${advisor.soyad}`);
                const data = advisors.map((advisor) => advisor.mevcut_danismanlik_sayisi);
                const backgroundColors = data.map((count) =>
                    count > 15 ? '#EF4444' : '#3B82F6'
                );

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Danışmanlık Sayısı',
                            data,
                            backgroundColor: backgroundColors,
                        },
                    ],
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching advisor data:', err);
                setError('Veri yüklenirken bir hata oluştu');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
    if (!chartData) return null;

    const options = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Danışman Yükü Analizi',
            },
        },
    };

    return <Bar options={options} data={chartData} />;
};

export default AdvisorChart;
