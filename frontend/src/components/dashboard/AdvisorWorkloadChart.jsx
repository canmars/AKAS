import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';

const AdvisorWorkloadChart = () => {
    const navigate = useNavigate();
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const data = await api.get('/dashboard/advisor-load');
                if (data && Array.isArray(data)) {
                    setAdvisors(data);
                }
            } catch (error) {
                console.error("Error fetching advisor load:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdvisors();
    }, []);

    const getSemanticState = (rate) => {
        if (rate >= 85) return {
            label: 'DOLU / ATAMA YAPMA',
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-100',
            bar: 'bg-red-500',
            icon: '⚠️',
            desc: 'Kritik Eşik Aşıldı'
        };
        if (rate >= 50) return {
            label: 'DİKKATLİ ATA',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            bar: 'bg-amber-500',
            icon: '⚡',
            desc: 'Sınıra Yaklaşıyor'
        };
        return {
            label: 'MÜSAİT',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            bar: 'bg-emerald-500',
            icon: '✅',
            desc: 'Güvenli Bölge'
        };
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Analiz Ediliyor...</div>;

    return (
        <div className="kds-card p-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Akademik Yük Dengesi</h3>
                    <p className="text-gray-400 font-medium mt-1">Hoca başına düşen aktif öğrenci yükü</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {advisors.map((advisor, index) => {
                    const state = getSemanticState(advisor.doluluk_orani);
                    return (
                        <div
                            key={index}
                            onClick={() => { setSelectedAdvisor(advisor); setModalOpen(true); }}
                            className={`p-6 rounded-[32px] border transition-all cursor-pointer group hover:scale-[1.01] ${state.border} ${state.bg}/30 hover:${state.bg}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                        <img src={`https://ui-avatars.com/api/?name=${advisor.hoca_adi}&background=random&color=fff`} alt="" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{advisor.hoca_adi}</h4>
                                        <p className="text-xs font-bold text-gray-400">{state.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-black px-3 py-1 rounded-full ${state.bg} ${state.color} border ${state.border}`}>
                                        {state.label}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Doluluk Oranı</span>
                                <span className={`text-xl font-black ${state.color}`}>%{advisor.doluluk_orani}</span>
                            </div>

                            <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${state.bar}`}
                                    style={{ width: `${Math.min(advisor.doluluk_orani, 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100/50">
                                <span className="text-xs font-bold text-gray-500">
                                    Kapasite: <span className="text-gray-900">{advisor.mevcut} / {advisor.kota}</span>
                                </span>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                                    Öğrencileri Listele &rarr;
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${selectedAdvisor?.hoca_adi} - Aktif Yük Analizi`}
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Toplam Atanmış</p>
                            <h5 className="text-3xl font-black text-blue-900">{selectedAdvisor?.mevcut} <span className="text-sm font-bold text-blue-400">/ {selectedAdvisor?.kota}</span></h5>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black bg-white px-4 py-2 rounded-xl text-blue-600 shadow-sm">
                                {selectedAdvisor?.kota - selectedAdvisor?.mevcut} Boş Kontenjan
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2">Öğrenci Listesi</p>
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {[...Array(selectedAdvisor?.mevcut || 0)].map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-xs font-bold flex items-center justify-center text-gray-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900">Öğrenci #{2023000 + i}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Tez Aşamasında</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DetailModal>
        </div>
    );
};

export default AdvisorWorkloadChart;

