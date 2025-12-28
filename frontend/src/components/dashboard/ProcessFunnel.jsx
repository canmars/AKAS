import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Info } from 'lucide-react';

const FunnelStep = ({ label, value, index, totalSteps, onClick }) => {
    // Width calculation: 100% down to shorter widths
    // Step 0: 100%, Step 1: 85%, Step 2: 70%, Step 3: 55%, Step 4: 40%
    const widthPercentage = 100 - (index * 15);
    const width = `${Math.max(widthPercentage, 40)}%`;

    // Colors roughly matching the design image (Lightest to Darkest Blue)
    const colors = [
        'bg-[#EBEFFF] text-slate-700 hover:bg-[#DCE4FF]', // Ders Aşaması
        'bg-[#D0D9FF] text-slate-800 hover:bg-[#C0CCFF]', // Yeterlik
        'bg-[#99ADFF] text-slate-900 hover:bg-[#889FFF]', // Tez Önerisi
        'bg-[#5C7CFA] text-white hover:bg-[#4C6EF5]',     // Tez İzleme
        'bg-[#254EDB] text-white hover:bg-[#1C3ED3]'      // Mezuniyet (Darkest)
    ];

    const bgClass = colors[index] || colors[colors.length - 1];
    const isDarkText = index < 3; // First 3 are light backgrounds

    return (
        <div className="relative flex flex-col items-center w-full">
            {/* Connector Line (except for the last item) */}
            {index < totalSteps - 1 && (
                <div className="absolute h-full w-px bg-slate-200 top-1/2 left-1/2 -translate-x-1/2 -z-10"
                    style={{ height: 'calc(100% + 12px)' }}></div>
            )}

            <div
                className={`
                    relative px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer
                    ${bgClass}
                    flex items-center justify-between
                    shadow-sm hover:shadow-md hover:scale-[1.01]
                    z-10
                `}
                style={{ width: width }}
                onClick={onClick}
            >
                <span className={`text-sm font-semibold truncate ${isDarkText ? 'text-slate-700' : 'text-blue-50'}`}>
                    {label}
                </span>
                <span className={`text-base font-bold ${isDarkText ? 'text-slate-900' : 'text-white'}`}>
                    {value}
                </span>
            </div>

            {/* Spacing between items */}
            <div className="h-3"></div>
        </div>
    );
};

const StudentListModal = ({ isOpen, onClose, students, stageName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {stageName}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                            {students.length} öğrenci listeleniyor
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Student List */}
                <div className="overflow-y-auto flex-1 p-0">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Info className="w-12 h-12 mb-3 opacity-20" />
                            <p>Bu aşamada öğrenci bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Öğrenci No</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danışman</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Yarıyıl</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">GNO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student, index) => (
                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{student.ogrenci_no}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700 font-medium">{student.ad_soyad}</td>
                                        <td className="px-6 py-3 text-sm text-gray-500">{student.program_adi}</td>
                                        <td className="px-6 py-3 text-sm text-gray-500">{student.danisman_adi || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-gray-900 font-semibold text-center bg-gray-50/30 rounded-lg">{student.mevcut_yariyil || '-'}</td>
                                        <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">{student.gno ? parseFloat(student.gno).toFixed(2) : '-'}</td>
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
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedStage, setSelectedStage] = useState('');

    useEffect(() => {
        const fetchFunnel = async () => {
            try {
                const data = await api.get('/dashboard/funnel');
                const processedData = data
                    .map((item) => ({
                        label: item.label,
                        value: parseInt(item.value) || 0,
                        stageCode: item.stage_code || item.label,
                    }))
                    .filter(item => item.value > 0);
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
            const students = await api.get(`/dashboard/funnel/students?stage=${encodeURIComponent(step.stageCode)}`);
            setSelectedStudents(students);
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center w-full space-y-4">
                    <div className="h-6 w-32 bg-slate-100 rounded mb-4 self-start" />
                    {[100, 80, 60, 40].map(w => (
                        <div key={w} className="h-12 bg-slate-100 rounded-xl" style={{ width: `${w}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <h2 className="text-lg font-bold text-slate-800">Akademik Huni</h2>
                    <Info className="w-5 h-5 text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-2">
                    {funnelData.map((step, index) => (
                        <FunnelStep
                            key={index}
                            {...step}
                            index={index}
                            totalSteps={funnelData.length}
                            onClick={() => handleStepClick(step)}
                        />
                    ))}
                </div>
            </div>

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
