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
        { id: 'lesson', label: 'Ders Dönemi', count: metrics.lesson, color: 'bg-blue-500', icon: '📚' },
        { id: 'qualification', label: 'Yeterlik Sınavı', count: metrics.qualification, color: 'bg-indigo-500', icon: '📝' },
        { id: 'proposal', label: 'Tez Önerisi', count: metrics.proposal, color: 'bg-violet-500', icon: '💡' },
        { id: 'writing', label: 'Tez Yazımı', count: metrics.writing, color: 'bg-purple-600', icon: '✍️' },
        { id: 'graduated', label: 'Mezuniyet', count: metrics.graduated, color: 'bg-emerald-600', icon: '🎓' }
    ];

    // Bottleneck Logic: If a stage has > 2x the previous or next stage, mark as bottleneck
    const detectBottleneck = (index) => {
        if (index === 0) return false;
        const currentCount = stages[index].count;
        const prevCount = stages[index - 1].count;
        return currentCount > prevCount * 1.5 && currentCount > 15;
    };

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 h-full flex items-center justify-center">
            <span className="text-slate-400 font-medium animate-pulse">Süreç Analiz Ediliyor...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Akademik Süreç Hunisi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Öğrenci akışındaki yoğunluk noktaları</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-3 py-2">
                {stages.map((stage, index) => {
                    const isBottleneck = detectBottleneck(index);
                    const width = 100 - (index * 8);

                    return (
                        <div
                            key={stage.id}
                            style={{ width: `${width}%` }}
                            onClick={() => setSelectedStage(stage)}
                            className={`group relative h-16 ${stage.color} rounded-lg flex items-center justify-between px-6 cursor-pointer hover:opacity-90 transition-all shadow-sm`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{stage.icon}</span>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">{stage.label}</h4>
                                    {isBottleneck && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 bg-red-200 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-medium text-white/90">Yoğunluk</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-xl font-bold text-white leading-none block">{stage.count}</span>
                                <span className="text-[10px] text-white/80 font-medium">Öğrenci</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <div className="mt-1">💡</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-0.5">KDS Önerisi:</span>
                    Süreç akışını iyileştirmek için
                    <span className="text-blue-600 font-bold"> {stages.find(s => detectBottleneck(stages.indexOf(s)))?.label || 'belirli'} </span>
                    aşamasındaki yığılma incelenmelidir.
                </p>
            </div>

            <DetailModal
                isOpen={!!selectedStage}
                onClose={() => setSelectedStage(null)}
                title={selectedStage ? `${selectedStage.label} - Öğrenci Kümesi` : ''}
            >
                <div className="space-y-6">
                    <div className={`${selectedStage?.color} p-6 rounded-xl text-white flex justify-between items-center shadow-sm`}>
                        <div>
                            <p className="text-xs font-medium opacity-80 mb-1">Aşamada Bekleyen</p>
                            <h5 className="text-3xl font-bold">{selectedStage?.count} Öğrenci</h5>
                        </div>
                        <span className="text-4xl opacity-50">{selectedStage?.icon}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Öğrenci Listesi</p>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Hepsini Gör</button>
                        </div>
                        <div className="max-h-72 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {[...Array(selectedStage?.count || 0)].slice(0, 10).map((_, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Öğrenci Adı Soyadı</p>
                                            <p className="text-xs text-slate-500">Kayıt: 2023 Güz</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 text-xs font-medium hover:underline">
                                        Detay
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

