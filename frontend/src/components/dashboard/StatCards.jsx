import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';

const StatCards = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStudentsChange: '+0%',
        riskyStudents: 0,
        riskyPercentage: '0%',
        activeTheses: 0,
        totalThesesPool: 0,
        advisorLoad: 0,
        advisorTarget: 8.0,
        advisorStatus: 'good'
    });
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/dashboard/kpis');
                if (data) {
                    setStats({
                        totalStudents: data.total_students?.value || 0,
                        totalStudentsChange: data.total_students?.change || '+0%',
                        riskyStudents: data.high_risk?.value || 0,
                        riskyPercentage: data.high_risk?.percentage || '0%',
                        activeTheses: data.active_thesis?.value || 0,
                        totalThesesPool: data.active_thesis?.total_pool || 0,
                        advisorLoad: data.advisor_load?.value || 0,
                        advisorTarget: data.advisor_load?.target || 8.0,
                        advisorStatus: data.advisor_load?.status || 'good'
                    });
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const ArrowRight = () => (
        <svg className="w-5 h-5 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    );

    const StatCard = ({ title, value, subtext, icon, change, colorClass, onClick, bgColor, highlight }) => (
        <div
            onClick={onClick}
            className="kds-card p-10 flex flex-col justify-between cursor-pointer group relative overflow-hidden h-full"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-[0.03] rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div className={`p-6 ${bgColor} ${colorClass} rounded-[28px] shadow-sm transform group-hover:rotate-6 transition-transform duration-500`}>
                        {icon}
                    </div>
                    {change && (
                        <span className="bg-emerald-50 text-emerald-600 text-[11px] font-black px-4 py-2 rounded-xl flex items-center uppercase tracking-widest border border-emerald-100/50 shadow-sm animate-pulse-soft">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            {change}
                        </span>
                    )}
                    {highlight && (
                        <span className="bg-red-50 text-red-500 text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-red-100/50 shadow-sm">
                            {highlight}
                        </span>
                    )}
                </div>

                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{title}</h3>
                <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black text-gray-900 leading-none tracking-tight group-hover:text-blue-600 transition-colors duration-300">{value}</span>
                </div>
                <p className="mt-8 text-base font-bold text-gray-400 tracking-tight">{subtext}</p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                <button className={`text-[11px] font-black flex items-center uppercase tracking-widest ${colorClass}`}>
                    Analiz Detayları <ArrowRight />
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-[32px]"></div>)}
    </div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
                <StatCard
                    title="Toplam Öğrenci"
                    value={stats.totalStudents}
                    subtext="Aktif Akademik Popülasyon"
                    change={stats.totalStudentsChange}
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    bgColor="bg-blue-50"
                    colorClass="text-blue-600"
                    onClick={() => navigate('/students')}
                />

                <StatCard
                    title="Risk Analizi"
                    value={stats.riskyStudents}
                    subtext="Müdahale Gerekli %"
                    highlight={`%${stats.riskyPercentage}`}
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    bgColor="bg-red-50"
                    colorClass="text-red-500"
                    onClick={() => navigate('/students?filter=high_risk')}
                />

                <StatCard
                    title="Ortalama Yük"
                    value={stats.advisorLoad}
                    subtext="Danışman / Öğrenci"
                    highlight={stats.advisorStatus === 'good' ? 'İDEAL' : 'YÜKSEK'}
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    bgColor="bg-indigo-50"
                    colorClass="text-indigo-600"
                    onClick={() => navigate('/academic-staff')}
                />

                <StatCard
                    title="Tez Süreci"
                    value={stats.activeTheses}
                    subtext={`Havuz: ${stats.totalThesesPool} Aktif`}
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    bgColor="bg-amber-50"
                    colorClass="text-amber-500"
                    onClick={() => navigate('/simulation')}
                />
            </div>

            <DetailModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
            >
                {modalConfig.content}
            </DetailModal>
        </>
    );
};

export default StatCards;

