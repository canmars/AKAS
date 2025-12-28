import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, GraduationCap, CheckCircle, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import api from '../services/api';
import InfoTooltip from '../components/common/InfoTooltip';
import AdvisorDetailModal from '../components/advisorAnalysis/AdvisorDetailModal';
import ExpertiseDetailModal from '../components/advisorAnalysis/ExpertiseDetailModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AcademicStaff = () => {
    // State Management
    const [kpis, setKpis] = useState({
        toplam_danisman: 0,
        gecen_donem_artis: 0,
        ortalama_doluluk: 0,
        ortalama_doluluk_artis: 0,
        aktif_ogrenci_toplam: 0,
        aktif_ogrenci_tezli: 0,
        aktif_ogrenci_tezsiz: 0,
        basari_orani: 0,
        basari_orani_artis: 0
    });
    const [expertiseData, setExpertiseData] = useState([]);
    const [quotaComparison, setQuotaComparison] = useState([]);
    const [performanceList, setPerformanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [expertiseFilter, setExpertiseFilter] = useState('Genel');
    const [unvanFilter, setUnvanFilter] = useState('');
    
    // Pagination
    const [pagination, setPagination] = useState({ page: 1, limit: 4 });
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modals
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);
    const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
    const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false);

    // Tooltip states
    const [hoveredBar, setHoveredBar] = useState(null);

    // Prepare chart data - Sadece dolu kısımları göster, grouped bar chart
    const quotaChartData = {
        labels: quotaComparison.map(item => item.unvan),
        datasets: [
            {
                label: 'Tezli Yükü',
                data: quotaComparison.map(item => item.dolu_kota_tezli),
                backgroundColor: 'rgba(37, 99, 235, 0.9)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                borderRadius: 4,
            },
            {
                label: 'Tezsiz Yükü',
                data: quotaComparison.map(item => item.dolu_kota_tezsiz),
                backgroundColor: 'rgba(96, 165, 250, 0.9)',
                borderColor: 'rgba(96, 165, 250, 1)',
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    };

    const quotaChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 12,
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        const index = context.dataIndex;
                        const item = quotaComparison[index];
                        
                        if (label === 'Tezli Yükü') {
                            const percentage = item.toplam_kota_tezli > 0 
                                ? ((value / item.toplam_kota_tezli) * 100).toFixed(1) 
                                : 0;
                            return `${label}: ${value} / ${item.toplam_kota_tezli} (${percentage}%)`;
                        } else if (label === 'Tezsiz Yükü') {
                            const percentage = item.toplam_kota_tezsiz > 0 
                                ? ((value / item.toplam_kota_tezsiz) * 100).toFixed(1) 
                                : 0;
                            return `${label}: ${value} / ${item.toplam_kota_tezsiz} (${percentage}%)`;
                        }
                        return `${label}: ${value}`;
                    },
                    footer: function(tooltipItems) {
                        const index = tooltipItems[0].dataIndex;
                        const item = quotaComparison[index];
                        const doluluk = item.toplam_kota > 0 
                            ? ((item.toplam_dolu / item.toplam_kota) * 100).toFixed(1) 
                            : 0;
                        return [
                            `Toplam Kota: ${item.toplam_kota}`,
                            `Boş Kota: ${item.toplam_bos}`,
                            `Doluluk: ${doluluk}%`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            y: {
                beginAtZero: true,
                max: function(context) {
                    // Sadece dolu kısımların maksimum değerine göre ayarla
                    if (quotaComparison.length === 0) return 10;
                    const maxDolu = Math.max(
                        ...quotaComparison.map(item => Math.max(item.dolu_kota_tezli || 0, item.dolu_kota_tezsiz || 0))
                    );
                    // %40 padding ekle, ama çok küçük değerler için minimum 10 olsun
                    const calculatedMax = maxDolu * 1.4;
                    // Eğer çok küçük bir değer varsa, daha anlamlı bir maksimum belirle
                    if (calculatedMax < 10) return 10;
                    // Yuvarla ve 5'in katı yap
                    return Math.ceil(calculatedMax / 5) * 5;
                },
                ticks: {
                    stepSize: function(context) {
                        // Dinamik step size - maksimum değere göre
                        if (quotaComparison.length === 0) return 5;
                        const maxDolu = Math.max(
                            ...quotaComparison.map(item => Math.max(item.dolu_kota_tezli || 0, item.dolu_kota_tezsiz || 0))
                        );
                        if (maxDolu <= 10) return 2;
                        if (maxDolu <= 30) return 5;
                        return 10;
                    },
                    font: {
                        size: 11
                    },
                    precision: 0
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.08)',
                    drawBorder: false
                }
            }
        }
    };

    // Fetch Data
    useEffect(() => {
        fetchAllData();
    }, [expertiseFilter, unvanFilter, pagination]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchKPIs(),
                fetchExpertiseDistribution(),
                fetchQuotaComparison(),
                fetchPerformanceList()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKPIs = async () => {
        try {
            const response = await api.get('/advisors/kpis');
            setKpis(response);
        } catch (error) {
            console.error('Error fetching KPIs:', error);
        }
    };

    const fetchExpertiseDistribution = async () => {
        try {
            const category = expertiseFilter === 'Genel' ? null : expertiseFilter;
            const response = await api.get('/advisors/expertise', {
                params: { category }
            });
            setExpertiseData(response);
        } catch (error) {
            console.error('Error fetching expertise distribution:', error);
        }
    };

    const fetchQuotaComparison = async () => {
        try {
            const response = await api.get('/advisors/quota-comparison');
            setQuotaComparison(response);
        } catch (error) {
            console.error('Error fetching quota comparison:', error);
        }
    };

    const fetchPerformanceList = async () => {
        try {
            const response = await api.get('/advisors/performance', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    ...(unvanFilter && { unvan: unvanFilter })
                }
            });
            setPerformanceList(response.data || []);
            setTotalPages(response.meta?.totalPages || 0);
            setTotalRecords(response.meta?.total || 0);
        } catch (error) {
            console.error('Error fetching performance list:', error);
        }
    };

    // Get max value for progress bars
    const getMaxExpertiseCount = () => {
        if (expertiseData.length === 0) return 1;
        return Math.max(...expertiseData.map(e => e.danisman_sayisi));
    };

    // Get avatar initials
    const getAvatar = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Get load color based on percentage
    const getLoadColor = (percentage) => {
        if (percentage >= 90) return { bg: 'bg-red-500', text: 'text-red-600' };
        if (percentage >= 70) return { bg: 'bg-blue-500', text: 'text-blue-600' };
        if (percentage >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
        return { bg: 'bg-green-500', text: 'text-green-600' };
    };

    // Info tooltip content
    const kpiInfo = {
        total: {
            title: 'Toplam Danışman',
            content: [
                {
                    type: 'paragraph',
                    text: 'Sistemde aktif olan ve danışmanlık yapabilen toplam akademik personel sayısını gösterir. Sadece Prof. Dr., Doç. Dr. ve Dr. Öğr. Üyesi unvanlarındaki personeller danışman olabilir.'
                }
            ]
        },
        occupancy: {
            title: 'Ortalama Doluluk',
            content: [
                {
                    type: 'paragraph',
                    text: 'Tüm danışmanların ortalama kota doluluk oranını gösterir. Bu oran, tezli ve tezsiz programlar için ayrı ayrı hesaplanan doluluk oranlarının ortalamasıdır.'
                }
            ]
        },
        students: {
            title: 'Aktif Öğrenci',
            content: [
                {
                    type: 'paragraph',
                    text: 'Sistemde aktif durumda olan ve bir danışmana atanmış toplam öğrenci sayısını gösterir. Tezli ve tezsiz program öğrencileri ayrı ayrı gösterilir.'
                }
            ]
        },
        success: {
            title: 'Başarı Oranı',
            content: [
                {
                    type: 'paragraph',
                    text: 'Mezuniyet ve tez savunma başarı oranını gösterir. Bu oran, mezun olan öğrencilerin toplam öğrenci sayısına oranıdır.'
                }
            ]
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Danışman Analizi</h1>
                <p className="text-gray-600 mt-1">Akademik personel yük dağılımı ve performans analizi</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Toplam Danışman */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <InfoTooltip
                            title={kpiInfo.total.title}
                            content={kpiInfo.total.content}
                            position="bottom"
                        />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.toplam_danisman}</div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Toplam Danışman</div>
                    {kpis.gecen_donem_artis > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span>↑</span>
                            <span>+{kpis.gecen_donem_artis}</span>
                        </div>
                    )}
                </div>

                {/* Ortalama Doluluk */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <InfoTooltip
                            title={kpiInfo.occupancy.title}
                            content={kpiInfo.occupancy.content}
                            position="bottom"
                        />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">%{kpis.ortalama_doluluk.toFixed(0)}</div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Ortalama Doluluk</div>
                    {kpis.ortalama_doluluk_artis > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
                            <span>↑</span>
                            <span>+%{kpis.ortalama_doluluk_artis.toFixed(1)}</span>
                        </div>
                    )}
                    <div className="w-full bg-orange-200 rounded-full h-2">
                        <div 
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(kpis.ortalama_doluluk, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Aktif Öğrenci */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-purple-600" />
                        </div>
                        <InfoTooltip
                            title={kpiInfo.students.title}
                            content={kpiInfo.students.content}
                            position="bottom"
                        />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.aktif_ogrenci_toplam}</div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Aktif Öğrenci</div>
                    <div className="text-xs text-gray-600">
                        {kpis.aktif_ogrenci_tezsiz} Tezsiz / {kpis.aktif_ogrenci_tezli} Tezli
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Kayıtlı toplam lisansüstü</div>
                </div>

                {/* Başarı Oranı */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <InfoTooltip
                            title={kpiInfo.success.title}
                            content={kpiInfo.success.content}
                            position="bottom"
                        />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">%{kpis.basari_orani.toFixed(0)}</div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Başarı Oranı</div>
                    {kpis.basari_orani_artis > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span>↑</span>
                            <span>+%{kpis.basari_orani_artis.toFixed(1)}</span>
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">Mezuniyet ve tez savunma</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Uzmanlık Dağılımı */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Uzmanlık Dağılımı</h3>
                            <InfoTooltip
                                title="Uzmanlık Dağılımı"
                                content={[
                                    {
                                        type: 'paragraph',
                                        text: 'Akademik personelin uzmanlık alanlarına göre dağılımını gösterir. Her uzmanlık alanında kaç danışman bulunduğunu ve bu danışmanların listesini görüntüleyebilirsiniz.'
                                    }
                                ]}
                                position="bottom"
                            />
                        </div>
                        <button 
                            onClick={() => setIsExpertiseModalOpen(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Tümünü Gör
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        {['Genel', 'Yapay Zeka', 'Veri Bilimi'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setExpertiseFilter(filter)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    expertiseFilter === filter
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Expertise Chart */}
                    <div className="mb-4">
                        {expertiseData.length > 0 ? (
                            <div className="h-48">
                                <Bar 
                                    data={{
                                        labels: expertiseData.slice(0, 8).map(e => e.uzmanlik_alani.length > 20 
                                            ? e.uzmanlik_alani.substring(0, 20) + '...' 
                                            : e.uzmanlik_alani),
                                        datasets: [{
                                            label: 'Danışman Sayısı',
                                            data: expertiseData.slice(0, 8).map(e => e.danisman_sayisi),
                                            backgroundColor: [
                                                'rgba(37, 99, 235, 0.8)',
                                                'rgba(59, 130, 246, 0.8)',
                                                'rgba(96, 165, 250, 0.8)',
                                                'rgba(147, 197, 253, 0.8)',
                                                'rgba(139, 92, 246, 0.8)',
                                                'rgba(168, 85, 247, 0.8)',
                                                'rgba(192, 132, 252, 0.8)',
                                                'rgba(217, 70, 239, 0.8)',
                                            ],
                                            borderColor: [
                                                'rgba(37, 99, 235, 1)',
                                                'rgba(59, 130, 246, 1)',
                                                'rgba(96, 165, 250, 1)',
                                                'rgba(147, 197, 253, 1)',
                                                'rgba(139, 92, 246, 1)',
                                                'rgba(168, 85, 247, 1)',
                                                'rgba(192, 132, 252, 1)',
                                                'rgba(217, 70, 239, 1)',
                                            ],
                                            borderWidth: 2,
                                            borderRadius: 6,
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: 'y',
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                padding: 10,
                                                titleFont: {
                                                    size: 13,
                                                    weight: 'bold'
                                                },
                                                bodyFont: {
                                                    size: 12
                                                },
                                                callbacks: {
                                                    label: function(context) {
                                                        const index = context.dataIndex;
                                                        const expertise = expertiseData[index];
                                                        return `${expertise.uzmanlik_alani}: ${context.parsed.x} danışman`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1,
                                                    precision: 0,
                                                    font: {
                                                        size: 11
                                                    }
                                                },
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)'
                                                }
                                            },
                                            y: {
                                                ticks: {
                                                    font: {
                                                        size: 10
                                                    }
                                                },
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                                Veri yükleniyor...
                            </div>
                        )}
                    </div>

                    {/* Top 5 List */}
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">En Çok Danışman</div>
                        {expertiseData.slice(0, 5).map((expertise, index) => {
                            const maxCount = getMaxExpertiseCount();
                            const percentage = (expertise.danisman_sayisi / maxCount) * 100;
                            const colors = [
                                'bg-blue-500',
                                'bg-blue-500',
                                'bg-purple-500',
                                'bg-blue-500',
                                'bg-blue-500'
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div 
                                    key={index}
                                    className="group relative"
                                    title={`${expertise.uzmanlik_alani}: ${expertise.danisman_sayisi} danışman`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-900 truncate flex-1 mr-2">
                                            {expertise.uzmanlik_alani}
                                        </span>
                                        <span className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                                            {expertise.danisman_sayisi}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 relative">
                                        <div 
                                            className={`${color} h-1.5 rounded-full transition-all group-hover:opacity-80`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tezli/Tezsiz Kota ve Yük Karşılaştırması */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Tezli/Tezsiz Kota ve Yük Karşılaştırması</h3>
                        <InfoTooltip
                            title="Tezli/Tezsiz Kota ve Yük Karşılaştırması"
                            content={[
                                {
                                    type: 'paragraph',
                                    text: 'Bölüm geneli kapasite doluluk oranlarını gösterir. Her unvan için tezli ve tezsiz programların mevcut yükü ile toplam kota karşılaştırması yapılır. Grafik üzerine gelerek detaylı bilgi görebilirsiniz.'
                                }
                            ]}
                            position="bottom"
                        />
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                        Bölüm geneli kapasite doluluk oranları (Mevcut Yük vs. Toplam Kota)
                    </p>

                    {/* Chart Container - Önce grafik, daha büyük ve anlaşılır */}
                    <div className="h-72 mb-4">
                        {quotaComparison.length > 0 ? (
                            <Bar data={quotaChartData} options={quotaChartOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Veri yükleniyor...
                            </div>
                        )}
                    </div>

                    {/* Compact Summary Cards - Daha küçük ve kompakt */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {quotaComparison.map((item, index) => {
                            const dolulukYuzde = item.toplam_kota > 0 
                                ? ((item.toplam_dolu / item.toplam_kota) * 100).toFixed(1) 
                                : 0;
                            const dolulukColor = dolulukYuzde >= 90 ? 'text-red-600' 
                                : dolulukYuzde >= 70 ? 'text-orange-600' 
                                : dolulukYuzde >= 50 ? 'text-yellow-600' 
                                : 'text-green-600';

                            return (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="text-sm font-bold text-gray-900 mb-2">{item.unvan}</div>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Toplam</span>
                                            <span className="font-semibold text-gray-900">{item.toplam_kota}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded bg-blue-600"></div>
                                                <span className="text-gray-600">Tezli</span>
                                            </div>
                                            <span className="font-medium text-blue-600">
                                                {item.dolu_kota_tezli}/{item.toplam_kota_tezli}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded bg-blue-400"></div>
                                                <span className="text-gray-600">Tezsiz</span>
                                            </div>
                                            <span className="font-medium text-blue-400">
                                                {item.dolu_kota_tezsiz}/{item.toplam_kota_tezsiz}
                                            </span>
                                        </div>
                                        <div className="pt-1.5 mt-1.5 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Doluluk</span>
                                                <span className={`font-bold ${dolulukColor}`}>
                                                    %{dolulukYuzde}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Danışman Performans Listesi */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Danışman Performans Listesi</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Bireysel danışman bazlı öğrenci yükü ve uzmanlık tablosu
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={unvanFilter}
                                onChange={(e) => {
                                    setUnvanFilter(e.target.value);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tüm Unvanlar</option>
                                <option value="Prof. Dr.">Prof. Dr.</option>
                                <option value="Doç. Dr.">Doç. Dr.</option>
                                <option value="Dr. Öğr. Üyesi">Dr. Öğr. Üyesi</option>
                            </select>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DANIŞMAN</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">UNVAN</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">UZMANLIK ALANLARI</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">MEVCUT YÜK / KOTA</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ÖĞRENCİ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İŞLEM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {performanceList.map((advisor) => {
                                const loadColor = getLoadColor(advisor.doluluk_yuzdesi);
                                return (
                                    <tr key={advisor.personel_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {getAvatar(advisor.ad_soyad)}
                                                </div>
                                                <span className="font-medium text-gray-900">{advisor.ad_soyad}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700">{advisor.unvan}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {advisor.uzmanlik_alanlari?.slice(0, 2).map((uzmanlik, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {uzmanlik}
                                                    </span>
                                                ))}
                                                {advisor.uzmanlik_alanlari?.length > 2 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        +{advisor.uzmanlik_alanlari.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 max-w-[120px]">
                                                    <div 
                                                        className={`${loadColor.bg} h-2.5 rounded-full transition-all`}
                                                        style={{ width: `${Math.min(advisor.doluluk_yuzdesi, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {advisor.toplam_yuk} / {advisor.toplam_kota}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700">{advisor.ogrenci_sayisi}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => {
                                                    setSelectedAdvisor(advisor);
                                                    setIsAdvisorModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Detay
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        toplam <span className="font-medium">{totalRecords}</span> danışmandan{' '}
                        <span className="font-medium">
                            {(pagination.page - 1) * pagination.limit + 1}
                        </span>
                        -{' '}
                        <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, totalRecords)}
                        </span>{' '}
                        arası gösteriliyor
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                            className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page < 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPagination({ ...pagination, page: pageNum })}
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
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page >= totalPages}
                            className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isAdvisorModalOpen && selectedAdvisor && (
                <AdvisorDetailModal
                    advisor={selectedAdvisor}
                    isOpen={isAdvisorModalOpen}
                    onClose={() => {
                        setIsAdvisorModalOpen(false);
                        setSelectedAdvisor(null);
                    }}
                />
            )}

            {isExpertiseModalOpen && (
                <ExpertiseDetailModal
                    expertiseData={expertiseData}
                    isOpen={isExpertiseModalOpen}
                    onClose={() => setIsExpertiseModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AcademicStaff;
