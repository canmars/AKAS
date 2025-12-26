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
        <div className="min-h-screen bg-slate-50 pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Genel Bakış</h1>
                    <p className="text-sm text-slate-500 mt-1">Akademik performans ve risk durumu analizi.</p>
                </div>

                {/* 1. High-Level KPIs */}
                <div className="mb-8">
                    <StatCards />
                </div>

                {/* 2. Analytical Deep-Dive */}
                <div className="mb-8">
                    <DetailedStats />
                </div>

                {/* 3. Operational Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Primary Action Zone (Span 8) */}
                    <div className="xl:col-span-8 space-y-6">

                        {/* Critical Risk Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 h-full">
                                <RiskyStudentsTable />
                            </div>
                            <div className="lg:col-span-4 h-full">
                                <RiskDonutChart />
                            </div>
                        </div>

                        {/* Curriculum Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CoursePerformanceBars />
                            <CourseRepeatAnalysis />
                        </div>
                    </div>

                    {/* Strategic Sidebar (Span 4) */}
                    <div className="xl:col-span-4 space-y-6">
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
