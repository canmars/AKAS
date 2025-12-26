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

    if (loading) return <div className="kds-card p-20 text-center animate-pulse text-gray-400 font-bold">Risk Analizi Yapılıyor...</div>;

    return (
        <div className="kds-card flex flex-col h-full overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex justify-between items-end bg-gray-50/10">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Müdahale Gerekli Öğrenciler</h3>
                    <p className="text-gray-400 font-medium mt-1">Akademik takvimin gerisinde kalanlar</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-red-50 text-red-500 text-[10px] font-black px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest">Kritik: {students.filter(s => (100 - Math.round(parseFloat(s.gno || 0) * 20)) > 70).length}</span>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left">
                    <thead className="bg-[#fbfcfd] border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-10 py-6">ÖĞRENCİ PROFİLİ</th>
                            <th className="px-10 py-6">PROGRAM/AŞAMA</th>
                            <th className="px-10 py-6">RİSK SKORU</th>
                            <th className="px-10 py-6">AKSİYON</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayedStudents.map((student, index) => {
                            const gno = parseFloat(student.gno || 0);
                            const score = Math.max(0, 100 - Math.round(gno * 20));
                            const isCritical = score > 70;

                            const initials = ((student.ad?.charAt(0) || '') + (student.soyad?.charAt(0) || '')).toUpperCase();

                            return (
                                <tr key={index} className="hover:bg-blue-50/20 transition-all cursor-pointer group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-500 font-black text-lg shadow-sm transform group-hover:scale-110 transition-transform">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                    {student.ad} {student.soyad}
                                                </p>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">#{student.ogrenci_no || '2023001'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-black text-gray-700 uppercase tracking-tight">{student.program_adi || 'Bilinmiyor'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">GNO: {student.gno}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-base font-black ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                                                {score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCritical ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                                            Müdahale Et
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-8 border-t border-gray-50 bg-gray-50/20 text-center">
                <a href="/students" className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center justify-center gap-2 group">
                    Kritik Listeyi Analiz Et
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </a>
            </div>
        </div>
    );
};

export default RiskyStudentsTable;

