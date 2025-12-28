import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import ProcessFunnel from '../components/dashboard/ProcessFunnel';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import AdvisorWorkload from '../components/dashboard/AdvisorWorkload';
import CriticalAlarms from '../components/dashboard/CriticalAlarms';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontWeight: 700 }}>
                            Bölüm Başkanı Paneli
                        </h1>
                        <p className="text-gray-600 mt-1 font-normal" style={{ fontWeight: 400 }}>
                            Akademik performans ve öğrenci durumu genel bakışı
                        </p>
                    </div>
                    <button className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm group" style={{ fontWeight: 600 }}>
                        <span className="mr-2">📥</span>
                        Rapor Al
                    </button>
                </div>

                {/* Top Stat Cards */}
                <div className="mb-8">
                    <DashboardStats />
                </div>

                {/* Middle Section: Funnel and Risk Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
                    <div className="lg:col-span-8">
                        <ProcessFunnel />
                    </div>
                    <div className="lg:col-span-4">
                        <RiskDistribution />
                    </div>
                </div>

                {/* Lower Section: Advisor Workload and Critical Alarms */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-6">
                        <AdvisorWorkload />
                    </div>
                    <div className="lg:col-span-6">
                        <CriticalAlarms />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;

