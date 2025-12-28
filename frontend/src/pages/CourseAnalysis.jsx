import React, { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend
} from 'chart.js';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import api from '../services/api';
import {
    BookOpen,
    AlertTriangle,
    Users,
    GraduationCap,
    ChevronDown,
    Filter,
    Download,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import InfoTooltip from '../components/common/InfoTooltip';
import DetailModal from '../components/common/DetailModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend
);

const CourseAnalysis = () => {
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedTerm, setSelectedTerm] = useState('Guz');

    // Modal State
    const [isIdOpen, setIsIdOpen] = useState(false);
    const [selectedCourseCode, setSelectedCourseCode] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const chartRef = useRef();

    useEffect(() => {
        fetchAnalytics();
    }, [selectedYear, selectedTerm]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses/analysis', {
                params: { yil: selectedYear, donem: selectedTerm }
            });
            if (response.success) {
                setAnalyticsData(response.data);
            }
        } catch (error) {
            console.error('Error fetching course analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseStudents = async (courseCode) => {
        try {
            setModalLoading(true);
            const response = await api.get('/courses/students', {
                params: {
                    ders_kodu: courseCode,
                    yil: selectedYear,
                    donem: selectedTerm
                }
            });
            if (response.success) {
                setCourseStudents(response.data);
            }
        } catch (error) {
            console.error('Error fetching course students:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleChartClick = (event) => {
        const { current: chart } = chartRef;
        if (!chart) return;

        const element = getElementAtEvent(chart, event);
        if (element.length > 0) {
            const index = element[0].index;
            const courseCode = distributionChartData.labels[index];
            setSelectedCourseCode(courseCode);
            setIsIdOpen(true);
            fetchCourseStudents(courseCode);
        }
    };

    if (loading && !analyticsData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { kpis, distribution, repeated, details } = analyticsData || {};

    // Chart Data
    const distributionChartData = {
        labels: distribution?.map(d => d.ders_kodu) || [],
        datasets: [
            {
                label: 'AA-BB',
                data: distribution?.map(d => d.aa_bb_sayi) || [],
                backgroundColor: '#10b981',
                borderRadius: 4,
            },
            {
                label: 'CC-DD',
                data: distribution?.map(d => d.cc_dd_sayi) || [],
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
            {
                label: 'FF',
                data: distribution?.map(d => d.ff_sayi) || [],
                backgroundColor: '#ef4444',
                borderRadius: 4,
            }
        ]
    };

    const distributionOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleChartClick,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: '600' },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 14, weight: '700' },
                bodyFont: { size: 13 },
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { weight: '600' } }
            },
            y: {
                stacked: true,
                grid: { color: '#f1f5f9' },
                beginAtZero: true
            }
        }
    };

    const filteredStudents = courseStudents.filter(s =>
        s.ad_soyad.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ogrenci_no.includes(searchQuery)
    );

    return (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Ders Analizi</h1>
                    <p className="text-gray-500 font-medium text-lg">Bölüm derslerinin başarı oranları, not dağılımları ve tekrar istatistikleri.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={`${selectedYear}-${selectedTerm}`}
                            onChange={(e) => {
                                const [y, t] = e.target.value.split('-');
                                setSelectedYear(y);
                                setSelectedTerm(t);
                            }}
                            className="appearance-none bg-white border border-gray-200 px-6 py-3 pr-12 rounded-2xl font-bold text-gray-700 shadow-sm hover:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer outline-none"
                        >
                            <option value="2024-Guz">2024-2025 Güz</option>
                            <option value="2024-Bahar">2023-2024 Bahar</option> {/* Adjusted based on user report */}
                            <option value="2023-Bahar">Önceki Bahar (2023)</option>
                            <option value="2023-Guz">2023-2024 Güz</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* KPI cards remain similar but with property fixes */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Genel Başarı Ort.</h3>
                                <InfoTooltip title="Genel Başarı Ortalaması" content={[{ type: 'paragraph', text: 'Tüm dönem derslerinin ağırlıklı başarı ortalaması.' }]} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">{kpis?.genel_basari_ortalamasi || '0.00'}</span>
                                <span className="text-gray-400 font-bold">/ 4.00</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${kpis?.gbo_artis >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpis?.gbo_artis >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>%{Math.abs(kpis?.gbo_artis || 0)}</span>
                        <span className="text-gray-400 ml-1">geçen döneme göre</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Başarısızlık Oranı</h3>
                                <InfoTooltip title="Genel Başarısızlık Oranı" content={[{ type: 'paragraph', text: 'FF alan öğrencilerin toplam öğrenci sayısına oranı.' }]} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">%{kpis?.genel_basarisizlik_orani || '0'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${kpis?.gbo_iyilesme <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpis?.gbo_iyilesme <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        <span>%{Math.abs(kpis?.gbo_iyilesme || 0)}</span>
                        <span className="text-gray-400 ml-1">iyileşme</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Riskli Ders Sayısı</h3>
                                <InfoTooltip title="Riskli Ders Sayısı" content={[{ type: 'paragraph', text: 'Ortalaması düşük veya başarısızlık oranı yüksek derslerin toplamı.' }]} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">{kpis?.riskli_ders_sayisi || '0'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${kpis?.rds_artis <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpis?.rds_artis <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        <span>+{Math.abs(kpis?.rds_artis || 0)}</span>
                        <span className="text-gray-400 ml-1">ders eklendi</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Toplam Öğrenci</h3>
                                <InfoTooltip title="Toplam Öğrenci" content={[{ type: 'paragraph', text: 'Dönem içerisinde aktif ders alan toplam öğrenci sayısı.' }]} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">{kpis?.toplam_ogrenci || '0'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-400">
                        <Minus size={16} />
                        <span>Değişim yok</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[450px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Ders Bazlı Not Dağılımı</h3>
                        <p className="text-sm text-gray-500 font-medium">Grafiğe tıklayarak ders detaylarını görebilirsiniz</p>
                    </div>
                    <div className="flex-1 min-h-0 cursor-pointer">
                        <Bar ref={chartRef} data={distributionChartData} options={distributionOptions} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">En Çok Tekrar Edilenler</h3>
                        <p className="text-sm text-gray-500 font-medium">Dersi alttan alan öğrenci sayısı</p>
                    </div>
                    <div className="space-y-6 overflow-y-auto">
                        {repeated?.map((course, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-gray-700 tracking-tight">{course.ders_kodu}</span>
                                    <span className="text-gray-900">{course.tekrar_sayisi}</span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(course.tekrar_sayisi / Math.max(...repeated.map(r => r.tekrar_sayisi))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Success Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="text-xl font-bold text-gray-900">Ders Başarı Detayları</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Ders Kodu</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Ders Adı</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Öğrenci Sayısı</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Ortalama</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Başarı Oranı</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {details?.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => {
                                    setSelectedCourseCode(item.ders_kodu);
                                    setIsIdOpen(true);
                                    fetchCourseStudents(item.ders_kodu);
                                }}>
                                    <td className="px-8 py-5 font-bold text-gray-900">{item.ders_kodu}</td>
                                    <td className="px-8 py-5 font-semibold text-gray-600">{item.ders_adi}</td>
                                    <td className="px-8 py-5 text-center font-bold text-gray-700">{item.ogrenci_sayisi}</td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-1.5 font-bold text-gray-900">
                                            <span>{item.ortalama}</span>
                                            <span className="text-gray-300 text-xs">/ 4.00</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 min-w-[200px]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.basari_orani < 50 ? 'bg-red-500' :
                                                        item.basari_orani < 70 ? 'bg-orange-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${item.basari_orani}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">% {item.basari_orani}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${item.durum === 'Kritik' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            item.durum === 'İzlemede' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                item.durum === 'Başarılı' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {item.durum}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <DetailModal
                isOpen={isIdOpen}
                onClose={() => setIsIdOpen(false)}
                title={`${selectedCourseCode} Dersi Öğrenci Listesi`}
                maxWidth="max-w-5xl"
            >
                <div className="space-y-6">
                    {/* Modal Tools */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Öğrenci adı veya numarasında ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {modalLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Öğrenci No</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ad Soyad</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Vize</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Final</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Not</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredStudents.map((student, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-500 text-sm">{student.ogrenci_no}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{student.ad_soyad}</td>
                                            <td className="px-6 py-4 text-center font-bold">{student.vize_notu || '-'}</td>
                                            <td className="px-6 py-4 text-center font-bold">{student.final_notu || student.butunleme_notu || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-black text-sm ${student.not_kodu === 'FF' ? 'text-red-500' : 'text-blue-600'}`}>
                                                    {student.not_kodu}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${student.basarili_mi ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {student.basarili_mi ? 'GEÇTİ' : 'KALDI'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-400 font-bold">Öğrenci bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DetailModal>
        </main>
    );
};

export default CourseAnalysis;
