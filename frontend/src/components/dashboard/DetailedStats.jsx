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
                    <div className="space-y-6">
                        <div className="p-8 bg-red-50/50 rounded-[28px] border border-red-100/50">
                            <h4 className="font-black text-red-800 mb-4 uppercase text-xs tracking-widest">Risk Dağılım Faktörleri</h4>
                            <div className="space-y-6">
                                {[
                                    { label: 'Düşük GNO (<2.0)', val: 45, color: 'bg-red-500' },
                                    { label: 'Tez Süresi Uzaması', val: 30, color: 'bg-orange-500' },
                                    { label: 'Ders Devamsızlığı', val: 25, color: 'bg-amber-500' }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-tight text-red-900/60">
                                            <span>{item.label}</span>
                                            <span>%{item.val}</span>
                                        </div>
                                        <div className="w-full bg-white/50 rounded-full h-3">
                                            <div className={`${item.color} h-3 rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
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
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        maintainAspectRatio: false,
        responsive: true,
        cutout: '82%'
    };

    const StatusBox = ({ title, value, change, icon, colorClass, bgColor, onClick }) => (
        <div onClick={onClick} className="kds-card p-8 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
                <div className={`p-4 ${bgColor} ${colorClass} rounded-2xl group-hover:rotate-12 transition-transform`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">{value}</span>
                {change && <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${colorClass} ${bgColor}`}>{change}</span>}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">

            {/* 1. Risk Gauge */}
            <div onClick={() => openModal('riskAnalysis')} className="kds-card p-10 lg:col-span-4 flex justify-between items-center cursor-pointer group">
                <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Kritik Risk Eşiği</h3>
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-7xl font-black text-red-500 tracking-tighter">{riskVal}</span>
                        <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-xl animate-pulse-soft border border-red-100">{stats.risk_threshold_exceeded?.change}</span>
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Anlık Müdahale Listesi</p>
                </div>
                <div className="h-40 w-40 relative flex items-center justify-center">
                    <div className="absolute inset-0 rotate-[225deg]">
                        <Doughnut
                            data={{
                                datasets: [{
                                    data: [riskVal, 100 - riskVal],
                                    backgroundColor: ['#EF4444', '#f1f5f9'],
                                    borderWidth: 0,
                                    circumference: 270
                                }]
                            }}
                            options={chartOptions}
                        />
                    </div>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-gray-900 leading-none">{riskVal}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">KİŞİ</span>
                    </div>
                </div>
            </div>

            {/* 2. Thesis Completion */}
            <div className="kds-card p-10 lg:col-span-4 flex justify-between items-center group">
                <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Mezuniyet Performansı</h3>
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-7xl font-black text-gray-900 tracking-tighter">%{completionRate}</span>
                        <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">{stats.thesis_completion_rate?.trend}</span>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mezun</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aday</span>
                        </div>
                    </div>
                </div>
                <div className="h-40 w-40 relative flex items-center justify-center">
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
                        <span className="text-2xl font-black text-gray-900 leading-none">%{completionRate}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase">HIZ</span>
                    </div>
                </div>
            </div>

            {/* 3. Status Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                <StatusBox
                    title="Net Mezun"
                    value={stats.graduates?.value || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    colorClass="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <StatusBox
                    title="Akademisyen"
                    value={stats.advisor_count?.value || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    colorClass="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <div onClick={() => navigate('/students?filter=candidate')} className="kds-card p-6 col-span-2 flex items-center justify-between cursor-pointer group">
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Mezun Adayı</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.graduate_candidates?.value || 0}</span>
                            <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100 uppercase tracking-widest">{stats.graduate_candidates?.trend}</span>
                        </div>
                    </div>
                    <div className="h-14 w-32">
                        <svg viewBox="0 0 100 40" className="w-full h-full text-blue-500">
                            <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M0 35 Q 25 35, 50 20 T 100 5" />
                        </svg>
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

