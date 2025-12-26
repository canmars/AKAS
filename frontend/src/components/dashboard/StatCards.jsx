import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';

const StatCards = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStudentsChange: '0%',
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

    const StatCard = ({ title, value, subtext, icon, change, colorClass, onClick, bgColor, highlight }) => (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 tracking-tighter">{value}</span>
                        {highlight && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgColor} ${colorClass}`}>
                                {highlight}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${bgColor} ${colorClass} bg-opacity-50`}>
                    {React.cloneElement(icon, { className: "w-6 h-6" })}
                </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-2">
                    {change && (
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {change}
                        </span>
                    )}
                    <span className="text-sm text-slate-400 font-medium truncate max-w-[120px]" title={subtext}>{subtext}</span>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </div>
    );

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Toplam Öğrenci"
                    value={stats.totalStudents}
                    subtext="Aktif Kayıt"
                    change={stats.totalStudentsChange}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    bgColor="bg-blue-50"
                    colorClass="text-blue-600"
                    onClick={() => navigate('/students')}
                />

                <StatCard
                    title="Riskli Öğrenci"
                    value={stats.riskyStudents}
                    subtext="Müdahale Bekleyen"
                    highlight={`%${stats.riskyPercentage}`}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    bgColor="bg-red-50"
                    colorClass="text-red-600"
                    onClick={() => navigate('/students?filter=high_risk')}
                />

                <StatCard
                    title="Ortalama Yük"
                    value={stats.advisorLoad}
                    subtext={`Hedef: ${stats.advisorTarget}`}
                    highlight={stats.advisorStatus === 'good' ? 'İDEAL' : 'YÜKSEK'}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
                    bgColor={stats.advisorStatus === 'good' ? 'bg-emerald-50' : 'bg-amber-50'}
                    colorClass={stats.advisorStatus === 'good' ? 'text-emerald-600' : 'text-amber-600'}
                    onClick={() => navigate('/academic-staff')}
                />

                <StatCard
                    title="Aktif Tez"
                    value={stats.activeTheses}
                    subtext={`Toplam Havuz: ${stats.totalThesesPool}`}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    bgColor="bg-indigo-50"
                    colorClass="text-indigo-600"
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

