import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AcademicStaff = () => {
    // Mock Data for now, will replace with API later
    const stats = {
        total: 34,
        totalGrowth: 2,
        vacancy: 45,
        vacancyGrowth: 12, // percentage
        highLoad: 8,
        highLoadPercentage: 23
    };

    const staffList = [
        { id: 1, name: 'Prof. Dr. Ahmet Yılmaz', title: 'Bilgisayar Müh.', area: 'Yapay Zeka', load: 3, maxLoad: 10, lastActive: '2 gün önce', img: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random' },
        { id: 2, name: 'Doç. Dr. Ayşe Kaya', title: 'Yazılım Müh.', area: 'Yazılım, DevOps', load: 8, maxLoad: 12, lastActive: 'Dün', img: 'https://ui-avatars.com/api/?name=Ayse+Kaya&background=random' },
        { id: 3, name: 'Dr. Mehmet Demir', title: 'Siber Güvenlik', area: 'Ağ Güvenliği', load: 15, maxLoad: 15, lastActive: 'Bugün', img: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=random' },
        { id: 4, name: 'Dr. Zeynep Çelik', title: 'Tasarım', area: 'UX/UI', load: 1, maxLoad: 8, lastActive: '1 hafta önce', img: 'https://ui-avatars.com/api/?name=Zeynep+Celik&background=random' },
    ];

    const loadDistributionData = {
        labels: ['DÜŞÜK', 'ORTA', 'YÜKSEK', 'DOLU'],
        datasets: [
            {
                label: 'Akademisyen Sayısı',
                data: [5, 12, 10, 7], // Mock
                backgroundColor: [
                    '#34d399', // Green
                    '#60a5fa', // Blue
                    '#fbbf24', // Orange
                    '#f87171', // Red
                ],
                borderRadius: 12,
                barThickness: 50,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                borderWidth: 1,
                borderColor: '#f3f4f6'
            }
        },
        scales: {
            y: { display: false },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 12, weight: 'bold' },
                    color: '#94a3b8'
                }
            }
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            {/* Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Akademik Kadro Yönetimi</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Bölüm genelindeki yük dağılımını analiz edin ve veriye dayalı atamalar yapın.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-4 bg-white border-2 border-gray-50 rounded-[20px] shadow-sm text-sm font-black text-gray-700 hover:border-blue-100 hover:bg-blue-50 transition-all flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Yeni Akademisyen
                    </button>
                    <button className="px-6 py-4 bg-blue-600 text-white rounded-[20px] shadow-xl shadow-blue-200 text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Rapor İndir
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TOPLAM AKADEMİSYEN</p>
                            <h3 className="text-5xl font-black text-gray-900 mt-4 leading-none">{stats.total}</h3>
                            <div className="mt-6 flex items-center gap-2 text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl inline-flex">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                {stats.totalGrowth} Yeni Katılım
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BOŞ KONTENJAN</p>
                            <h3 className="text-5xl font-black text-gray-900 mt-4 leading-none">{stats.vacancy}</h3>
                            <div className="mt-6 flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl inline-flex">
                                %{stats.vacancyGrowth} Artış
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border-2 border-red-500 shadow-xl shadow-red-50 relative overflow-hidden group transition-all">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">YÜKSEK YÜKLÜ KADRO</p>
                            <h3 className="text-5xl font-black text-red-600 mt-4 leading-none">{stats.highLoad}</h3>
                            <p className="mt-6 text-xs font-black text-red-600">
                                Kadronun %{stats.highLoadPercentage}'ü <span className="opacity-50">doluluk sınırında.</span>
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:rotate-12 transition-transform">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Staff List and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Staff List */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Akademisyen Listesi</h3>
                        <div className="flex bg-white p-1.5 rounded-xl border border-gray-100 gap-1">
                            <button className="p-2.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                            <button className="p-2.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">ÖĞRETM ÜYESİ</th>
                                    <th className="px-8 py-5">UZMANLIK ALANI</th>
                                    <th className="px-8 py-5">MEVCUT YÜK</th>
                                    <th className="px-8 py-5">SON İŞLEM</th>
                                    <th className="px-8 py-5 text-right">AKSİYON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {staffList.map(staff => {
                                    const loadPercentage = Math.round((staff.load / staff.maxLoad) * 100);
                                    let loadColor = 'text-green-600';
                                    let loadBg = 'bg-green-500';
                                    let statusText = 'Müsait';

                                    if (loadPercentage > 80) {
                                        loadColor = 'text-red-600';
                                        loadBg = 'bg-red-500';
                                        statusText = 'Dolu';
                                    } else if (loadPercentage > 50) {
                                        loadColor = 'text-blue-600';
                                        loadBg = 'bg-blue-600';
                                        statusText = 'Normal';
                                    }

                                    return (
                                        <tr key={staff.id} className="hover:bg-blue-50/20 transition-all cursor-pointer group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[18px] border-2 border-white shadow-md overflow-hidden ring-4 ring-gray-50 group-hover:ring-blue-100 transition-all">
                                                        <img src={staff.img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-base group-hover:text-blue-600 transition-colors uppercase tracking-tight">{staff.name}</div>
                                                        <div className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{staff.title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {staff.area.split(', ').map((tag, i) => (
                                                        <span key={i} className="px-3 py-1 bg-gray-100/60 text-gray-500 text-[10px] font-black rounded-lg group-hover:bg-white transition-colors">{tag}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl border-4 border-gray-50 relative flex items-center justify-center">
                                                        <div className={`absolute inset-0 rounded-xl border-4 ${loadColor.replace('text', 'border')} opacity-20`}></div>
                                                        <span className={`text-[10px] font-black ${loadColor}`}>{loadPercentage}%</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 tracking-tight">{staff.load} / {staff.maxLoad}</div>
                                                        <div className={`text-[10px] font-black uppercase tracking-wider ${loadColor}`}>{statusText}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-500">{staff.lastActive}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="px-5 py-2.5 rounded-xl text-xs font-black bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">DETAY</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Load Chart */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 flex flex-col h-full hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Yük Dağılımı</h3>
                                <p className="text-sm font-medium text-gray-400 mt-2">Bölüm geneli yoğunluk analizi</p>
                            </div>
                            <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                        </div>

                        <div className="h-[280px] mb-10">
                            <Bar data={loadDistributionData} options={chartOptions} />
                        </div>

                        <div className="space-y-4 bg-gray-50/50 p-6 rounded-[28px]">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">ORTALAMA YÜK</span>
                                <span className="text-lg font-black text-gray-900">8.4 <span className="text-[11px] opacity-40">Öğrenci</span></span>
                            </div>
                            <div className="h-px bg-gray-100 w-full"></div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">KRİTİK SINIR</span>
                                <span className="text-lg font-black text-red-600">12+ <span className="text-[11px] opacity-40">Öğrenci</span></span>
                            </div>
                        </div>

                        <button className="w-full mt-10 py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.1em] hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">
                            Analiz Raporu Oluştur
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AcademicStaff;
