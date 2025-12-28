import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import ProcessFunnel from '../components/dashboard/ProcessFunnel';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import AdvisorWorkload from '../components/dashboard/AdvisorWorkload';
import CourseRiskAnalysis from '../components/dashboard/CourseRiskAnalysis';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">



                {/* Top Stat Cards */}
                <div className="mb-8">
                    <DashboardStats />
                </div>

                {/* Middle Section: Advisor Workload and Risk Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
                    <div className="lg:col-span-8">
                        <AdvisorWorkload />
                    </div>
                    <div className="lg:col-span-4">
                        <RiskDistribution />
                    </div>
                </div>

                {/* Lower Section: Process Funnel and Course Risk Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-6">
                        <ProcessFunnel />
                    </div>
                    <div className="lg:col-span-6">
                        <CourseRiskAnalysis />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;

