import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import DetailModal from '../common/DetailModal';

ChartJS.register(ArcElement, Tooltip, Legend);

const DetailedStats = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/dashboard/kpis');
                if (data) setStats(data);
            } catch (error) {
                console.error("Error loading detailed stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openModal = (type) => {
        if (type === 'riskAnalysis') {
            setModalConfig({
                isOpen: true,
                title: 'Risk Eşiği Analizi',
                content: (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <h4 className="font-semibold text-red-900 mb-2 text-sm">Risk Faktörleri</h4>
                            <div className="space-y-3">
                                {[
                                    { label: 'Düşük GNO (<2.0)', val: 45, color: 'bg-red-500' },
                                    { label: 'Tez Süresi Uzaması', val: 30, color: 'bg-orange-500' },
                                    { label: 'Ders Devamsızlığı', val: 25, color: 'bg-amber-500' }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-medium mb-1 text-slate-600">
                                            <span>{item.label}</span>
                                            <span>%{item.val}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            });
        }
    };

    if (loading || !stats) return null;

    const riskVal = stats.risk_threshold_exceeded?.value || 0;
    const completionRate = stats.thesis_completion_rate?.value || 0;

    const chartOptions = {
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 }
            }
        },
        maintainAspectRatio: false,
        responsive: true,
        cutout: '85%'
    };

    const StatusBox = ({ title, value, change, icon, colorClass, bgColor, onClick }) => (
        <div onClick={onClick} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between h-full group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
                <div className={`p-2 rounded-lg ${bgColor} ${colorClass}`}>
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
                {change && <span className={`text-xs font-medium px-2 py-0.5 rounded ${colorClass} bg-opacity-20`}>{change}</span>}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">

            {/* 1. Risk Gauge */}
            <div onClick={() => openModal('riskAnalysis')} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6 lg:col-span-4 flex justify-between items-center cursor-pointer">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Kritik Risk Eşiği</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{riskVal}</span>
                        <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100">{stats.risk_threshold_exceeded?.change}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Anlık Müdahale Listesi</p>
                </div>
                <div className="h-32 w-32 relative flex items-center justify-center">
                    <div className="absolute inset-0">
                        <Doughnut
                            data={{
                                datasets: [{
                                    data: [riskVal, 100 - riskVal],
                                    backgroundColor: ['#EF4444', '#f1f5f9'],
                                    borderWidth: 0,
                                    circumference: 360
                                }]
                            }}
                            options={chartOptions}
                        />
                    </div>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-bold text-slate-900">{riskVal}</span>
                    </div>
                </div>
            </div>

            {/* 2. Thesis Completion */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-4 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Mezuniyet Performansı</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">%{completionRate}</span>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{stats.thesis_completion_rate?.trend}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span>Mezun</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span>Aday</span>
                    </div>
                </div>
                <div className="h-32 w-32 relative flex items-center justify-center">
                    <Doughnut
                        data={{
                            datasets: [{
                                data: [completionRate, 100 - completionRate],
                                backgroundColor: ['#2563EB', '#f1f5f9'],
                                borderWidth: 0
                            }]
                        }}
                        options={chartOptions}
                    />
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-bold text-slate-900">%{completionRate}</span>
                    </div>
                </div>
            </div>

            {/* 3. Status Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-6">
                <StatusBox
                    title="Net Mezun"
                    value={stats.graduates?.value || 0}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    colorClass="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <StatusBox
                    title="Akademisyen"
                    value={stats.advisor_count?.value || 0}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    colorClass="text-purple-600"
                    bgColor="bg-purple-50"
                />

                {/* Graduates Candidate Long Card */}
                <div onClick={() => navigate('/students?filter=candidate')} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer p-6 col-span-2 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Mezun Adayı</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.graduate_candidates?.value || 0}</span>
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{stats.graduate_candidates?.trend}</span>
                        </div>
                    </div>
                </div>
            </div>

            <DetailModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
            >
                {modalConfig.content}
            </DetailModal>
        </div>
    );
};

export default DetailedStats;

