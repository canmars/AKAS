import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';

const AdvisorWorkloadChart = () => {
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
            label: 'Dolu',
            color: 'text-red-700',
            bg: 'bg-red-50',
            border: 'border-red-200',
            bar: 'bg-red-600',
            desc: 'Kritik'
        };
        if (rate >= 50) return {
            label: 'Dikkat',
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            bar: 'bg-amber-500',
            desc: 'Orta'
        };
        return {
            label: 'Müsait',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            bar: 'bg-emerald-500',
            desc: 'Uygun'
        };
    };

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <span className="text-slate-400 font-medium animate-pulse">Yükleniyor...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Akademik Yük Dengesi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Hoca başına düşen aktif öğrenci yükü</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {advisors.map((advisor, index) => {
                    const state = getSemanticState(advisor.doluluk_orani);
                    return (
                        <div
                            key={index}
                            onClick={() => { setSelectedAdvisor(advisor); setModalOpen(true); }}
                            className="group block"
                        >
                            <div className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${state.bg} ${state.border}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm">
                                            {advisor.hoca_adi.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{advisor.hoca_adi}</h4>
                                            <span className={`text-xs font-medium ${state.color}`}>{state.desc}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-opacity-50 ${state.border} ${state.color}`}>
                                        %{advisor.doluluk_orani}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Kapasite</span>
                                        <span className="font-medium text-slate-700">{advisor.mevcut} / {advisor.kota}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${state.bar}`}
                                            style={{ width: `${Math.min(advisor.doluluk_orani, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${selectedAdvisor?.hoca_adi} - Yük Detayı`}
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-700">Mevcut Durum</span>
                            <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                                {selectedAdvisor?.kota - selectedAdvisor?.mevcut} Boş Kontenjan
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-slate-900">{selectedAdvisor?.mevcut}</span>
                            <span className="text-sm text-slate-500 mb-1">/ {selectedAdvisor?.kota} Öğrenci</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Atanmış Öğrenciler</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {[...Array(selectedAdvisor?.mevcut || 0)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Öğrenci #{2023000 + i}</p>
                                            <p className="text-xs text-slate-400">Tez Aşaması</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 text-xs font-medium hover:underline">Detay</button>
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

