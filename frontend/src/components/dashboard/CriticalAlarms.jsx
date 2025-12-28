import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, annotationPlugin);

const AlarmDetailModal = ({ alarm, onClose }) => {
    if (!alarm) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-200 border border-slate-100/60 ring-1 ring-black/5">
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-100">
                            {alarm.initials}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1">{alarm.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-6">{alarm.stage}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-50">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">RİSK</span>
                            <span className="text-2xl font-black text-red-500">%{alarm.riskScore}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DÖNEM</span>
                            <span className="text-2xl font-black text-slate-700">{alarm.semester || '-'}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 mb-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ÖNERİLEN AKSİYON</p>
                        <p className="text-sm font-semibold text-slate-700 leading-snug">{alarm.reason}</p>
                    </div>

                    <a
                        href={`mailto:${alarm.email}`}
                        className="flex items-center justify-center w-full py-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all active:scale-[0.98] shadow-lg shadow-slate-200/50 mb-8"
                    >
                        Öğrenciyle İletişime Geç
                    </a>
                </div>
            </div>
        </div>
    );
};

const CriticalAlarms = () => {
    const [alarms, setAlarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlarm, setSelectedAlarm] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchAlarms = async () => {
            try {
                const data = await api.get('/dashboard/alarms');
                if (!data || !Array.isArray(data)) throw new Error("Invalid alarm data");

                const getInitials = (name) => {
                    const parts = name.trim().split(' ');
                    const first = parts[0] ? parts[0][0] : '';
                    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
                    return (first + last).toUpperCase();
                };

                const mappedAlarms = data.map(item => ({
                    id: item.ogrenci_id,
                    name: item.ad_soyad || 'Bilinmiyor',
                    stage: item.program_adi || 'Bilinmiyor',
                    riskScore: parseInt(item.risk_skoru || 0),
                    semester: item.mevcut_yariyil || 1,
                    reason: item.oneri_aksiyon || 'İnceleme Bekliyor',
                    email: item.iletisim_mail,
                    initials: getInitials(item.ad_soyad || 'B')
                }));
                setAlarms(mappedAlarms);
            } catch (error) {
                console.error("Error fetching alarms:", error);
                setAlarms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlarms();
    }, []);

    const chartData = {
        datasets: [
            {
                label: 'Riskli Öğrenciler',
                data: alarms.map(alarm => ({
                    x: alarm.semester,
                    y: alarm.riskScore,
                    raw: alarm // Store full object for interaction
                })),
                backgroundColor: (context) => {
                    const value = context.raw?.y || 0;
                    return value > 90 ? '#ef4444' : '#f97316'; // Red for >90, Orange for others
                },
                borderColor: '#ffffff',
                borderWidth: 2,
                pointRadius: (context) => {
                    const value = context.raw?.y || 0;
                    return value > 90 ? 12 : 8; // Larger bubbles for critical risks
                },
                pointHoverRadius: 16,
                pointHoverBorderWidth: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' },
                bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                callbacks: {
                    label: (context) => {
                        const raw = context.raw.raw;
                        return [
                            ` ${raw.name}`,
                            ` Risk: %${raw.riskScore}`,
                            ` Dönem: ${raw.semester}`
                        ];
                    },
                },
                displayColors: false,
            },
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 70,
                        yMax: 70,
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            display: true,
                            content: 'Kritik Sınır (70)',
                            position: 'start',
                            backgroundColor: 'transparent',
                            color: 'rgba(239, 68, 68, 0.5)',
                            font: { size: 10, weight: 'bold' },
                            yAdjust: -10
                        }
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 10,
                left: 10,
                right: 20
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Akademik Yarıyıl',
                    font: { size: 10, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
                    color: '#94a3b8'
                },
                grid: {
                    color: '#f1f5f9',
                    borderDash: [4, 4],
                },
                min: 0,
                max: 10, // Assuming standard max semester
                ticks: {
                    stepSize: 1,
                    font: { family: "'Plus Jakarta Sans', sans-serif" },
                    color: '#64748b'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Risk Skoru',
                    font: { size: 10, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
                    color: '#94a3b8'
                },
                grid: {
                    color: '#f1f5f9',
                },
                min: 50, // Focus on the high risk area
                max: 100,
                ticks: {
                    stepSize: 10,
                    font: { family: "'Plus Jakarta Sans', sans-serif" },
                    color: '#64748b'
                }
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const alarm = alarms[index];
                setSelectedAlarm(alarm);
            }
        },
        onHover: (event, chartElement) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    if (loading) return (
        <div className="ads-card p-8 rounded-[2.5rem] h-full flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <>
            <div className="ads-card p-10 rounded-[2.8rem] h-full flex flex-col bg-white border border-slate-100/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group/card">
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Risk Analizi Haritası
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Öğrenci riski ve akademik dönem dağılımı</p>
                    </div>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        Canlı Veri
                    </span>
                </div>

                <div className="flex-1 w-full relative min-h-[250px]">
                    {alarms.length > 0 ? (
                        <Scatter ref={chartRef} data={chartData} options={options} />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                            <p className="text-sm font-bold text-slate-400">Veri bulunamadı veya riskli öğrenci yok</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Aşırı (%90+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Yüksek (%70-90)</span>
                    </div>
                </div>
            </div>

            {selectedAlarm && (
                <AlarmDetailModal
                    alarm={selectedAlarm}
                    onClose={() => setSelectedAlarm(null)}
                />
            )}
        </>
    );
};

export default CriticalAlarms;
