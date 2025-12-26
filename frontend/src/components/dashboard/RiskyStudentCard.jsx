import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const RiskyStudentCard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRiskyStudents = async () => {
            try {
                const data = await api.get('/dashboard/risky-students');
                setStudents(data || []);
            } catch (err) {
                console.error('Error fetching risky students:', err);
                setError('Veri alınamadı');
            } finally {
                setLoading(false);
            }
        };

        fetchRiskyStudents();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex items-center justify-center">
                <span className="text-gray-500">Yükleniyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex items-center justify-center">
                <span className="text-red-500">{error}</span>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Riskli Öğrenci Analizi</h3>
                <span className="text-gray-500">Riskli öğrenci bulunamadı.</span>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Toplam Riskli Öğrenci</h3>
                <p className="text-3xl font-bold text-red-600 mt-1">{students.length}</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                    {students.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{student.ad} {student.soyad}</span>
                                <span className="text-xs text-gray-500 mt-0.5">{student.risk_nedeni || 'Nedeni Belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    GNO: {student.gno}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RiskyStudentCard;
