import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';

const AcademicFunnel = () => {
    // 5-Stage Process: Ders -> Yeterlik -> Öneri -> Yazım -> Mezuniyet
    const [metrics, setMetrics] = useState({
        lesson: 42,
        qualification: 15,
        proposal: 28,
        writing: 12,
        graduated: 38
    });
    const [loading, setLoading] = useState(true);
    const [selectedStage, setSelectedStage] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await api.get('/dashboard/funnel');
                if (data) {
                    // Mapping legacy data to new 5-stage structure if necessary
                    // For now, using mock balanced data for KDS demonstration
                    setMetrics({
                        lesson: data.lesson || 42,
                        qualification: data.qualification || 15,
                        proposal: Math.round((data.thesis || 30) * 0.4),
                        writing: Math.round((data.thesis || 30) * 0.6),
                        graduated: data.graduated || 38
                    });
                }
            } catch (error) {
                console.error("Error fetching funnel metrics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const stages = [
        { id: 'lesson', label: 'Ders Dönemi', count: metrics.lesson, color: 'bg-blue-400', icon: '📚' },
        { id: 'qualification', label: 'Yeterlik Sınavı', count: metrics.qualification, color: 'bg-indigo-400', icon: '📝' },
        { id: 'proposal', label: 'Tez Önerisi', count: metrics.proposal, color: 'bg-violet-400', icon: '💡' },
        { id: 'writing', label: 'Tez Yazımı', count: metrics.writing, color: 'bg-purple-500', icon: '✍️' },
        { id: 'graduated', label: 'Mezuniyet', count: metrics.graduated, color: 'bg-emerald-500', icon: '🎓' }
    ];

    // Bottleneck Logic: If a stage has > 2x the previous or next stage, mark as bottleneck
    const detectBottleneck = (index) => {
        if (index === 0) return false;
        const currentCount = stages[index].count;
        const prevCount = stages[index - 1].count;
        return currentCount > prevCount * 1.5 && currentCount > 15;
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold font-['Outfit']">Süreç Analiz Ediliyor...</div>;

    return (
        <div className="kds-card p-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Akademik Süreç Hunisi</h3>
                    <p className="text-gray-400 font-medium mt-1">Sürecin neresinde tıkanıklık var?</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-4 py-4">
                {stages.map((stage, index) => {
                    const isBottleneck = detectBottleneck(index);
                    const width = 100 - (index * 8);

                    return (
                        <div
                            key={stage.id}
                            style={{ width: `${width}%` }}
                            onClick={() => setSelectedStage(stage)}
                            className={`group relative h-20 ${stage.color} rounded-[28px] flex items-center justify-between px-8 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border-4 border-white shadow-lg shadow-black/5 overflow-hidden`}
                        >
                            {/* Stuck Indicator Background */}
                            {isBottleneck && (
                                <div className="absolute inset-0 bg-red-500/20 animate-kds-pulse pointer-events-none border-2 border-red-500/50 rounded-[28px]"></div>
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <span className="text-2xl filter drop-shadow-sm">{stage.icon}</span>
                                <div>
                                    <h4 className="text-sm font-black text-white/90 uppercase tracking-widest">{stage.label}</h4>
                                    {isBottleneck && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Tıkanıklık Noktası</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white leading-none block">{stage.count}</span>
                                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Öğrenci</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💡</div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                    <span className="text-gray-900 font-extrabold block mb-1 uppercase tracking-widest">KDS Önerisi:</span>
                    Aşamalar arası huni daralmasını korumak için
                    <span className="text-blue-600 font-black"> {stages.find(s => detectBottleneck(stages.indexOf(s)))?.label || 'akış normal'} </span>
                    aşamasındakilere müdahale edilmelidir.
                </p>
            </div>

            <DetailModal
                isOpen={!!selectedStage}
                onClose={() => setSelectedStage(null)}
                title={selectedStage ? `${selectedStage.label} - Öğrenci Kümesi` : ''}
            >
                <div className="space-y-6">
                    <div className={`${selectedStage?.color} p-8 rounded-[36px] text-white flex justify-between items-center shadow-xl`}>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Aşamada Bekleyen</p>
                            <h5 className="text-4xl font-black">{selectedStage?.count} Öğrenci</h5>
                        </div>
                        <span className="text-5xl opacity-40">{selectedStage?.icon}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Müdahale Gerekli Liste</p>
                            <button className="text-[10px] font-black text-blue-600 uppercase">Hepsini Seç</button>
                        </div>
                        <div className="max-h-72 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {[...Array(selectedStage?.count || 0)].slice(0, 10).map((_, i) => (
                                <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-sm font-black text-gray-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900">Öğrenci Adı Soyadı</p>
                                            <p className="text-[10px] font-bold text-gray-400 capitalize">Kayıt: 2023-1 dönemi</p>
                                        </div>
                                    </div>
                                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                        İncele
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

export default AcademicFunnel;

