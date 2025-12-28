import React, { useState, useEffect, useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';
import CourseFailureModal from './modals/CourseFailureModal';
import InfoTooltip from '../common/InfoTooltip';

// Özel Tooltip Bileşeni
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[260px] max-w-[320px] z-50">
            <div className="font-semibold text-slate-800 mb-3 text-sm border-b border-slate-100 pb-2 font-sans">
                {data.ders_kodu}
            </div>
            
            <div className="space-y-2 text-xs font-sans">
                <div className="flex flex-col gap-1">
                    <span className="text-slate-600">Ders Adı:</span>
                    <span className="font-bold text-slate-800 leading-tight">{data.ders_adi}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-slate-600">Öğretim Üyesi:</span>
                    <span className="font-semibold text-slate-800 leading-tight">{data.ogretim_uyesi}</span>
                </div>
                
                <div className="border-t border-slate-100 pt-2 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Başarısızlık Oranı:</span>
                        <span className="font-bold text-red-500">%{data.x_ekseni_basarisizlik}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Toplam Kayıt:</span>
                        <span className="font-bold text-slate-800">{data.y_ekseni_etki} Öğrenci</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Ortalama Not:</span>
                        <span className="font-bold text-slate-800">{data.ortalama_not}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tekrar Oranı:</span>
                        <span className="font-bold text-slate-800">%{data.tekrar_orani}</span>
                    </div>
                </div>
                
                <div className="border-t border-slate-100 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">Risk Skoru:</span>
                        <span className={`font-bold text-lg ${
                            data.risk_skoru > 70 ? 'text-red-500' : 
                            data.risk_skoru >= 40 ? 'text-amber-500' : 
                            'text-emerald-500'
                        }`}>
                            {data.risk_skoru}
                        </span>
                    </div>
                    <div className="mt-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            data.risk_kategorisi === 'Kritik Darboğaz' ? 'bg-red-50 text-red-600' :
                            data.risk_kategorisi === 'Orta Risk' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                        }`}>
                            {data.risk_kategorisi}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseRiskAnalysis = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseCode, setSelectedCourseCode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourseRisk = async () => {
            try {
                const data = await api.get('/dashboard/course-risk');
                if (!data || !Array.isArray(data)) throw new Error("Invalid course risk data");
                setCourses(data);
            } catch (error) {
                console.error("Error fetching course risk metrics:", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseRisk();
    }, []);

    // Risk kategorisine göre renk belirleme
    const getRiskColor = (riskKategori) => {
        switch (riskKategori) {
            case 'Kritik Darboğaz':
                return '#EF4444'; // Red
            case 'Orta Risk':
                return '#F59E0B'; // Amber
            case 'Düşük Risk':
                return '#10B981'; // Green
            default:
                return '#64748B'; // Slate
        }
    };

    // Özet istatistikler
    const stats = useMemo(() => {
        if (courses.length === 0) return null;
        
        const kritikSayisi = courses.filter(c => c.risk_kategorisi === 'Kritik Darboğaz').length;
        const ortaSayisi = courses.filter(c => c.risk_kategorisi === 'Orta Risk').length;
        const dusukSayisi = courses.filter(c => c.risk_kategorisi === 'Düşük Risk').length;
        const ortalamaBasarisizlik = courses.reduce((sum, c) => sum + (c.x_ekseni_basarisizlik || 0), 0) / courses.length;
        const enRiskliDers = courses.sort((a, b) => (b.risk_skoru || 0) - (a.risk_skoru || 0))[0];
        
        return {
            toplamDers: courses.length,
            kritikSayisi,
            ortaSayisi,
            dusukSayisi,
            ortalamaBasarisizlik: Math.round(ortalamaBasarisizlik * 10) / 10,
            enRiskliDers
        };
    }, [courses]);

    // Scatter chart için veri formatı ve dinamik nokta boyutu
    const chartData = useMemo(() => {
        if (courses.length === 0) return [];
        
        const maxEtki = Math.max(...courses.map(c => c.y_ekseni_etki || 0));
        const minEtki = Math.min(...courses.map(c => c.y_ekseni_etki || 0));
        const etkiRange = maxEtki - minEtki || 1;
        
        return courses.map(course => {
            // Nokta boyutu: Etki (öğrenci sayısı) bazlı, min 6px, max 20px
            const normalizedEtki = ((course.y_ekseni_etki || 0) - minEtki) / etkiRange;
            const pointSize = 6 + (normalizedEtki * 14); // 6px - 20px arası
            
            return {
                x: course.x_ekseni_basarisizlik || 0,
                y: course.y_ekseni_etki || 0,
                size: pointSize,
                ...course
            };
        });
    }, [courses]);

    if (loading) {
        return (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100/50 h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100/50 h-full flex flex-col items-center justify-center text-slate-300">
                <span className="text-3xl mb-4">📭</span>
                <p className="text-xs font-bold uppercase tracking-widest">Veri bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100/50 h-full flex flex-col hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-3 shrink-0">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 relative z-10">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ders Risk Analizi</h2>
                        <div className="relative z-[100]">
                            <InfoTooltip
                                title="Ders Risk İndeksi"
                                content={[
                                    {
                                        type: 'paragraph',
                                        text: "Grafikteki derslerin konumu şu iki veriye dayanır:"
                                    },
                                    {
                                        type: 'list',
                                        items: [
                                            "X Ekseni (Zorluk): Başarısızlık Oranı = (Kalan Öğrenci / Toplam Kayıt) formülüyle hesaplanır.",
                                            "Y Ekseni (Etki): Dersi alan toplam öğrenci sayısıdır."
                                        ]
                                    },
                                    {
                                        type: 'bold',
                                        text: "Kırmızı Bölge (Sağ Üst): Hem çok kişinin aldığı hem de başarısızlığın yüksek olduğu 'Darboğaz Dersleri' ifade eder."
                                    }
                                ]}
                                position="bottom"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Başarısızlık Oranı ve Etki Analizi
                    </p>
                </div>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    Canlı Veri
                </span>
            </div>

            {/* Özet İstatistikler - İlk Bakışta Anlaşılacak */}
            {stats && (
                <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam Ders</p>
                        <p className="text-lg font-black text-slate-800">{stats.toplamDers}</p>
                    </div>
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Kritik</p>
                        <p className="text-lg font-black text-red-600">{stats.kritikSayisi}</p>
                    </div>
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Orta Risk</p>
                        <p className="text-lg font-black text-amber-600">{stats.ortaSayisi}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Ort. Başarısızlık</p>
                        <p className="text-lg font-black text-emerald-600">%{stats.ortalamaBasarisizlik}</p>
                    </div>
                </div>
            )}

            {/* En Riskli Ders Uyarısı */}
            {stats && stats.enRiskliDers && stats.enRiskliDers.risk_skoru > 70 && (
                <div className="mb-3 p-3 bg-red-50/50 border border-red-100/50 rounded-xl shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-0.5">En Riskli Ders</p>
                            <p className="text-sm font-semibold text-slate-800">
                                {stats.enRiskliDers.ders_kodu} - {stats.enRiskliDers.ders_adi}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Risk Skoru: <span className="font-bold text-red-600">{stats.enRiskliDers.risk_skoru}</span> | 
                                Başarısızlık: <span className="font-bold text-red-600">%{stats.enRiskliDers.x_ekseni_basarisizlik}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Container */}
            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 15, right: 25, left: 50, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                        
                        {/* X Ekseni: Başarısızlık Oranı (%) */}
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Başarısızlık Oranı"
                            unit="%"
                            domain={[0, 100]}
                            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                            label={{ 
                                value: 'Başarısızlık Oranı (%)', 
                                position: 'insideBottom', 
                                offset: -8,
                                style: { fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
                            }}
                        />
                        
                        {/* Y Ekseni: Etki (Öğrenci Sayısı) */}
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Etki"
                            unit=""
                            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                            label={{ 
                                value: 'Toplam Kayıt Sayısı', 
                                angle: -90, 
                                position: 'left',
                                offset: -10,
                                style: { fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
                            }}
                        />
                        
                        {/* Referans Çizgisi: Yüksek Başarısızlık (50%) */}
                        <ReferenceLine
                            x={50}
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: "Uyarı Eşiği (50%)",
                                position: "top",
                                fill: "#F59E0B",
                                fontSize: 9,
                                fontWeight: 600,
                                fontFamily: "Inter, sans-serif",
                                offset: 5
                            }}
                        />
                        
                        {/* Tooltip */}
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8', strokeOpacity: 0.3 }}
                            allowEscapeViewBox={{ x: true, y: true }}
                        />
                        
                        {/* Scatter Points - Kategorilere göre ayrılmış */}
                        {['Kritik Darboğaz', 'Orta Risk', 'Düşük Risk'].map((kategori) => {
                            const kategoriData = chartData.filter(d => d.risk_kategorisi === kategori);
                            const color = getRiskColor(kategori);
                            
                            return (
                                <Scatter
                                    key={kategori}
                                    name={kategori}
                                    data={kategoriData}
                                    fill={color}
                                    fillOpacity={0.7}
                                    stroke={color}
                                    strokeWidth={2}
                                    onClick={(data) => {
                                        if (data && data.ders_kodu) {
                                            setSelectedCourseCode(data.ders_kodu);
                                            setModalOpen(true);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            );
                        })}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-6 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#EF4444]"></div>
                    <span className="text-xs text-slate-600 font-medium">Kritik Darboğaz</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
                    <span className="text-xs text-slate-600 font-medium">Orta Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
                    <span className="text-xs text-slate-600 font-medium">Düşük Risk</span>
                </div>
            </div>

            {/* Modal */}
            <DetailModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedCourseCode(null);
                }}
                title={selectedCourseCode ? `${selectedCourseCode} - Başarısızlık Karnesi` : "Ders Başarısızlık Karnesi"}
                maxWidth="max-w-5xl"
            >
                <CourseFailureModal courseCode={selectedCourseCode} />
            </DetailModal>
        </div>
    );
};

export default CourseRiskAnalysis;

