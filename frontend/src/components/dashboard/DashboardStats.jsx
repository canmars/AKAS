import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Users,
    AlertTriangle,
    BookOpen,
    Scale
} from 'lucide-react';

import DetailModal from '../common/DetailModal';
import RiskyStudentsModal from './modals/RiskyStudentsModal';
import ActiveThesesModal from './modals/ActiveThesesModal';
import AdvisorWorkloadModal from './modals/AdvisorWorkloadModal';
import InfoTooltip from '../common/InfoTooltip';

const StatCard = ({ title, value, icon: Icon, colorClass, onClick, infoTooltip }) => {

    // Color Configurations
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    };

    const theme = colors[colorClass] || colors.blue;

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98]"
        >
            {/* Background Decoration */}
            {colorClass === 'red' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-2">
                <div className="flex-1 overflow-visible">
                    <div className="flex items-center gap-2 relative z-50">
                        <h3 className="text-gray-500 text-sm font-semibold tracking-wide">{title}</h3>
                        {infoTooltip && (
                            <div className="relative z-[100]">
                                <InfoTooltip
                                    title={infoTooltip.title}
                                    content={infoTooltip.content}
                                    position="bottom"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-2 text-3xl font-black text-gray-900 tracking-tight">
                        {value !== null && value !== undefined ? value : '-'}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
            </div>

            {/* Trend ve Chart bilgileri kaldırıldı */}
        </div>
    );
};

const DashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Modal States
    const [riskyStudentsModalOpen, setRiskyStudentsModalOpen] = useState(false);
    const [activeThesesModalOpen, setActiveThesesModalOpen] = useState(false);
    const [advisorWorkloadModalOpen, setAdvisorWorkloadModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/kpis');

                // api.js returns the JSON body directly, so 'response' IS the data object.
                // We check if it exists and has keys.
                const data = response;

                if (!data || Object.keys(data).length === 0) {
                    setStats(null); // Explicit no data state
                } else {
                    setStats(data);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Veri alınamadı");
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white h-40 rounded-2xl border border-gray-100" />
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                Veri bulunamadı. Lütfen veritabanı bağlantılarını ve SQL fonksiyonlarını kontrol edin.
            </div>
        );
    }

    // Mapping SQL JSON result to UI components
    const cards = [
        {
            title: "Toplam Öğrenci",
            value: stats.toplam_ogrenci?.value,
            trend: stats.toplam_ogrenci?.trend,
            trendDirection: stats.toplam_ogrenci?.trend_direction,
            trendLabel: stats.toplam_ogrenci?.label,
            icon: Users,
            colorClass: "blue",
            isChartCard: false,
            path: '/student-analysis'
        },
        {
            title: "Riskli Öğrenci",
            value: stats.riskli_ogrenci?.value,
            icon: AlertTriangle,
            colorClass: "red",
            isChartCard: false,
            path: '/student-analysis',
            infoTooltip: {
                title: "Risk Skoru Algoritması (v3.0)",
                content: [
                    {
                        type: 'paragraph',
                        text: "Risk skoru 0-100 arasında hesaplanır. Puanlar toplanarak risk seviyesi belirlenir:"
                    },
                    {
                        type: 'list',
                        items: [
                            "Akademik Başarısızlık (GNO < 2.50): +20 Puan",
                            "Başarısız Dersler: Her ders için +5 Puan (Maks. 30 Puan Sigortalı)",
                            "TİK Başarısızlığı: 1 kez ise +30 Puan, 2 kez ise direkt 100 Puan (Atılma Riski)",
                            "Zaman Baskısı: Azami süreye 1 dönem kaldıysa +15, süre dolduysa +30 Puan"
                        ]
                    },
                    {
                        type: 'bold',
                        text: "Not: Hesaplamaya sadece 'Aktif' statüsündeki öğrenciler dahildir."
                    }
                ]
            }
        },
        {
            title: "Aktif Tezler",
            value: stats.aktif_tezler?.value,
            icon: BookOpen,
            colorClass: "purple",
            isChartCard: false,
            path: '/advisor-analysis',
            infoTooltip: {
                title: "Aktif Tez Tanımı",
                content: [
                    {
                        type: 'paragraph',
                        text: "Sistemdeki tezlerden durumu sadece şu olanlar sayılmıştır:"
                    },
                    {
                        type: 'list',
                        items: [
                            "Öneri: Tez önerisi kabul edilmiş.",
                            "Yazım: Tez yazım aşamasında.",
                            "Jüri: Jüri ataması yapılmış, savunma bekleyen.",
                            "Düzeltme: Savunma sonrası ek süre (90 gün) almış tezler."
                        ]
                    },
                    {
                        type: 'bold',
                        text: "Tamamlanan, Başarısız Olan veya İptal Edilen tezler bu sayıya dahil değildir."
                    }
                ]
            }
        },
        {
            title: "Ort. Danışman Yükü",
            value: stats.danisman_yuku?.value,
            icon: Scale,
            colorClass: "orange",
            isChartCard: false,
            path: '/advisor-analysis',
            infoTooltip: {
                title: "Ortalama Danışman Yükü Hesaplama",
                content: [
                    {
                        type: 'paragraph',
                        text: "Bu metrik, aktif öğrenci sayısının aktif danışman sayısına bölünmesiyle hesaplanır:"
                    },
                    {
                        type: 'list',
                        items: [
                            "Aktif Öğrenci Sayısı: Sistemde aktif statüsünde olan tüm öğrenciler.",
                            "Aktif Danışman Sayısı: Rolü 'Danışman' veya 'Bölüm Başkanı' olan aktif akademik personel.",
                            "Hesaplama: Toplam Öğrenci / Toplam Danışman = Ortalama Yük"
                        ]
                    },
                    {
                        type: 'bold',
                        text: "Bu değer, danışmanların genel iş yükünü gösterir. Yüksek değerler, danışman başına düşen öğrenci sayısının fazla olduğunu ifade eder."
                    }
                ]
            }
        }
    ];

    // Modal Handlers
    const handleCardClick = (card) => {
        switch (card.title) {
            case 'Riskli Öğrenci':
                setRiskyStudentsModalOpen(true);
                break;
            case 'Aktif Tezler':
                setActiveThesesModalOpen(true);
                break;
            case 'Ort. Danışman Yükü':
                setAdvisorWorkloadModalOpen(true);
                break;
            default:
                if (card.path) navigate(card.path);
                break;
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <StatCard
                        key={index}
                        {...card}
                        onClick={() => handleCardClick(card)}
                    />
                ))}
            </div>

            {/* Modals */}
            <DetailModal
                isOpen={riskyStudentsModalOpen}
                onClose={() => setRiskyStudentsModalOpen(false)}
                title="Risk Analiz Raporu"
                maxWidth="max-w-4xl"
            >
                <RiskyStudentsModal />
            </DetailModal>

            <DetailModal
                isOpen={activeThesesModalOpen}
                onClose={() => setActiveThesesModalOpen(false)}
                title="Aktif Tezler Listesi"
                maxWidth="max-w-4xl"
            >
                <ActiveThesesModal />
            </DetailModal>

            <DetailModal
                isOpen={advisorWorkloadModalOpen}
                onClose={() => setAdvisorWorkloadModalOpen(false)}
                title="Danışman Yükü Detayı"
                maxWidth="max-w-4xl"
            >
                <AdvisorWorkloadModal advisorId={null} />
            </DetailModal>
        </>
    );
};

export default DashboardStats;
