import React from 'react';

const SimulationSidebar = ({ params, onParamChange }) => {
    return (
        <aside className="w-[380px] bg-[#1e2532] text-white p-10 flex flex-col shadow-2xl z-20 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black tracking-tight text-white/95">Parametreler</h2>
                <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            <div className="space-y-12 flex-1">
                {/* 1. ÖĞRENCİ AKIŞI */}
                <section>
                    <div className="flex items-center gap-3 mb-8 opacity-60">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Öğrenci Akışı</span>
                    </div>

                    <div className="space-y-10">
                        <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-sm font-bold text-white/80">Yeni Kontenjan</label>
                                <span className="text-lg font-black text-blue-400">{params.newQuota}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={params.newQuota}
                                onChange={(e) => onParamChange('newQuota', parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4">
                            <label className="text-sm font-bold text-white/80 block">Mezuniyet Oranı Etkisi</label>
                            <select
                                value={params.graduationEffect}
                                onChange={(e) => onParamChange('graduationEffect', e.target.value)}
                                className="w-full bg-[#2a3447] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all"
                            >
                                <option>Stabil (Mevcut)</option>
                                <option>Hızlandırılmış (%20+)</option>
                                <option>Yavaşlatılmış (%20-)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 2. AKADEMİSYEN YÖNETİMİ */}
                <section>
                    <div className="flex items-center gap-3 mb-8 opacity-60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Akademisyen Yönetimi</span>
                    </div>

                    <div className="space-y-10">
                        <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-sm font-bold text-white/80">Hoca Başı Yük Limiti</label>
                                <span className="text-lg font-black text-blue-400">{params.advisorLimit}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="30"
                                value={params.advisorLimit}
                                onChange={(e) => onParamChange('advisorLimit', parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between mt-3 text-[10px] font-black text-white/30 tracking-widest uppercase">
                                <span>5</span>
                                <span>30</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white/5 p-6 rounded-[24px] border border-white/5">
                            <label className="text-sm font-bold text-white/80">Emeklilikleri Simüle Et</label>
                            <button
                                onClick={() => onParamChange('simulateRetirement', !params.simulateRetirement)}
                                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${params.simulateRetirement ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${params.simulateRetirement ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. PROGRAM ETKİLERİ */}
                <section>
                    <div className="flex items-center gap-3 mb-8 opacity-60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Program Etkileri</span>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-6 rounded-[24px] border border-white/5">
                        <label className="text-sm font-bold text-white/80">Tezsiz Programlar Aktif</label>
                        <button
                            onClick={() => onParamChange('nonThesisActive', !params.nonThesisActive)}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${params.nonThesisActive ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${params.nonThesisActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </section>
            </div>

            {/* Run Button */}
            <button className="mt-12 w-full py-6 bg-blue-600 rounded-[28px] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.15em] group">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                Senaryoyu Çalıştır
            </button>
        </aside>
    );
};

export default SimulationSidebar;
