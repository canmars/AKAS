import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const RiskyStudentsTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.get('/dashboard/risky-students');
                setStudents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching risky students:", error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const displayedStudents = students.slice(0, 5);
    const criticalCount = students.filter(s => (100 - Math.round(parseFloat(s.gno || 0) * 20)) > 70).length;

    if (loading) return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
            <span className="text-slate-400 font-medium animate-pulse">Yükleniyor...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Müdahale Gerekli Öğrenciler</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Akademik takvimin gerisinde kalanlar</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
                        Kritik: {criticalCount}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Öğrenci Profili</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Program/Aşama</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Skoru</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayedStudents.map((student, index) => {
                            const gno = parseFloat(student.gno || 0);
                            const score = Math.max(0, 100 - Math.round(gno * 20));
                            const isCritical = score > 70;
                            const initials = ((student.ad?.charAt(0) || '') + (student.soyad?.charAt(0) || '')).toUpperCase();

                            return (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold ring-2 ring-white">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {student.ad} {student.soyad}
                                                </p>
                                                <p className="text-xs text-slate-500">#{student.ogrenci_no || '2023001'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-700">{student.program_adi || 'Bilinmiyor'}</p>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 mt-1">
                                            GNO: {student.gno}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                                {score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline">
                                            İncele
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                <a href="/students" className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    Tüm Listeyi Gör
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </a>
            </div>
        </div>
    );
};

export default RiskyStudentsTable;

