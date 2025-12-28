import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { SkeletonListItem } from '../../common/SkeletonLoader';
import EmptyState from '../../common/EmptyState';

const RiskyStudentsModal = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.get('/dashboard/details/risky-students');
                setStudents(data || []);
            } catch (error) {
                console.error('Error fetching risky students:', error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const getRiskBadgeColor = (riskSeviyesi) => {
        switch (riskSeviyesi) {
            case 'Kritik':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Yuksek':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Orta':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonListItem key={i} />
                ))}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <EmptyState
                icon="🎉"
                title="Harika! Şu an riskli öğrenci yok"
                description="Tüm öğrenciler güvenli risk seviyesinde."
            />
        );
    }

    return (
        <div className="space-y-4">
            {selectedStudent ? (
                // Öğrenci Detay Kartı
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="mb-4 text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                    >
                        ← Geri Dön
                    </button>
                    <div className="flex items-start gap-4">
                        <img
                            src={selectedStudent.avatar_url || `https://ui-avatars.com/api/?name=${selectedStudent.ad_soyad}&background=indigo&color=fff`}
                            alt={selectedStudent.ad_soyad}
                            className="w-16 h-16 rounded-full border-2 border-slate-200"
                        />
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-900 mb-2">{selectedStudent.ad_soyad}</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Öğrenci No</p>
                                    <p className="text-sm font-semibold text-slate-800">{selectedStudent.ogrenci_no}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">GNO</p>
                                    <p className="text-sm font-semibold text-slate-800">{selectedStudent.gno?.toFixed(2) || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Risk Skoru</p>
                                    <p className="text-sm font-bold text-red-600">{selectedStudent.risk_skoru}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Program</p>
                                    <p className="text-sm font-semibold text-slate-800">{selectedStudent.program_adi || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Risk Faktörleri</p>
                                <div className="space-y-1">
                                    {selectedStudent.risk_faktorleri && Array.isArray(selectedStudent.risk_faktorleri) ? (
                                        selectedStudent.risk_faktorleri.map((faktor, idx) => (
                                            <div key={idx} className="text-sm text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200">
                                                • {faktor}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">Risk faktörü bilgisi bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Öğrenci Listesi
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {students.map((student) => (
                        <div
                            key={student.ogrenci_id}
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                        >
                            <img
                                src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.ad_soyad}&background=indigo&color=fff`}
                                alt={student.ad_soyad}
                                className="w-12 h-12 rounded-full border-2 border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{student.ad_soyad}</h4>
                                <p className="text-xs text-slate-500">{student.ogrenci_no} • {student.program_adi}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(student.risk_seviyesi)}`}>
                                    {student.risk_seviyesi}
                                </span>
                                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                                    İncele →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiskyStudentsModal;

