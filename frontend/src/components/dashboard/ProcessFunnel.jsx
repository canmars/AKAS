import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FunnelStep = ({ label, value, percentage, isLast, onClick }) => {
    // 0 olan aşamaları gösterme
    if (value === 0) return null;

    // Genişlik hesaplama (100'den başlayıp her aşamada %10 azalıyor)
    const baseWidth = 100 - (percentage * 10);
    const width = Math.max(baseWidth, 40); // Minimum %40

    return (
        <div
            className="flex justify-center cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
            onClick={onClick}
        >
            <div
                className={`
                    relative px-6 py-3.5 rounded-lg transition-all duration-300
                    ${isLast
                        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }
                    flex items-center justify-between
                    group-hover:shadow-lg
                `}
                style={{ width: `${width}%` }}
            >
                <span className="font-semibold text-sm" style={{ fontWeight: 600 }}>
                    {label}
                </span>
                <span className="font-bold text-base ml-4" style={{ fontWeight: 700 }}>
                    {value}
                </span>
            </div>
        </div>
    );
};

const StudentListModal = ({ isOpen, onClose, students, stageName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-blue-500 text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold" style={{ fontWeight: 700 }}>
                            {stageName}
                        </h3>
                        <p className="text-sm text-blue-100 font-normal" style={{ fontWeight: 400 }}>
                            {students.length} öğrenci
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-600 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Student List */}
                <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
                    {students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Bu aşamada öğrenci bulunmamaktadır.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        Öğrenci No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        Ad Soyad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        Danışman
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        Yarıyıl
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase" style={{ fontWeight: 600 }}>
                                        GNO
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900" style={{ fontWeight: 500 }}>
                                            {student.ogrenci_no}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900" style={{ fontWeight: 400 }}>
                                            {student.ad_soyad}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600" style={{ fontWeight: 400 }}>
                                            {student.program_adi}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600" style={{ fontWeight: 400 }}>
                                            {student.danisman_adi || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-blue-600" style={{ fontWeight: 600 }}>
                                            {student.mevcut_yariyil || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900" style={{ fontWeight: 600 }}>
                                            {student.gno ? parseFloat(student.gno).toFixed(2) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProcessFunnel = () => {
    const [funnelData, setFunnelData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conversionRate, setConversionRate] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedStage, setSelectedStage] = useState('');

    useEffect(() => {
        const fetchFunnel = async () => {
            try {
                const data = await api.get('/dashboard/funnel');

                // Veriyi işle
                const processedData = data.map((item, index) => ({
                    label: item.label,
                    value: parseInt(item.value) || 0,
                    stageCode: item.stage_code || item.label, // Backend'den gelen stage kodu
                    percentage: index,
                    isLast: index === data.length - 1
                }));

                // Dönüşüm oranını hesapla (ilk ve son aşama)
                if (processedData.length > 0) {
                    const first = processedData[0].value;
                    const last = processedData[processedData.length - 1].value;
                    const rate = first > 0 ? Math.round((last / first) * 100) : 0;
                    setConversionRate(rate);
                }

                setFunnelData(processedData);
            } catch (error) {
                console.error("Error fetching funnel:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFunnel();
    }, []);

    const handleStepClick = async (step) => {
        try {
            setSelectedStage(step.label);
            // Backend'den o aşamadaki öğrencileri çek
            const students = await api.get(`/dashboard/funnel/students?stage=${encodeURIComponent(step.stageCode)}`);
            setSelectedStudents(students);
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Öğrenci listesi yüklenirken bir hata oluştu.');
        }
    };

    if (loading) {
        return (
            <div className="ads-card p-6 h-full animate-pulse">
                <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
                <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg" style={{ width: `${100 - (i * 10)}%`, margin: '0 auto' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="ads-card p-6 h-full">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                        Akademik Huni
                    </h2>
                    <p className="text-sm text-gray-600 font-normal" style={{ fontWeight: 400 }}>
                        Öğrenci başarı akışı
                    </p>
                </div>

                {/* Funnel Steps */}
                <div className="space-y-3 mb-6">
                    {funnelData.map((step, index) => (
                        <FunnelStep
                            key={index}
                            {...step}
                            onClick={() => handleStepClick(step)}
                        />
                    ))}
                </div>

                {/* Conversion Rate */}
                {conversionRate > 0 && (
                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 font-normal" style={{ fontWeight: 400 }}>
                            Dönüşüm Oranı: <span className="font-bold text-blue-600" style={{ fontWeight: 700 }}>{conversionRate}%</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Student List Modal */}
            <StudentListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                students={selectedStudents}
                stageName={selectedStage}
            />
        </>
    );
};

export default ProcessFunnel;
