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

// Özel Tooltip Bileşeni
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const tezliToplam = (data.tezli_ders_sayisi || 0) + (data.tezli_tez_sayisi || 0);
    const tezliKota = 14;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[220px]">
            <div className="font-semibold text-slate-800 mb-3 text-sm border-b border-slate-100 pb-2 font-sans">
                {data.ad_soyad}
            </div>
            
            <div className="space-y-2 text-xs font-sans">
                <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">🔴</span>
                    <span className="text-slate-600">Tez Aşaması:</span>
                    <span className="font-bold text-slate-800">{data.tezli_tez_sayisi || 0} Öğrenci</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">🔵</span>
                    <span className="text-slate-600">Ders Aşaması:</span>
                    <span className="font-bold text-slate-800">{data.tezli_ders_sayisi || 0} Öğrenci</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">⚪</span>
                    <span className="text-slate-600">Tezsiz:</span>
                    <span className="font-bold text-slate-800">{data.tezsiz_sayisi || 0} Öğrenci</span>
                </div>
                
                <div className="border-t border-slate-100 pt-2 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600">📊 Toplam Tezli Yükü:</span>
                        <span className={`font-bold ${tezliToplam > tezliKota ? 'text-red-500' : 'text-slate-800'}`}>
                            {tezliToplam} / {tezliKota}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Özel YAxis Label (Hoca isimlerini renklendirmek için)
const CustomYAxisTick = ({ x, y, payload, chartData }) => {
    // payload.value hoca ismini içerir, chartData'dan eşleştir
    const advisorData = chartData?.find(item => item.ad_soyad === payload.value);
    const tezliToplam = advisorData ? (advisorData.tezli_ders_sayisi || 0) + (advisorData.tezli_tez_sayisi || 0) : 0;
    const isOverQuota = tezliToplam > 14;

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={-8}
                y={0}
                dy={4}
                textAnchor="end"
                fill={isOverQuota ? '#EF4444' : '#475569'}
                fontSize={11}
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

    // Veri transformasyonu: Backend format -> Chart format
    const chartData = useMemo(() => {
        return advisors.map(advisor => {
            const tezli = advisor.tezli_durum || {};
            const tezsiz = advisor.tezsiz_durum || {};
            
            return {
                ad_soyad: advisor.ad_soyad || '',
                unvan: advisor.unvan || '',
                tezsiz_sayisi: tezsiz.toplam_dolu || 0,
                tezli_ders_sayisi: tezli.detay?.ders_asamasi || 0,
                tezli_tez_sayisi: tezli.detay?.tez_asamasi || 0,
                tezli_toplam: (tezli.detay?.ders_asamasi || 0) + (tezli.detay?.tez_asamasi || 0),
                tezli_kota: tezli.kota || 14
            };
        }).sort((a, b) => b.tezli_toplam - a.tezli_toplam); // Tezli toplamına göre sırala
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
                                title="Yük ve Kota Hesaplama Yöntemi"
                                content={[
                                    {
                                        type: 'list',
                                        items: [
                                            "Akademik Filtre: Sadece 'Prof. Dr.', 'Doç. Dr.' ve 'Dr. Öğr. Üyesi' unvanları listelenir. (Arş. Gör. hariç tutulmuştur).",
                                            "🔴 Tezli (Tez Aşaması): Derslerini bitirmiş, tez yazan öğrenciler (Yüksek İş Yükü).",
                                            "🔵 Tezli (Ders Aşaması): Henüz ders alan öğrenciler.",
                                            "⚪ Tezsiz: Proje bazlı öğrenciler (Düşük İş Yükü)."
                                        ]
                                    },
                                    {
                                        type: 'bold',
                                        text: "Kota Çizgisi: Tezli Programlar yönetmeliğine göre belirlenen 14 Öğrenci sınırını temsil eder. Tezsiz öğrenciler bu kotaya dahil edilmez."
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
                        margin={{ top: 15, right: 20, left: 150, bottom: 50 }}
                        barCategoryGap="10%"
                        onClick={(data) => {
                            if (data && data.activePayload && data.activePayload[0]) {
                                const payload = data.activePayload[0].payload;
                                const advisor = advisors.find(a => a.ad_soyad === payload.ad_soyad);
                                if (advisor) {
                                    setSelectedAdvisorId(advisor.personel_id);
                                    setModalOpen(true);
                                }
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                        
                        {/* X Ekseni: Öğrenci Sayısı (0-18) */}
                        <XAxis
                            type="number"
                            domain={[0, 18]}
                            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                            tickFormatter={(value) => value.toString()}
                            allowDecimals={false}
                            label={{ 
                                value: 'Öğrenci Sayısı', 
                                position: 'insideBottom', 
                                offset: -5,
                                style: { fill: '#64748B', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
                            }}
                        />
                        
                        {/* Y Ekseni: Hoca İsimleri */}
                        <YAxis
                            type="category"
                            dataKey="ad_soyad"
                            width={145}
                            tick={(props) => <CustomYAxisTick {...props} chartData={chartData} />}
                            tickLine={false}
                            interval={0}
                        />
                        
                        {/* Referans Çizgisi: X=14 (Tezli Kotası) */}
                        <ReferenceLine
                            x={14}
                            stroke="#EF4444"
                            strokeWidth={2.5}
                            strokeDasharray="6 4"
                            label={{
                                value: "Kota: 14",
                                position: "top",
                                fill: "#EF4444",
                                fontSize: 9,
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                offset: 3
                            }}
                            isFront={true}
                        />
                        
                        {/* Tooltip */}
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Stacked Bars */}
                        {/* 1. Tezsiz (En Dip) - Gri */}
                        <Bar
                            dataKey="tezsiz_sayisi"
                            stackId="a"
                            fill="#E5E7EB"
                            name="Tezsiz YL"
                            radius={[0, 6, 6, 0]}
                        />
                        
                        {/* 2. Tezli Ders (Orta) - Mavi */}
                        <Bar
                            dataKey="tezli_ders_sayisi"
                            stackId="a"
                            fill="#3B82F6"
                            name="Tezli (Ders Aşaması)"
                            radius={[0, 0, 0, 0]}
                        />
                        
                        {/* 3. Tezli Tez (En Üst) - Kırmızı */}
                        <Bar
                            dataKey="tezli_tez_sayisi"
                            stackId="a"
                            fill="#EF4444"
                            name="Tezli (Tez Aşaması)"
                            radius={[6, 0, 0, 6]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-6 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#E5E7EB]"></div>
                    <span className="text-xs text-slate-600 font-medium">Tezsiz YL</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#3B82F6]"></div>
                    <span className="text-xs text-slate-600 font-medium">Tezli (Ders)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#EF4444]"></div>
                    <span className="text-xs text-slate-600 font-medium">Tezli (Tez)</span>
                </div>
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                    <div className="w-4 h-2 border-t-2 border-b-2 border-dashed border-[#EF4444]"></div>
                    <span className="text-xs text-slate-600 font-medium">Kota (14)</span>
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
