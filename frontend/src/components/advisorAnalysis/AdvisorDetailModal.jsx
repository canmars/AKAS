import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, GraduationCap, BookOpen, Users, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AdvisorDetailModal = ({ advisor, isOpen, onClose }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen && advisor?.personel_id) {
            fetchAdvisorStudents();
        }
    }, [isOpen, advisor]);

    const fetchAdvisorStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/advisors/${advisor.personel_id}/students`);
            setStudents(response || []);
        } catch (error) {
            console.error('Error fetching advisor students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !advisor) return null;

    const getAvatar = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getLoadColor = (percentage) => {
        if (percentage >= 90) return 'text-red-600 bg-red-50';
        if (percentage >= 70) return 'text-blue-600 bg-blue-50';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const tezliStudents = students.filter(s => s.program_tipi === 'Tezli' || !s.program_tipi?.includes('Tezsiz'));
    const tezsizStudents = students.filter(s => s.program_tipi?.includes('Tezsiz'));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
                            {getAvatar(advisor.ad_soyad)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{advisor.ad_soyad}</h2>
                            <p className="text-blue-100">{advisor.unvan}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6">
                    <div className="flex gap-4">
                        {[
                            { id: 'overview', label: 'Genel Bakış', icon: User },
                            { id: 'students', label: 'Öğrenciler', icon: GraduationCap },
                            { id: 'expertise', label: 'Uzmanlık Alanları', icon: BookOpen }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-gray-600">Toplam Öğrenci</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <GraduationCap className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm text-gray-600">Tezli</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{tezliStudents.length}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-gray-600">Tezsiz</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{tezsizStudents.length}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                        <span className="text-sm text-gray-600">Doluluk</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${getLoadColor(advisor.doluluk_yuzdesi)}`}>
                                        %{advisor.doluluk_yuzdesi?.toFixed(0) || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Load Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Yük Bilgileri</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Tezli Yükü</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {advisor.mevcut_yuk_tezli || 0} / {advisor.kota_tezli || 0}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(((advisor.mevcut_yuk_tezli || 0) / (advisor.kota_tezli || 1)) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Tezsiz Yükü</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {advisor.mevcut_yuk_tezsiz || 0} / {advisor.kota_tezsiz || 0}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-400 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(((advisor.mevcut_yuk_tezsiz || 0) / (advisor.kota_tezsiz || 1)) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Bu danışmana atanmış öğrenci bulunmamaktadır.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {students.map((student, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {student.ad_soyad?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{student.ad_soyad}</div>
                                                        <div className="text-sm text-gray-600">{student.ogrenci_no}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">Program</div>
                                                        <div className="font-medium text-gray-900">{student.program_adi || 'Bilinmiyor'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">GNO</div>
                                                        <div className="font-medium text-gray-900">{student.gno?.toFixed(2) || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'expertise' && (
                        <div className="space-y-4">
                            {advisor.uzmanlik_alanlari?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {advisor.uzmanlik_alanlari.map((uzmanlik, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-900">{uzmanlik}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Uzmanlık alanı bilgisi bulunmamaktadır.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvisorDetailModal;

