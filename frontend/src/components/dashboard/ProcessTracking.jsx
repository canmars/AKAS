import React, { useState } from 'react';

const ProcessTracking = () => {
    const [activeTab, setActiveTab] = useState('YL');

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Aşama Takibi & Süreç</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Öğrencilerin dönem bazlı ilerleme ortalamaları</p>
                </div>

                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button
                        onClick={() => setActiveTab('YL')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'YL' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        YL
                    </button>
                    <button
                        onClick={() => setActiveTab('DR')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'DR' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        DR
                    </button>
                </div>
            </div>

            <div className="flex-1 relative min-h-[200px] flex flex-col justify-center pl-4">
                {/* Horizontal Grid Lines & Column Headers */}
                <div className="absolute inset-x-0 top-0 flex justify-between px-32 mb-2">
                    {/* Column Headers are positioned absolutely above the grid? No, simpler to use grid layout */}
                </div>

                {/* Custom Grid */}
                <div className="absolute inset-0 left-32 flex pointer-events-none z-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 border-l border-dashed border-gray-100 relative h-full">
                            <span className="absolute -top-6 left-2 text-[10px] uppercase font-bold text-gray-300 tracking-wider">Dönem {i === 4 ? '4+' : i}</span>
                        </div>
                    ))}
                </div>

                {/* Swimlanes */}
                <div className="relative space-y-10 z-10 w-full">
                    {/* Lane 1: Ders Dönemi */}
                    <div className="flex items-center group">
                        <div className="w-32 flex-shrink-0 text-xs font-bold text-gray-500 text-right pr-6 group-hover:text-gray-800 transition-colors">Ders Dönemi</div>
                        <div className="flex-1 h-10 relative flex items-center">
                            <div className="absolute left-[5%] w-[35%] h-full bg-[#6366F1] rounded-lg shadow-sm flex items-center justify-center text-xs text-white font-bold hover:bg-[#4F46E5] transition-all cursor-pointer transform hover:scale-[1.02]">
                                45 Öğrenci (Ort. 3.20 GPA)
                            </div>
                        </div>
                    </div>

                    {/* Lane 2: Seminer/Yeterlilik */}
                    <div className="flex items-center group">
                        <div className="w-32 flex-shrink-0 text-xs font-bold text-gray-500 text-right pr-6 group-hover:text-gray-800 transition-colors">Seminer/Yeterlilik</div>
                        <div className="flex-1 h-10 relative flex items-center">
                            <div className="absolute left-[45%] w-[20%] h-full bg-[#8B5CF6] rounded-lg shadow-sm flex items-center justify-center text-xs text-white font-bold hover:bg-[#7C3AED] transition-all cursor-pointer transform hover:scale-[1.02]">
                                12 Bekleyen
                            </div>
                        </div>
                    </div>

                    {/* Lane 3: Tez Çalışması */}
                    <div className="flex items-center group">
                        <div className="w-32 flex-shrink-0 text-xs font-bold text-gray-500 text-right pr-6 group-hover:text-gray-800 transition-colors">Tez Çalışması</div>
                        <div className="flex-1 h-10 relative flex items-center">
                            <div className="absolute left-[68%] right-4 h-full bg-[#10B981] rounded-lg shadow-sm flex items-center justify-center text-xs text-white font-bold hover:bg-[#059669] transition-all cursor-pointer transform hover:scale-[1.02]">
                                32 Aktif Tez
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessTracking;
