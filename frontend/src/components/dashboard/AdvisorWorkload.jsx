import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdvisorModal = ({ advisor, onClose }) => {
    if (!advisor) return null;

    const tezli = advisor.tezli_durum || {};
    const tezsiz = advisor.tezsiz_durum || {};

    const isTezliOver = tezli.toplam_dolu > tezli.kota;
    const isTezsizOver = tezsiz.toplam_dolu > tezsiz.kota;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200 border border-slate-100/60">
                <div className="bg-slate-50/50 p-8 border-b border-slate-100/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{advisor.ad_soyad}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{advisor.unvan}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Tezli Kotası Detayı */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tezli Program Kotası</h4>
                            <span className={`text-sm font-black ${isTezliOver ? 'text-red-500' : 'text-slate-800'}`}>
                                {tezli.toplam_dolu} / {tezli.kota}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Ders Aşaması</p>
                                <p className="text-xl font-black text-blue-600">{tezli.detay?.ders_asamasi || 0}</p>
                            </div>
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Tez Aşaması</p>
                                <p className="text-xl font-black text-indigo-600">{tezli.detay?.tez_asamasi || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tezsiz Kotası Detayı */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tezsiz Program Kotası</h4>
                            <span className={`text-sm font-black ${isTezsizOver ? 'text-red-500' : 'text-slate-800'}`}>
                                {tezsiz.toplam_dolu} / {tezsiz.kota}
                            </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex justify-between items-center text-center px-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Proje Aşaması</p>
                                <p className="text-xl font-black text-slate-700">{tezsiz.detay?.proje_asamasi || 0}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Doluluk</p>
                                <p className="text-xl font-black text-slate-700">%{Math.round((tezsiz.toplam_dolu / (tezsiz.kota || 1)) * 100)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100/50">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all active:scale-[0.98] shadow-lg shadow-slate-200/50"
                    >
                        Anladım
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdvisorProgressBar = ({ advisor, onClick, maxRange }) => {
    const tezli = advisor.tezli_durum || {};
    const tezsiz = advisor.tezsiz_durum || {};

    const percentage = advisor.toplam_yuk_yuzdesi || 0;

    // Scale widths based on maxRange for visual comparison
    const dersWidth = ((tezli.detay?.ders_asamasi || 0) / maxRange) * 100;
    const tezWidth = ((tezli.detay?.tez_asamasi || 0) / maxRange) * 100;
    const tezsizWidth = (tezsiz.toplam_dolu / maxRange) * 100;

    const isOverLimit = tezli.toplam_dolu > tezli.kota;

    return (
        <div
            className="group cursor-pointer mb-5 last:mb-0 relative"
            onClick={() => onClick(advisor)}
        >
            <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {advisor.ad_soyad}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{advisor.unvan}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${isOverLimit ? 'text-red-500' : 'text-slate-800'}`}>
                        %{percentage}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                        ({tezli.toplam_dolu}/{tezli.kota})
                    </span>
                </div>
            </div>

            <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden relative border border-slate-100/50">
                <div className="flex h-full w-full">
                    {/* Tezsiz Part (Grey) */}
                    <div
                        className="h-full bg-slate-300 transition-all duration-700 ease-out"
                        style={{ width: tezsizWidth + '%' }}
                    />
                    {/* Tezli Ders Part (Light Blue) */}
                    <div
                        className="h-full bg-blue-300 transition-all duration-700 ease-out"
                        style={{ width: dersWidth + '%' }}
                    />
                    {/* Tezli Tez Part (Indigo) */}
                    <div
                        className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                        style={{ width: tezWidth + '%' }}
                    />
                </div>
            </div>
        </div>
    );
};

const AdvisorWorkload = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);

    const MAX_VISUAL_RANGE = 20;

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const data = await api.get('/dashboard/advisor-load');
                if (!data || !Array.isArray(data)) throw new Error("Invalid advisor data");
                // Already sorted and filtered by backend SQL
                setAdvisors(data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching advisor load:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisors();
    }, []);

    const quotaLinePos = (14 / MAX_VISUAL_RANGE) * 100;

    if (loading) return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100/50 h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100/50 h-full flex flex-col hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500 group/card">
            <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Akademisyen Yük Dağılımı</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest text-[9px]">Kapasite ve Süreç Analizi</p>
                </div>
                <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                    Tümünü Gör
                </button>
            </div>

            <div className="flex-1 space-y-2 relative">
                {/* Vertical Quota Line (Tezli) */}
                <div
                    className="absolute top-0 bottom-0 z-10 w-px bg-red-400/30 pointer-events-none border-l border-dashed border-red-400/40"
                    style={{ left: quotaLinePos + '%' }}
                >
                    <div className="absolute top-[-26px] left-[-12px] bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-red-200 uppercase tracking-tighter">
                        KOTA: 14
                    </div>
                </div>

                {advisors.length > 0 ? (
                    advisors.map((adv, idx) => (
                        <AdvisorProgressBar
                            key={adv.personel_id || idx}
                            advisor={adv}
                            onClick={setSelectedAdvisor}
                            maxRange={MAX_VISUAL_RANGE}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                        <span className="text-3xl mb-4">📭</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Veri bulunamadı</p>
                    </div>
                )}
            </div>

            {/* Premium Legend */}
            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-around gap-2 shrink-0">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tezsiz</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tezli (Ders)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-md shadow-indigo-100"></div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tezli (Tez)</span>
                </div>
            </div>

            {selectedAdvisor && (
                <AdvisorModal
                    advisor={selectedAdvisor}
                    onClose={() => setSelectedAdvisor(null)}
                />
            )}
        </div>
    );
};

export default AdvisorWorkload;
