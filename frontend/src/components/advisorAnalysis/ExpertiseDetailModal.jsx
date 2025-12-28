import React from 'react';
import { X, Users, BookOpen } from 'lucide-react';

const ExpertiseDetailModal = ({ expertiseData, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-white" />
                        <h2 className="text-2xl font-bold text-white">Uzmanlık Dağılımı Detayları</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {expertiseData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Uzmanlık alanı bilgisi bulunmamaktadır.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expertiseData.map((expertise, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{expertise.uzmanlik_alani}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">{expertise.danisman_sayisi} Danışman</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danışman Listesi */}
                                    {expertise.danisman_listesi && expertise.danisman_listesi.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Danışmanlar:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {expertise.danisman_listesi.map((danisman, idx) => (
                                                    <div key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
                                                        {danisman.ad_soyad}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpertiseDetailModal;

