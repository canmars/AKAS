import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Cell
} from 'recharts';
import api from '../../services/api';
import DetailModal from '../common/DetailModal';
import AdvisorWorkloadModal from './modals/AdvisorWorkloadModal';
import InfoTooltip from '../common/InfoTooltip';

// Özel Tooltip Bileşeni - V4 Detaylı Versiyonu
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const tezliToplam = (data.tezli_ders || 0) + (data.tezli_tez || 0);
    const tezsizToplam = (data.tezsiz_uzaktan || 0) + (data.tezsiz_io || 0);

    return (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-4 min-w-[280px] font-sans">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-slate-200">
                <span className="text-lg">👤</span>
                <div className="font-bold text-slate-900 text-sm">
                    {data.ad_soyad}
                </div>
            </div>
            
            {/* Tezli Yükü */}
            <div className="mb-3 bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900">📚 TEZLİ YÜKÜ</span>
                    <span className={`text-xs font-bold ${tezliToplam > 14 ? 'text-red-600' : 'text-blue-900'}`}>
                        {tezliToplam} / 14 (Kota)
                    </span>
                </div>
                <div className="space-y-1 pl-2">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-[#EF4444]"></div>
                        <span className="text-slate-600">Tez Aşaması:</span>
                        <span className="font-bold text-slate-800">{data.tezli_tez || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-[#3B82F6]"></div>
                        <span className="text-slate-600">Ders Aşaması:</span>
                        <span className="font-bold text-slate-800">{data.tezli_ders || 0}</span>
                    </div>
                </div>
            </div>

            {/* Tezsiz Yükü */}
            <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">🎓 TEZSİZ YÜKÜ</span>
                    <span className={`text-xs font-bold ${tezsizToplam > 16 ? 'text-red-600' : 'text-slate-700'}`}>
                        {tezsizToplam} / 16 (Kota)
                    </span>
                </div>
                <div className="space-y-1 pl-2">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-[#E5E7EB]"></div>
                        <span className="text-slate-600">Uzaktan Öğr:</span>
                        <span className="font-bold text-slate-800">{data.tezsiz_uzaktan || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-[#9CA3AF]"></div>
                        <span className="text-slate-600">İkinci Öğr:</span>
                        <span className="font-bold text-slate-800">{data.tezsiz_io || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Özel YAxis Label (Hoca isimlerini renklendirmek için) - V4
const CustomYAxisTick = ({ x, y, payload, chartData }) => {
    // payload.value hoca ismini içerir, chartData'dan eşleştir
    const advisorData = chartData?.find(item => item.ad_soyad === payload.value);
    const tezliToplam = advisorData ? advisorData.tezli_toplam : 0;
    const isOverQuota = tezliToplam > 14;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={-8}
                y={0}
                dy={4}
                textAnchor="end"
                fill={isOverQuota ? '#EF4444' : '#475569'}
                fontSize={12}
                fontWeight={isOverQuota ? 'bold' : 500}
                fontFamily="Inter, sans-serif"
            >
                {payload.value}
            </text>
        </g>
    );
};

const AdvisorWorkload = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const data = await api.get('/dashboard/advisor-load');
                if (!data || !Array.isArray(data)) throw new Error("Invalid advisor data");
                
                // Frontend tarafında da filtreleme (Arş. Gör. ve Öğr. Gör. hariç)
                const filteredData = data.filter(advisor => {
                    const unvan = advisor.unvan || '';
                    return !unvan.includes('Arş. Gör.') && !unvan.includes('Öğr. Gör.');
                });
                
                setAdvisors(filteredData);
            } catch (error) {
                console.error("Error fetching advisor load:", error);
                setAdvisors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisors();
    }, []);

    // Veri transformasyonu: Backend format (V4) -> Chart format
    const chartData = useMemo(() => {
        return advisors.map(advisor => {
            const tezliData = advisor.tezli_data || {};
            const tezsizData = advisor.tezsiz_data || {};
            const tezliDetay = tezliData.detay || {};
            const tezsizDetay = tezsizData.detay || {};
            
            return {
                personel_id: advisor.personel_id,
                ad_soyad: advisor.ad_soyad || '',
                unvan: advisor.unvan || '',
                // Tezsiz kategorileri (Solda - Gri Tonları)
                tezsiz_io: tezsizDetay.io || 0,           // Koyu Gri
                tezsiz_uzaktan: tezsizDetay.uzaktan || 0, // Açık Gri
                // Tezli kategorileri (Sağda - Renkli)
                tezli_ders: tezliDetay.ders || 0,         // Mavi
                tezli_tez: tezliDetay.tez || 0,           // Kırmızı
                // Toplamlar
                tezli_toplam: tezliData.dolu || 0,
                tezsiz_toplam: tezsizData.dolu || 0,
                toplam_ogrenci: advisor.toplam_ogrenci || 0
            };
        }).sort((a, b) => b.toplam_ogrenci - a.toplam_ogrenci); // Toplam öğrenci sayısına göre sırala
    }, [advisors]);

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
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100/50 h-full flex flex-col hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 shrink-0 pl-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 relative z-10">
                        <h2 className="text-lg font-bold text-gray-900">Danışman Yük Dağılımı</h2>
                        <div className="relative z-[100]">
                            <InfoTooltip
                                title="HESAPLAMA MANTIĞI"
                                content={[
                                    {
                                        type: 'bold',
                                        text: "• Tezli Kotası (14): Sadece 'Mavi' (Ders) ve 'Kırmızı' (Tez) barlar bu kotaya sayılır."
                                    },
                                    {
                                        type: 'bold',
                                        text: "• Tezsiz Kotası (16): 'Açık Gri' (Uzaktan) ve 'Koyu Gri' (İÖ) barlar bu kotaya dahildir."
                                    },
                                    {
                                        type: 'paragraph',
                                        text: "• Unvan Filtresi: Sadece Öğretim Üyeleri (Prof., Doç., Dr. Öğr. Üyesi) gösterilmektedir."
                                    },
                                    {
                                        type: 'paragraph',
                                        text: "• Uzaktan/İÖ Ayrımı: Program adındaki (Uzaktan Öğretim / İkinci Öğretim) ibaresine göre otomatik yapılmıştır."
                                    }
                                ]}
                                position="bottom"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Akademik Kurallara Göre İş Yükü Analizi
                    </p>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 min-h-0 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 30, right: 45, left: 160, bottom: 40 }}
                        barCategoryGap="8%"
                        onClick={(data) => {
                            if (data && data.activePayload && data.activePayload[0]) {
                                const payload = data.activePayload[0].payload;
                                if (payload.personel_id) {
                                    setSelectedAdvisorId(payload.personel_id);
                                    setModalOpen(true);
                                }
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                        
                        {/* X Ekseni: Öğrenci Sayısı (0-25, 2'şer artışla) */}
                        <XAxis
                            type="number"
                            domain={[0, 25]}
                            ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
                            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                            tickFormatter={(value) => value.toString()}
                            allowDecimals={false}
                            label={{ 
                                value: 'Öğrenci Sayısı', 
                                position: 'insideBottom', 
                                offset: -3,
                                style: { fill: '#64748B', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
                            }}
                        />
                        
                        {/* Y Ekseni: Hoca İsimleri */}
                        <YAxis
                            type="category"
                            dataKey="ad_soyad"
                            width={155}
                            tick={(props) => <CustomYAxisTick {...props} chartData={chartData} />}
                            tickLine={false}
                            interval={0}
                        />
                        
                        {/* Referans Çizgisi 1: X=14 (Tezli Kotası) */}
                        <ReferenceLine
                            x={14}
                            stroke="#3B82F6"
                            strokeWidth={2.5}
                            strokeDasharray="6 4"
                            label={{
                                value: "Tezli Kota: 14",
                                position: "top",
                                fill: "#3B82F6",
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                offset: 10
                            }}
                            isFront={true}
                        />
                        
                        {/* Referans Çizgisi 2: X=16 (Tezsiz Kotası) */}
                        <ReferenceLine
                            x={16}
                            stroke="#9CA3AF"
                            strokeWidth={2.5}
                            strokeDasharray="6 4"
                            label={({ viewBox }) => {
                                const { x, y, height } = viewBox;
                                return (
                                    <text
                                        x={x}
                                        y={y + height - 8}
                                        fill="#9CA3AF"
                                        fontSize={11}
                                        fontWeight={700}
                                        fontFamily="Inter, sans-serif"
                                        textAnchor="middle"
                                    >
                                        Tezsiz Kota: 16
                                    </text>
                                );
                            }}
                            isFront={true}
                        />
                        
                        {/* Tooltip */}
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Stacked Bars - V4 Detaylı (4 Kategori) */}
                        {/* Soldan Sağa Sıralama: İÖ > Uzaktan > Ders > Tez */}
                        
                        {/* 1. Tezsiz İkinci Öğretim (En Sol) - Koyu Gri */}
                        <Bar
                            dataKey="tezsiz_io"
                            stackId="a"
                            fill="#9CA3AF"
                            name="Tezsiz (İÖ)"
                            radius={[0, 0, 0, 0]}
                            barSize={32}
                        />
                        
                        {/* 2. Tezsiz Uzaktan - Açık Gri */}
                        <Bar
                            dataKey="tezsiz_uzaktan"
                            stackId="a"
                            fill="#E5E7EB"
                            name="Tezsiz (Uzaktan)"
                            radius={[0, 0, 0, 0]}
                            barSize={32}
                        />
                        
                        {/* 3. Tezli Ders Aşaması - Mavi */}
                        <Bar
                            dataKey="tezli_ders"
                            stackId="a"
                            fill="#3B82F6"
                            name="Tezli (Ders)"
                            radius={[0, 0, 0, 0]}
                            barSize={32}
                        />
                        
                        {/* 4. Tezli Tez Aşaması (En Sağ) - Kırmızı */}
                        <Bar
                            dataKey="tezli_tez"
                            stackId="a"
                            fill="#EF4444"
                            name="Tezli (Tez)"
                            radius={[0, 6, 6, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - V4 Detaylı */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 shrink-0 flex-wrap text-xs">
                {/* Tezsiz Grubu */}
                <div className="flex items-center gap-3 px-3 py-1 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-semibold text-[10px]">TEZSİZ:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#9CA3AF]"></div>
                        <span className="text-slate-600 font-medium">İÖ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#E5E7EB]"></div>
                        <span className="text-slate-600 font-medium">Uzaktan</span>
                    </div>
                </div>
                
                {/* Tezli Grubu */}
                <div className="flex items-center gap-3 px-3 py-1 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-semibold text-[10px]">TEZLİ:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#3B82F6]"></div>
                        <span className="text-slate-600 font-medium">Ders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#EF4444]"></div>
                        <span className="text-slate-600 font-medium">Tez</span>
                    </div>
                </div>
                
                {/* Kota Çizgileri */}
                <div className="flex items-center gap-3 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-semibold text-[10px]">KOTA:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-2 border-t-2 border-b-2 border-dashed border-[#3B82F6]"></div>
                        <span className="text-blue-700 font-semibold text-[10px]">14 (Tezli)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-2 border-t-2 border-b-2 border-dashed border-[#9CA3AF]"></div>
                        <span className="text-slate-600 font-semibold text-[10px]">16 (Tezsiz)</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <DetailModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedAdvisorId(null);
                }}
                title={selectedAdvisorId ? (() => {
                    const advisor = advisors.find(a => a.personel_id === selectedAdvisorId);
                    return advisor ? `${advisor.ad_soyad} - Öğrenci Listesi` : "Danışman Öğrenci Listesi";
                })() : "Danışman Öğrenci Listesi"}
                maxWidth="max-w-4xl"
            >
                <AdvisorWorkloadModal advisorId={selectedAdvisorId} />
            </DetailModal>
        </div>
    );
};

export default AdvisorWorkload;
