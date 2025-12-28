import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SkeletonListItem } from '../common/SkeletonLoader';
import { Eye, Mail, AlertTriangle, GraduationCap, Users } from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

const StatsDetailModal = ({ type, isOpen, onClose }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const getEndpoint = () => {
        switch (type) {
            case 'all':
                return '/students/stats/all';
            case 'thesis':
            case 'thesis-stage':
                return '/students/stats/thesis';
            case 'monitoring':
                return '/students/stats/monitoring';
            case 'high-risk':
                return '/students/stats/high-risk';
            case 'advisor-waiting':
                return '/students/stats/advisor-waiting';
            default:
                return '/students/stats/all';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'all':
                return 'Tüm Öğrenciler';
            case 'thesis':
            case 'thesis-stage':
                return 'Tez Aşamasındaki Öğrenciler';
            case 'monitoring':
                return 'İzlenmesi Gereken Öğrenciler';
            case 'high-risk':
                return 'Yüksek Riskli Öğrenciler';
            case 'advisor-waiting':
                return 'Danışman Bekleyen Öğrenciler';
            default:
                return 'Öğrenci Listesi';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'all':
                return Users;
            case 'thesis':
            case 'thesis-stage':
                return GraduationCap;
            case 'monitoring':
                return Eye;
            case 'high-risk':
                return AlertTriangle;
            case 'advisor-waiting':
                return Users;
            default:
                return Users;
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen, pagination]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(getEndpoint(), {
                params: {
                    page: pagination.page,
                    limit: pagination.limit
                }
            });
            setStudents(response.data || []);
            setTotalPages(response.meta?.totalPages || 0);
            setTotalRecords(response.meta?.total || 0);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/details`);
            setSelectedStudent(response);
            setIsStudentModalOpen(true);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Öğrenci detayları yüklenirken bir hata oluştu.');
        }
    };

    const getRiskBadge = (riskSeviye) => {
        const riskMap = {
            'Kritik': { label: 'Yüksek Risk', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
            'Yuksek': { label: 'Yüksek Risk', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
            'Orta': { label: 'İzlenmeli', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
            'Dusuk': { label: 'Normal', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
        };
        return riskMap[riskSeviye] || riskMap['Dusuk'];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getAvatar = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (!isOpen) return null;

    const Icon = getIcon();

    return (
        <>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{getTitle()}</h3>
                        <p className="text-sm text-gray-500">Toplam {totalRecords} öğrenci</p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <SkeletonListItem key={i} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && students.length === 0 && (
                    <div className="text-center py-12">
                        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Bu kategoride öğrenci bulunamadı.</p>
                    </div>
                )}

                {/* Student List */}
                {!loading && students.length > 0 && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {students.map((student) => {
                            const badge = getRiskBadge(student.risk_seviyesi);
                            return (
                                <div
                                    key={student.ogrenci_id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {getAvatar(student.ad_soyad)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {student.ad_soyad}
                                                    </h4>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium">Öğrenci No:</span> {student.ogrenci_no}</p>
                                                    <p><span className="font-medium">Program:</span> {student.program_adi}</p>
                                                    {student.guncel_asama && (
                                                        <p><span className="font-medium">Aşama:</span> {student.guncel_asama}</p>
                                                    )}
                                                    <p><span className="font-medium">GNO:</span> {student.gno?.toFixed(2) || '0.00'}</p>
                                                    {student.danisman_adi && (
                                                        <p><span className="font-medium">Danışman:</span> {student.danisman_adi}</p>
                                                    )}
                                                    {student.acil_aksiyon && (
                                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                                            <span className="font-medium">Acil Aksiyon:</span> {student.acil_aksiyon}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleViewDetails(student.ogrenci_id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Detayları Görüntüle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading && students.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Sayfa {pagination.page} / {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Önceki
                            </button>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page >= totalPages}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Detail Modal */}
            {isStudentModalOpen && selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    isOpen={isStudentModalOpen}
                    onClose={() => {
                        setIsStudentModalOpen(false);
                        setSelectedStudent(null);
                    }}
                />
            )}
        </>
    );
};

export default StatsDetailModal;

