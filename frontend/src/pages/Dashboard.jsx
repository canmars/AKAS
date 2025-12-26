import React from 'react';
import StatCards from '../components/dashboard/StatCards';
import DetailedStats from '../components/dashboard/DetailedStats';
import RiskyStudentsTable from '../components/dashboard/RiskyStudentsTable';
import RiskDonutChart from '../components/dashboard/RiskDonutChart';
import CoursePerformanceBars from '../components/dashboard/CoursePerformanceBars';
import CourseRepeatAnalysis from '../components/dashboard/CourseRepeatAnalysis';
import AdvisorWorkloadChart from '../components/dashboard/AdvisorWorkloadChart';
import AcademicFunnel from '../components/dashboard/AcademicFunnel';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc]/50 pb-20">
            <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">

                {/* Header Section */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight">KDS Dashboard</h1>
                        <p className="text-xl text-gray-400 mt-2 font-bold uppercase tracking-widest text-xs">Karar Destek Sistemi • AKAS v2.0</p>
                    </div>
                </div>

                {/* 1. High-Level KPIs */}
                <div className="mb-12">
                    <StatCards />
                </div>

                {/* 2. Analytical Deep-Dive */}
                <div className="mb-12">
                    <DetailedStats />
                </div>

                {/* 3. Operational Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                    {/* Primary Action Zone (Span 8) */}
                    <div className="xl:col-span-8 space-y-10">

                        {/* Critical Risk Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 h-full">
                                <RiskyStudentsTable />
                            </div>
                            <div className="lg:col-span-4 h-full">
                                <RiskDonutChart />
                            </div>
                        </div>

                        {/* Curriculum Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <CoursePerformanceBars />
                            <CourseRepeatAnalysis />
                        </div>
                    </div>

                    {/* Strategic Sidebar (Span 4) */}
                    <div className="xl:col-span-4 space-y-10">
                        <div className="h-auto">
                            <AdvisorWorkloadChart />
                        </div>
                        <div className="h-auto">
                            <AcademicFunnel />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;

