import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';

const ProgramDistributionModal = ({ isOpen, onClose, programType }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        if (isOpen && programType) {
            fetchStudents();
        }
    }, [isOpen, programType, pagination.page]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/students/program-distribution/${encodeURIComponent(programType)}`, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit
                }
            });
            
            setStudents(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.meta?.total || 0,
                totalPages: response.meta?.totalPages || 0
            }));
        } catch (err) {
            console.error('Error fetching program distribution detail:', err);
            setError('Öğrenci verileri yüklenirken bir hata oluştu.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {programType} Programı - Öğrenci Listesi
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <p className="text-red-800">{error}</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">Öğrenci bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Öğrenci No</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aşama</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GNO</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.map((student) => {
                                        const badge = getRiskBadge(student.risk_seviyesi);
                                        return (
                                            <tr key={student.ogrenci_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.ogrenci_no}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.ad_soyad}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.program_adi}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.guncel_asama}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{student.gno?.toFixed(2) || '0.00'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                        <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && !error && students.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Toplam <span className="font-medium">{pagination.total}</span> kayıttan{' '}
                            <span className="font-medium">
                                {(pagination.page - 1) * pagination.limit + 1}
                            </span>
                            -{' '}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            arası gösteriliyor
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page < 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                                pagination.page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramDistributionModal;

