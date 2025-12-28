import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Mail, Users, GraduationCap, Eye as EyeIcon, AlertTriangle, ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import api from '../services/api';
import StudentDetailModal from '../components/studentAnalysis/StudentDetailModal';
import StatsDetailModal from '../components/studentAnalysis/StatsDetailModal';
import ProgramDistributionModal from '../components/studentAnalysis/ProgramDistributionModal';
import StageDistributionModal from '../components/studentAnalysis/StageDistributionModal';
import DetailModal from '../components/common/DetailModal';
import InfoTooltip from '../components/common/InfoTooltip';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StudentAnalysis = () => {
    // State Management
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stats Modal States
    const [statsModalType, setStatsModalType] = useState(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    // Stats State (V2 - Yeni KPI'lar)
    const [statsV2, setStatsV2] = useState({
        toplam_aktif_ogrenci: 0,
        toplam_aktif_ogrenci_artis: 0,
        tez_asamasinda_ogrenci: 0,
        danisman_bekleyen_ogrenci: 0,
        kritik_riskli_ogrenci: 0,
        kritik_riskli_artis: 0
    });

    // Eski stats (geriye dönük uyumluluk için)
    const [stats, setStats] = useState({
        toplam_ogrenci: 0,
        tez_asamasinda: 0,
        izlenmesi_gereken: 0,
        yuksek_riskli: 0,
        gecen_donem_artis: 0
    });

    // Grafik verileri
    const [programDistribution, setProgramDistribution] = useState([]);
    const [stageDistribution, setStageDistribution] = useState([]);

    // Modal state'leri
    const [programModalOpen, setProgramModalOpen] = useState(false);
    const [selectedProgramType, setSelectedProgramType] = useState(null);
    const [stageModalOpen, setStageModalOpen] = useState(false);
    const [selectedStageCode, setSelectedStageCode] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedRiskLevel, setSelectedRiskLevel] = useState('');

    // Options
    const [programs, setPrograms] = useState([]);
    const [stages, setStages] = useState([]);

    // Pagination
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    // Fetch Stats V2 (Yeni KPI'lar)
    const fetchStatsV2 = async () => {
        try {
            const response = await api.get('/students/stats/v2');
            setStatsV2(response);
            // Eski stats'e de set et (geriye dönük uyumluluk)
            setStats({
                toplam_ogrenci: response.toplam_aktif_ogrenci || 0,
                tez_asamasinda: 0,
                izlenmesi_gereken: 0,
                yuksek_riskli: response.kritik_riskli_ogrenci || 0,
                gecen_donem_artis: response.toplam_aktif_ogrenci_artis || 0
            });
        } catch (err) {
            console.error('Error fetching stats V2:', err);
        }
    };

    // Fetch Stats (Eski - geriye dönük uyumluluk için)
    const fetchStats = async () => {
        try {
            const response = await api.get('/students/stats');
            setStats(response);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Fetch Program Distribution
    const fetchProgramDistribution = async () => {
        try {
            const response = await api.get('/students/program-distribution');
            setProgramDistribution(response || []);
        } catch (err) {
            console.error('Error fetching program distribution:', err);
        }
    };

    // Fetch Stage Distribution
    const fetchStageDistribution = async () => {
        try {
            const response = await api.get('/students/stage-distribution');
            setStageDistribution(response || []);
        } catch (err) {
            console.error('Error fetching stage distribution:', err);
        }
    };

    // Fetch Programs
    const fetchPrograms = async () => {
        try {
            const response = await api.get('/students/programs');
            setPrograms(response);
        } catch (err) {
            console.error('Error fetching programs:', err);
        }
    };

    // Fetch Stages
    const fetchStages = async () => {
        try {
            const response = await api.get('/students/stages');
            setStages(response);
        } catch (err) {
            console.error('Error fetching stages:', err);
        }
    };

    // Fetch Students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedProgram && { program_id: selectedProgram }),
                ...(selectedStage && { stage: selectedStage }),
                ...(selectedRiskLevel && { risk_level: selectedRiskLevel }),
            };

            const response = await api.get('/students', { params });
            setStudents(response.data || []);
            setTotalPages(response.meta?.totalPages || 0);
            setTotalRecords(response.meta?.total || 0);
            setError(null);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Öğrenci verileri yüklenirken bir hata oluştu.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatsV2();
        fetchProgramDistribution();
        fetchStageDistribution();
        fetchPrograms();
        fetchStages();
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchStudents();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedProgram, selectedStage, selectedRiskLevel, pagination]);

    // Risk durumu etiketleri için yardımcı fonksiyon
    const getRiskBadge = (riskSeviye) => {
        const riskMap = {
            'Kritik': { label: 'Yüksek Risk', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
            'Yuksek': { label: 'Yüksek Risk', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
            'Orta': { label: 'İzlenmeli', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
            'Dusuk': { label: 'Normal', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
        };

        const risk = riskMap[riskSeviye] || riskMap['Dusuk'];
        return risk;
    };

    // Tarih formatı
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Avatar oluştur
    const getAvatar = (name) => {
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return initials;
    };

    // Table Columns Definition
    const columns = useMemo(
        () => [
            {
                accessorKey: 'ad_soyad',
                header: 'ÖĞRENCİ BİLGİSİ',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {getAvatar(row.original.ad_soyad)}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{row.original.ad_soyad}</div>
                            <div className="text-sm text-gray-500">{row.original.ogrenci_no}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'program',
                header: 'PROGRAM',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-700">{row.original.program}</span>
                ),
            },
            {
                accessorKey: 'guncel_asama',
                header: 'GÜNCEL AŞAMA',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-700">{row.original.guncel_asama || row.original.durum}</span>
                ),
            },
            {
                accessorKey: 'kayit_tarihi',
                header: 'KAYIT TARİHİ',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-700">{formatDate(row.original.kayit_tarihi)}</span>
                ),
            },
            {
                accessorKey: 'gno',
                header: 'GNO',
                cell: ({ row }) => {
                    const gno = row.original.gno || 0;
                    return (
                        <span className="font-semibold text-gray-900">{gno.toFixed(2)}</span>
                    );
                },
            },
            {
                accessorKey: 'risk_durumu',
                header: 'RİSK DURUMU',
                cell: ({ row }) => {
                    const riskSeviye = row.original.risk_durumu?.seviye || 'Dusuk';
                    const badge = getRiskBadge(riskSeviye);
                    return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: 'İŞLEMLER',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleMessage(row.original.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mesaj Gönder"
                        >
                            <Mail className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleViewDetails(row.original.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Detayları Görüntüle"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    // Table Instance
    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
    });

    // Handlers
    const handleViewDetails = async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/details`);
            setSelectedStudent(response);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching student details:', err);
            alert('Öğrenci detayları yüklenirken bir hata oluştu.');
        }
    };

    const handleMessage = (studentId) => {
        // TODO: Mesaj gönderme özelliği
        alert('Mesaj özelliği yakında eklenecek.');
    };

    // Tez aşaması progress hesaplama
    const tezProgress = stats.toplam_ogrenci > 0
        ? (stats.tez_asamasinda / stats.toplam_ogrenci) * 100
        : 0;

    // Handle stat card click
    const handleStatCardClick = (type) => {
        setStatsModalType(type);
        setIsStatsModalOpen(true);
    };

    // Info tooltip content
    const statCardInfo = {
        all: {
            title: 'Toplam Öğrenci',
            content: [
                {
                    type: 'paragraph',
                    text: 'Sistemde kayıtlı tüm aktif öğrencilerin toplam sayısını gösterir. Bu sayı, ders aşamasında, tez aşamasında ve diğer tüm aşamalardaki öğrencileri kapsar.'
                },
                {
                    type: 'list',
                    items: [
                        'Aktif öğrenciler: Sistemde aktif durumda olan tüm öğrenciler',
                        'Geçen dönem artışı: Bir önceki döneme göre öğrenci sayısındaki değişim',
                        'Detay görüntüleme: Karta tıklayarak tüm öğrencilerin detaylı listesini görebilirsiniz'
                    ]
                }
            ]
        },
        thesis: {
            title: 'Tez Aşamasında',
            content: [
                {
                    type: 'paragraph',
                    text: 'Derslerini tamamlamış ve tez yazım aşamasına geçmiş öğrencilerin sayısını gösterir. Bu öğrenciler tez önerisi, tez yazımı veya tez savunması aşamalarında olabilir.'
                },
                {
                    type: 'list',
                    items: [
                        'Ders tamamlama: Tüm derslerini başarıyla tamamlamış öğrenciler',
                        'Tez süreci: Tez önerisi, yazım veya savunma aşamalarındaki öğrenciler',
                        'Progress bar: Toplam öğrencilere göre tez aşamasındaki öğrencilerin oranı',
                        'Detay görüntüleme: Karta tıklayarak tez aşamasındaki öğrencilerin listesini görebilirsiniz'
                    ]
                }
            ]
        },
        monitoring: {
            title: 'İzlenmesi Gereken',
            content: [
                {
                    type: 'paragraph',
                    text: 'Orta veya yüksek risk seviyesindeki öğrencilerin sayısını gösterir. Bu öğrenciler akademik performanslarında düşüş göstermekte veya risk faktörleri taşımaktadır.'
                },
                {
                    type: 'list',
                    items: [
                        'Risk faktörleri: Düşük GNO, ders tekrarı, tez gecikmesi gibi durumlar',
                        'Not ortalaması düşüşü: GNO\'da sürekli düşüş gösteren öğrenciler',
                        'Düzenli takip: Bu öğrencilerin düzenli olarak izlenmesi ve desteklenmesi gerekir',
                        'Detay görüntüleme: Karta tıklayarak izlenmesi gereken öğrencilerin detaylı listesini görebilirsiniz'
                    ]
                }
            ]
        },
        'high-risk': {
            title: 'Yüksek Riskli',
            content: [
                {
                    type: 'paragraph',
                    text: 'Kritik veya yüksek risk seviyesindeki öğrencilerin sayısını gösterir. Bu öğrenciler için acil müdahale ve destek gerekebilir.'
                },
                {
                    type: 'list',
                    items: [
                        'Acil aksiyon: Bu öğrenciler için hızlı müdahale gerekir',
                        'Risk faktörleri: Çok düşük GNO, çoklu ders tekrarı, uzun süreli tez gecikmesi',
                        'Danışman görüşmesi: Danışman ile acil görüşme yapılması önerilir',
                        'Detay görüntüleme: Karta tıklayarak yüksek riskli öğrencilerin detaylı listesini ve acil aksiyon önerilerini görebilirsiniz'
                    ]
                }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Öğrenci Analizi</h1>
                <p className="text-gray-600 mt-1">Tüm öğrencilerin detaylı akademik takibi</p>
            </div>

            {/* Stats Cards V2 - Yeni KPI'lar (Dashboard Tasarımı) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Toplam Aktif Öğrenci */}
                <div
                    onClick={() => handleStatCardClick('all')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                >
                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="flex-1 overflow-visible">
                            <div className="flex items-center gap-2 relative z-50">
                                <h3 className="text-gray-500 text-sm font-semibold tracking-wide">Toplam Aktif Öğrenci</h3>
                                <InfoTooltip
                                    title="Toplam Aktif Öğrenci"
                                    content={[{
                                        type: 'paragraph',
                                        text: 'Sistemde kayıtlı tüm aktif öğrencilerin toplam sayısını gösterir.'
                                    }]}
                                    position="bottom"
                                />
                            </div>
                            <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                                {statsV2.toplam_aktif_ogrenci !== null && statsV2.toplam_aktif_ogrenci !== undefined ? statsV2.toplam_aktif_ogrenci : '-'}
                            </div>
                            {statsV2.toplam_aktif_ogrenci_artis > 0 && (
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-2">
                                    <span>↑</span>
                                    <span>Geçen döneme göre +{statsV2.toplam_aktif_ogrenci_artis}%</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Users className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Tez Aşamasında */}
                <div
                    onClick={() => handleStatCardClick('thesis-stage')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0" />

                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="flex-1 overflow-visible">
                            <div className="flex items-center gap-2 relative z-50">
                                <h3 className="text-gray-500 text-sm font-semibold tracking-wide">Tez Aşamasında</h3>
                                <InfoTooltip
                                    title="Tez Aşamasında"
                                    content={[{
                                        type: 'paragraph',
                                        text: 'Ders dönemini tamamlayıp tez aşamasına geçmiş öğrencilerin sayısını gösterir.'
                                    }]}
                                    position="bottom"
                                />
                            </div>
                            <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                                {statsV2.tez_asamasinda_ogrenci !== null && statsV2.tez_asamasinda_ogrenci !== undefined ? statsV2.tez_asamasinda_ogrenci : '-'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Ders dönemi tamamlandı</div>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Danışman Bekleyen Öğrenci */}
                <div
                    onClick={() => handleStatCardClick('advisor-waiting')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                >
                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="flex-1 overflow-visible">
                            <div className="flex items-center gap-2 relative z-50">
                                <h3 className="text-gray-500 text-sm font-semibold tracking-wide">Danışman Bekleyen</h3>
                                <InfoTooltip
                                    title="Danışman Bekleyen Öğrenci"
                                    content={[{
                                        type: 'paragraph',
                                        text: 'Henüz danışman ataması yapılmamış aktif öğrencilerin sayısını gösterir. Bu öğrenciler için acilen danışman ataması yapılmalıdır.'
                                    }]}
                                    position="bottom"
                                />
                            </div>
                            <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                                {statsV2.danisman_bekleyen_ogrenci !== null && statsV2.danisman_bekleyen_ogrenci !== undefined ? statsV2.danisman_bekleyen_ogrenci : '-'}
                            </div>
                            {statsV2.danisman_bekleyen_ogrenci > 0 && (
                                <div className="text-xs text-orange-600 font-medium mt-1">Atama gerekli</div>
                            )}
                        </div>
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                            <Users className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Kritik Riskli Öğrenci */}
                <div
                    onClick={() => handleStatCardClick('high-risk')}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0" />

                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="flex-1 overflow-visible">
                            <div className="flex items-center gap-2 relative z-50">
                                <h3 className="text-gray-500 text-sm font-semibold tracking-wide">Yüksek Riskli Öğrenci</h3>
                                <InfoTooltip
                                    title="Yüksek Riskli Öğrenci"
                                    content={[{
                                        type: 'paragraph',
                                        text: 'Kritik ve yüksek risk seviyesindeki öğrencilerin sayısını gösterir. GNO < 2.0 olan öğrenciler de dahildir. Bu öğrenciler için acil müdahale gereklidir.'
                                    }]}
                                    position="bottom"
                                />
                            </div>
                            <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                                {statsV2.kritik_riskli_ogrenci !== null && statsV2.kritik_riskli_ogrenci !== undefined ? statsV2.kritik_riskli_ogrenci : '-'}
                            </div>
                            {statsV2.kritik_riskli_artis > 0 && (
                                <div className="flex items-center gap-1 text-xs text-red-600 font-medium mt-2">
                                    <span>↑</span>
                                    <span>Geçen döneme göre +{statsV2.kritik_riskli_artis}%</span>
                                </div>
                            )}
                            <div className="text-xs text-red-600 font-medium mt-1">Müdahale gereken</div>
                        </div>
                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Program Dağılımı */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Program Dağılımı</h2>
                        <InfoTooltip
                            title="Program Dağılımı"
                            content={[{
                                type: 'paragraph',
                                text: 'Aktif öğrencilerin program türlerine göre dağılımını gösterir. Lisans, Yüksek Lisans ve Doktora programlarındaki öğrenci sayılarını ve yüzdelerini görüntüleyebilirsiniz.'
                            }]}
                            position="bottom"
                        />
                    </div>
                    {programDistribution.length > 0 ? (
                        <div className="h-64">
                            <Doughnut
                                data={{
                                    labels: programDistribution.map(item => item.program_tipi),
                                    datasets: [{
                                        data: programDistribution.map(item => item.ogrenci_sayisi),
                                        backgroundColor: [
                                            'rgba(37, 99, 235, 0.8)',
                                            'rgba(96, 165, 250, 0.8)',
                                            'rgba(156, 163, 175, 0.8)'
                                        ],
                                        borderColor: [
                                            'rgba(37, 99, 235, 1)',
                                            'rgba(96, 165, 250, 1)',
                                            'rgba(156, 163, 175, 1)'
                                        ],
                                        borderWidth: 2
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 15,
                                                usePointStyle: true,
                                                font: {
                                                    size: 12,
                                                    weight: '600'
                                                }
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    const label = context.label || '';
                                                    const value = context.parsed || 0;
                                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                    const percentage = ((value / total) * 100).toFixed(1);
                                                    return `${label}: ${value} öğrenci (%${percentage})`;
                                                }
                                            }
                                        }
                                    },
                                    onClick: (event, elements) => {
                                        if (elements.length > 0) {
                                            const index = elements[0].index;
                                            const programType = programDistribution[index].program_tipi;
                                            setSelectedProgramType(programType);
                                            setProgramModalOpen(true);
                                        }
                                    },
                                    onHover: (event, activeElements) => {
                                        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Veri yükleniyor...
                        </div>
                    )}
                </div>

                {/* Mevcut Aşama Dağılımı */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Mevcut Aşama Dağılımı</h2>
                        <InfoTooltip
                            title="Mevcut Aşama Dağılımı"
                            content={[{
                                type: 'paragraph',
                                text: 'Aktif öğrencilerin mevcut akademik aşamalarına göre dağılımını gösterir. Hazırlık, Ders, Yeterlilik ve Tez aşamalarındaki öğrenci sayılarını görüntüleyebilirsiniz.'
                            }]}
                            position="bottom"
                        />
                    </div>
                    {stageDistribution.length > 0 ? (
                        <div className="h-64">
                            <Bar
                                data={{
                                    labels: stageDistribution.map(item => item.asama_adi),
                                    datasets: [{
                                        label: 'Öğrenci Sayısı',
                                        data: stageDistribution.map(item => item.ogrenci_sayisi),
                                        backgroundColor: 'rgba(37, 99, 235, 0.8)',
                                        borderColor: 'rgba(37, 99, 235, 1)',
                                        borderWidth: 1.5
                                    }]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    const value = context.parsed.x;
                                                    const index = context.dataIndex;
                                                    const item = stageDistribution[index];
                                                    return `${item.asama_adi}: ${value} Öğrenci (%${item.yuzde})`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0,
                                                font: {
                                                    size: 11
                                                }
                                            },
                                            grid: {
                                                display: false
                                            }
                                        },
                                        y: {
                                            ticks: {
                                                font: {
                                                    size: 12,
                                                    weight: '600'
                                                }
                                            },
                                            grid: {
                                                display: false
                                            }
                                        }
                                    },
                                    onClick: (event, elements) => {
                                        if (elements.length > 0) {
                                            const index = elements[0].index;
                                            const stageCode = stageDistribution[index].durum_kodu;
                                            setSelectedStageCode(stageCode);
                                            setStageModalOpen(true);
                                        }
                                    },
                                    onHover: (event, activeElements) => {
                                        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Veri yükleniyor...
                        </div>
                    )}
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="İsim veya öğrenci numarası ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Program Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="">Tüm Programlar</option>
                            {programs.map((program) => (
                                <option key={program.program_turu_id} value={program.program_turu_id}>
                                    {program.program_adi}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stage Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="">Tüm Aşamalar</option>
                            {stages.map((stage) => (
                                <option key={stage.durum_id} value={stage.durum_adi}>
                                    {stage.durum_adi}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Risk Status Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedRiskLevel}
                            onChange={(e) => setSelectedRiskLevel(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="">Risk Durumu</option>
                            <option value="Kritik">Yüksek Risk</option>
                            <option value="Yuksek">Yüksek Risk</option>
                            <option value="Orta">İzlenmeli</option>
                            <option value="Dusuk">Normal</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Öğrenci bulunamadı.</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                toplam <span className="font-medium">{totalRecords}</span> kayıttan{' '}
                                <span className="font-medium">
                                    {pagination.pageIndex * pagination.pageSize + 1}
                                </span>
                                -{' '}
                                <span className="font-medium">
                                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRecords)}
                                </span>{' '}
                                arası gösteriliyor
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.pageIndex < 2) {
                                            pageNum = i + 1;
                                        } else if (pagination.pageIndex >= totalPages - 3) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.pageIndex - 1 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => table.setPageIndex(pageNum - 1)}
                                                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${pagination.pageIndex === pageNum - 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && pagination.pageIndex < totalPages - 3 && (
                                        <>
                                            <span className="px-2 text-gray-500">...</span>
                                            <button
                                                onClick={() => table.setPageIndex(totalPages - 1)}
                                                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Student Detail Modal */}
            {isModalOpen && selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedStudent(null);
                    }}
                />
            )}

            {/* Stats Detail Modal */}
            <DetailModal
                isOpen={isStatsModalOpen}
                onClose={() => {
                    setIsStatsModalOpen(false);
                    setStatsModalType(null);
                }}
                title={statsModalType === 'all' ? 'Tüm Öğrenciler' :
                    statsModalType === 'thesis' ? 'Tez Aşamasındaki Öğrenciler' :
                        statsModalType === 'monitoring' ? 'İzlenmesi Gereken Öğrenciler' :
                            statsModalType === 'high-risk' ? 'Yüksek Riskli Öğrenciler' : 'Öğrenci Listesi'}
                maxWidth="max-w-4xl"
            >
                {statsModalType && (
                    <StatsDetailModal
                        type={statsModalType}
                        isOpen={isStatsModalOpen}
                        onClose={() => {
                            setIsStatsModalOpen(false);
                            setStatsModalType(null);
                        }}
                    />
                )}
            </DetailModal>

            {/* Program Distribution Modal */}
            <ProgramDistributionModal
                isOpen={programModalOpen}
                onClose={() => {
                    setProgramModalOpen(false);
                    setSelectedProgramType(null);
                }}
                programType={selectedProgramType}
            />

            {/* Stage Distribution Modal */}
            <StageDistributionModal
                isOpen={stageModalOpen}
                onClose={() => {
                    setStageModalOpen(false);
                    setSelectedStageCode(null);
                }}
                stageCode={selectedStageCode}
            />
        </div>
    );
};

export default StudentAnalysis;
