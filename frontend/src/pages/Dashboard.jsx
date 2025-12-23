
import React, { useEffect, useState } from 'react';
import KPICard from '../components/dashboard/KPICard.jsx';
import ProgramDistributionChart from '../components/ProgramDistributionChart.jsx';
import RiskHeatmap from '../components/dashboard/RiskHeatmap.jsx';
import LiveNotifications from '../components/dashboard/LiveNotifications.jsx';
import ProcessTracking from '../components/dashboard/ProcessTracking.jsx';
import AdvisorLoadList from '../components/dashboard/AdvisorLoadList.jsx';
import { DashboardService } from '../services/dashboardService.js';
import { Filter, Download } from 'lucide-react';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        summary: null,
        alerts: [],
        programDistribution: null,
        riskDistribution: null,
        advisorLoad: null
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    summary,
                    alerts,
                    programDistribution,
                    riskDistribution,
                    advisorLoad
                ] = await Promise.all([
                    DashboardService.getSummary(),
                    DashboardService.getAlerts(),
                    DashboardService.getProgramDistribution(),
                    DashboardService.getRiskDistribution(),
                    DashboardService.getAdvisorLoad(),
                ]);

                setData({
                    summary,
                    alerts: alerts?.alerts || [],
                    programDistribution,
                    riskDistribution,
                    advisorLoad: advisorLoad?.advisors || []
                });
            } catch (error) {
                console.error('Dashboard data load error:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Derived Values
    const summary = data.summary || {};
    const activeStudents = summary.activeStudents || 142;
    const graduatesThisMonth = summary.graduatesThisMonth || 0; // Mock or real
    const riskCount = (summary.riskStudents?.yuksek || 0) + (summary.riskStudents?.kritik || 0) || 18;
    const advisorCount = data.advisorLoad?.length || 12;

    // KPI Data Preparation
    const kpis = [
        {
            title: 'TOPLAM ÖĞRENCİ',
            value: activeStudents,
            trend: { value: '5%', direction: 'up' },
            progress: { value: 70, label: 'Kapasite Doluluk: %70', color: 'blue' },
            icon: 'users'
        },
        {
            title: 'KRİTİK RİSK',
            value: riskCount,
            trend: { value: '2', direction: 'up' }, // increasing bad
            variant: 'destructive',
            segmentedBar: {
                label: 'Yüksek öncelikli müdahale',
                segments: [
                    { color: 'red', width: 40 },
                    { color: 'orange', width: 30 },
                    { color: 'yellow', width: 30 }
                ]
            },
            icon: 'warning'
        },
        {
            title: 'MEZUNİYET',
            value: '%86',
            trend: { value: '1.5%', direction: 'up' },
            progress: { value: 86, label: 'Hedefin %4 altındasınız', color: 'green' },
            icon: 'graduation'
        },
        {
            title: 'DANIŞMANLAR',
            value: `${advisorCount} Aktif`,
            avatars: { count: 9 },
            subtitle: 'Ortalama Yük: 11.8 Öğrenci',
            icon: 'users'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                        <span className="bg-blue-50 px-2 py-0.5 rounded">YBS BÖLÜMÜ</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">Güz 2023-24</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Genel Bakış</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        <Filter size={16} className="text-gray-500" />
                        Filtrele
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        <Download size={16} className="text-gray-500" />
                        Dışa Aktar
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, idx) => (
                    <KPICard key={idx} {...kpi} />
                ))}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-12 gap-6 mb-8 lg:h-[400px]">
                {/* Left: Program Distribution */}
                <div className="col-span-12 lg:col-span-3 h-full">
                    <ProgramDistributionChart data={data.programDistribution} />
                </div>

                {/* Middle: Process Tracking */}
                <div className="col-span-12 lg:col-span-6 h-full">
                    <ProcessTracking />
                </div>

                {/* Right: Live Notifications */}
                <div className="col-span-12 lg:col-span-3 h-full">
                    <LiveNotifications alerts={data.alerts} />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[400px]">
                {/* Risk Heatmap */}
                <div className="h-full">
                    <RiskHeatmap />
                </div>

                {/* Advisor Load */}
                <div className="h-full">
                    <AdvisorLoadList advisors={data.advisorLoad} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
