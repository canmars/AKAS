import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';
import { SkeletonCard } from '../../common/SkeletonLoader';
import EmptyState from '../../common/EmptyState';

const CourseFailureModal = ({ courseCode }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseCode) return;
            try {
                const result = await api.get(`/dashboard/details/course/${courseCode}`);
                setData(result);
            } catch (error) {
                console.error('Error fetching course failure report:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseCode]);

    if (loading) {
        return <SkeletonCard />;
    }

    if (!data || !data.ders_bilgisi) {
        return (
            <EmptyState
                icon="📚"
                title="Ders bilgisi bulunamadı"
                description="Bu ders için veri bulunmuyor."
            />
        );
    }

    const { ders_bilgisi, ogrenci_listesi, not_dagilimi } = data;

    return (
        <div className="space-y-6">
            {/* Ders Bilgileri */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-4">{ders_bilgisi.ders_kodu} - {ders_bilgisi.ders_adi}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Öğretim Üyesi</p>
                        <p className="text-sm font-semibold text-slate-800">{ders_bilgisi.ogretim_uyesi}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Toplam Kayıt</p>
                        <p className="text-sm font-bold text-slate-900">{ders_bilgisi.toplam_kayit}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Başarısızlık Oranı</p>
                        <p className="text-sm font-bold text-red-600">%{ders_bilgisi.basarisizlik_orani}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Ortalama Not</p>
                        <p className="text-sm font-bold text-slate-900">{ders_bilgisi.ortalama_not}</p>
                    </div>
                </div>
            </div>

            {/* Not Dağılımı Grafiği */}
            {not_dagilimi && not_dagilimi.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h5 className="text-sm font-bold text-slate-800 mb-4">Not Dağılımı</h5>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={not_dagilimi}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="not_araligi" tick={{ fontSize: 11, fill: '#64748B' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                            <Tooltip />
                            <Bar dataKey="ogrenci_sayisi" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Öğrenci Listesi */}
            {ogrenci_listesi && ogrenci_listesi.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h5 className="text-sm font-bold text-slate-800">Öğrenci Listesi</h5>
                    </div>
                    <div className="max-h-[40vh] overflow-y-auto">
                        {ogrenci_listesi.map((student, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-b-0 ${
                                    !student.basarili_mi ? 'bg-red-50/50' : ''
                                }`}
                            >
                                <img
                                    src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.ad_soyad}&background=indigo&color=fff`}
                                    alt={student.ad_soyad}
                                    className="w-10 h-10 rounded-full border-2 border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{student.ad_soyad}</h4>
                                    <p className="text-xs text-slate-500">{student.ogrenci_no}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        student.basarili_mi
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {student.harf_notu || 'N/A'}
                                    </span>
                                    {student.tekrar_sayisi > 1 && (
                                        <span className="text-xs text-amber-600 font-semibold">
                                            {student.tekrar_sayisi}. Tekrar
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseFailureModal;

