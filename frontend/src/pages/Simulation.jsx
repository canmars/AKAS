import React, { useState } from 'react';
import SimulationSidebar from '../components/simulation/SimulationSidebar';
import WorkloadForecastChart from '../components/simulation/WorkloadForecastChart';
import CriticalInsights from '../components/simulation/CriticalInsights';
import GraduationProjectionChart from '../components/simulation/GraduationProjectionChart';

const Simulation = () => {
    const [params, setParams] = useState({
        newQuota: 50,
        graduationEffect: 'Stabil (Mevcut)',
        advisorLimit: 15,
        simulateRetirement: true,
        nonThesisActive: false
    });

    const handleParamChange = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-gray-50/50">
            {/* Sidebar - Parameters */}
            <SimulationSidebar params={params} onParamChange={handleParamChange} />

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tahmini Danışman Yükü Dağılımı</h1>
                            <p className="text-lg text-gray-400 mt-2 font-medium">Simüle edilen senaryoya göre 2024-2025 Akademik Yılı tahmini.</p>
                        </div>
                        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Riskli</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Kritik</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart Card */}
                    <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm min-h-[400px]">
                        <WorkloadForecastChart params={params} />
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Critical Insights */}
                        <div className="lg:col-span-5">
                            <CriticalInsights params={params} />
                        </div>

                        {/* Graduation Projection */}
                        <div className="lg:col-span-7">
                            <GraduationProjectionChart params={params} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Simulation;
