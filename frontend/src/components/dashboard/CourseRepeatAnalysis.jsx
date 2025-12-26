import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const CourseRepeatAnalysis = () => {
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({ total: 0, critical: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCheck = async () => {
            try {
                const data = await api.get('/dashboard/course-performance');
                if (Array.isArray(data)) {
                    const sorted = [...data].sort((a, b) => b.ogrenci_sayisi - a.ogrenci_sayisi);
                    setCourses(sorted);
                    const totalStudents = sorted.reduce((acc, curr) => acc + (curr.ogrenci_sayisi || 0), 0);
                    setStats({ total: totalStudents, critical: 15 });
                }
            } catch (error) {
                console.error("Error fetching course data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCheck();
    }, []);

    const getCourse = (index) => {
        if (!courses[index]) return null;
        const c = courses[index];
        return {
            code: c.ders_kodu || c.ders_adi?.substring(0, 8) || 'UNK',
            count: c.ogrenci_sayisi || 0
        };
    };

    if (loading) return <div className="kds-card p-12 h-full flex items-center justify-center text-gray-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Analiz Hazırlanıyor...</div>;

    const c1 = getCourse(0) || { code: 'N/A', count: 0 };
    const c2 = getCourse(1) || { code: '-', count: 0 };
    const c3 = getCourse(2) || { code: '-', count: 0 };
    const c4 = getCourse(3) || { code: '-', count: 0 };
    const c5 = getCourse(4) || { code: '-', count: 0 };
    const c6 = getCourse(5);

    const othersCount = courses.slice(6).reduce((acc, curr) => acc + (curr.ogrenci_sayisi || 0), 0);
    const othersLabel = courses.length > 6 ? `${courses.length - 6} Diğer` : 'Diğer';

    return (
        <div className="kds-card p-10 h-full flex flex-col">
            <div className="mb-10 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Ders Yoğunluk Analizi</h3>
                    <p className="text-gray-400 font-medium mt-1 uppercase text-xs tracking-widest">Öğrenci Başına Tekrar Dağılımı</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-3 min-h-[300px]">
                {/* 1. Primary Focus */}
                <div className="col-span-2 row-span-2 bg-[#4F46E5] rounded-[24px] p-6 flex flex-col justify-between text-white hover:brightness-110 transition-all cursor-default relative overflow-hidden group shadow-lg shadow-indigo-100">
                    <span className="font-black text-xs opacity-80 z-10 uppercase tracking-widest">{c1.code}</span>
                    <span className="text-5xl font-black z-10 tracking-tighter">{c1.count}</span>
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                    </div>
                </div>

                <div className="col-span-2 row-span-1 bg-[#6366F1] rounded-[24px] p-6 flex flex-col justify-between text-white hover:brightness-110 transition-all cursor-default shadow-md shadow-indigo-50">
                    <span className="font-black text-xs opacity-80 uppercase tracking-widest">{c2.code}</span>
                    <span className="text-3xl font-black tracking-tight">{c2.count}</span>
                </div>

                <div className="col-span-2 row-span-1 bg-[#818CF8] rounded-[24px] p-6 flex flex-col justify-between text-white hover:brightness-110 transition-all cursor-default shadow-md shadow-indigo-50">
                    <span className="font-black text-xs opacity-80 uppercase tracking-widest">{c3.code}</span>
                    <span className="text-3xl font-black tracking-tight">{c3.count}</span>
                </div>

                <div className="col-span-1 row-span-1 bg-[#94A3B8] rounded-[20px] p-4 flex flex-col justify-between text-white hover:brightness-110 transition-all cursor-default">
                    <span className="font-black text-[10px] opacity-80 uppercase tracking-widest">{c4.code}</span>
                    <span className="text-xl font-black">{c4.count}</span>
                </div>

                <div className="col-span-1 row-span-1 bg-[#CBD5E1] rounded-[20px] p-4 flex flex-col justify-between text-slate-800 hover:brightness-110 transition-all cursor-default">
                    <span className="font-black text-[10px] opacity-60 uppercase tracking-widest">{c5.code}</span>
                    <span className="text-xl font-black">{c5.count}</span>
                </div>

                <div className="col-span-2 row-span-1 grid grid-cols-1 gap-2">
                    {c6 && (
                        <div className="bg-slate-50 border border-slate-100 rounded-[18px] p-3 flex items-center justify-between px-4 text-slate-600 hover:bg-white transition-all cursor-default">
                            <span className="font-black text-[10px] uppercase tracking-widest">{c6.code}</span>
                            <span className="text-sm font-black text-slate-400">{c6.count}</span>
                        </div>
                    )}
                    <div className="bg-slate-100 rounded-[18px] p-3 flex items-center justify-center text-slate-500 hover:bg-white transition-all cursor-default">
                        <span className="font-black text-[10px] uppercase tracking-widest">{othersLabel}</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-50 flex items-center gap-3">
                <span className="px-5 py-2.5 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100/50 shadow-sm">
                    Toplam: {stats.total}
                </span>
                <span className="flex-1"></span>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 font-bold flex items-center gap-2 group">
                    Tüm Dağılım Map
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

export default CourseRepeatAnalysis;

