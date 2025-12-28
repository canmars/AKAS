import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { SkeletonListItem } from '../../common/SkeletonLoader';
import EmptyState from '../../common/EmptyState';

const AdvisorWorkloadModal = ({ advisorId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'ders', 'tez'

    useEffect(() => {
        const fetchStudents = async () => {
            if (!advisorId) return;
            try {
                const data = await api.get(`/dashboard/details/advisor/${advisorId}`);
                setStudents(data || []);
            } catch (error) {
                console.error('Error fetching advisor students:', error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [advisorId]);

    const filteredStudents = students.filter(student => {
        if (activeTab === 'ders') return student.asama === 'Ders Aşamasında';
        if (activeTab === 'tez') return student.asama === 'Tez Aşamasında';
        return true;
    });

    const dersCount = students.filter(s => s.asama === 'Ders Aşamasında').length;
    const tezCount = students.filter(s => s.asama === 'Tez Aşamasında').length;

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
                icon="👥"
                title="Öğrenci bulunamadı"
                description="Bu danışmana atanmış aktif öğrenci bulunmuyor."
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'all'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Tümü ({students.length})
                </button>
                <button
                    onClick={() => setActiveTab('ders')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'ders'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Ders Aşaması ({dersCount})
                </button>
                <button
                    onClick={() => setActiveTab('tez')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'tez'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Tez Aşaması ({tezCount})
                </button>
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredStudents.map((student) => (
                    <div
                        key={student.ogrenci_id}
                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                student.asama === 'Tez Aşamasında'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}>
                                {student.asama}
                            </span>
                            <span className="text-xs text-slate-500">{student.program_turu}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdvisorWorkloadModal;

