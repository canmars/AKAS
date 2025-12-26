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

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 h-full flex items-center justify-center">
            <span className="text-slate-400 font-medium animate-pulse">Analiz Hazırlanıyor...</span>
        </div>
    );

    const c1 = getCourse(0) || { code: 'N/A', count: 0 };
    const c2 = getCourse(1) || { code: '-', count: 0 };
    const c3 = getCourse(2) || { code: '-', count: 0 };
    const c4 = getCourse(3) || { code: '-', count: 0 };
    const c5 = getCourse(4) || { code: '-', count: 0 };
    const c6 = getCourse(5);

    const othersCount = courses.slice(6).reduce((acc, curr) => acc + (curr.ogrenci_sayisi || 0), 0);
    const othersLabel = courses.length > 6 ? `${courses.length - 6} Diğer` : 'Diğer';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Ders Yoğunluk Analizi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Öğrenci Başına Tekrar Dağılımı</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-3 min-h-[300px]">
                {/* 1. Primary Focus */}
                <div className="col-span-2 row-span-2 bg-indigo-600 rounded-xl p-5 flex flex-col justify-between text-white hover:bg-indigo-700 transition-colors shadow-sm relative overflow-hidden group">
                    <span className="font-semibold text-xs opacity-80 z-10 uppercase tracking-wide">{c1.code}</span>
                    <span className="text-4xl font-bold z-10">{c1.count}</span>
                    <div className="absolute -bottom-4 -right-4 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                    </div>
                </div>

                <div className="col-span-2 row-span-1 bg-indigo-500 rounded-xl p-4 flex flex-col justify-between text-white hover:bg-indigo-600 transition-colors shadow-sm">
                    <span className="font-semibold text-xs opacity-80 uppercase tracking-wide">{c2.code}</span>
                    <span className="text-2xl font-bold">{c2.count}</span>
                </div>

                <div className="col-span-2 row-span-1 bg-indigo-400 rounded-xl p-4 flex flex-col justify-between text-white hover:bg-indigo-500 transition-colors shadow-sm">
                    <span className="font-semibold text-xs opacity-80 uppercase tracking-wide">{c3.code}</span>
                    <span className="text-2xl font-bold">{c3.count}</span>
                </div>

                <div className="col-span-1 row-span-1 bg-slate-400 rounded-lg p-3 flex flex-col justify-between text-white">
                    <span className="font-medium text-[10px] opacity-90 uppercase">{c4.code}</span>
                    <span className="text-lg font-bold">{c4.count}</span>
                </div>

                <div className="col-span-1 row-span-1 bg-slate-300 rounded-lg p-3 flex flex-col justify-between text-slate-800">
                    <span className="font-medium text-[10px] opacity-70 uppercase">{c5.code}</span>
                    <span className="text-lg font-bold">{c5.count}</span>
                </div>

                <div className="col-span-2 row-span-1 grid grid-cols-2 gap-2">
                    {c6 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between text-slate-600">
                            <span className="font-semibold text-[10px] uppercase">{c6.code}</span>
                            <span className="text-sm font-bold text-slate-800">{c6.count}</span>
                        </div>
                    )}
                    <div className="bg-slate-100/50 border border-slate-100 rounded-lg p-3 flex items-center justify-center text-slate-400">
                        <span className="font-medium text-[10px] uppercase text-center">{othersLabel}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600">
                    Toplam: {stats.total}
                </span>
                <span className="flex-1"></span>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                    Tüm Dağılım
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

export default CourseRepeatAnalysis;

