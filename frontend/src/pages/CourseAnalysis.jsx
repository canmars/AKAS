import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import DetailModal from '../components/common/DetailModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const CourseAnalysis = () => {
    const [targetSuccess, setTargetSuccess] = useState(80);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data for Bell Curve
    const bellCurveData = {
        labels: ['0.0', '1.0', '2.0', '3.0', '4.0'],
        datasets: [
            {
                label: 'Ort. Yoğunluğu',
                data: [5, 15, 45, 85, 30],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            }
        ]
    };

    // Modal Chart Data
    const barChartData = {
        labels: ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF'],
        datasets: [{
            label: 'Öğrenci Sayısı',
            data: [5, 8, 12, 18, 25, 15, 10, 28],
            backgroundColor: (ctx) => {
                const val = ctx.raw;
                return val > 20 ? '#ef4444' : '#64748b';
            },
            borderRadius: 8,
        }]
    };

    const donutData = {
        labels: ['Geçen', 'Kalan'],
        datasets: [{
            data: [65, 35],
            backgroundColor: ['#2563eb', '#ef4444'],
            hoverOffset: 4,
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            y: { display: false },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 12, weight: 'bold' } }
            }
        }
    };

    const modalBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { display: false },
            x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
        }
    };

    const courses = [
        { id: 'CS101', name: 'Algoritmalara Giriş', type: 'ZORUNLU', avg: 1.84, trend: -15, risk: true, lecturer: 'Dr. Ali Yılmaz' },
        { id: 'MATH204', name: 'Ayrık Matematik', type: 'SEÇMELİ', avg: 1.92, trend: 0, risk: true, lecturer: 'Prof. Ayşe Kaya' },
        { id: 'PHYS102', name: 'Genel Fizik II', type: 'ZORUNLU', avg: 1.65, trend: -22, risk: true, lecturer: 'Dr. Mehmet Demir' },
        { id: 'ENG101', name: 'Akademik İngilizce', type: 'SEÇMELİ', avg: 2.45, trend: 5, risk: false, lecturer: 'Okutman Sarah J.' },
    ];

    const handleOpenModal = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    return (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left: Target & Stats */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Success Target Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:rotate-12">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4a1 1 0 01-.8 1.6H6a1 1 0 01-1-1V7a1 1 0 011-1h8.15l-1.87-2.5a1 1 0 010-1.2l1.87-2.5H6a1 1 0 00-1 1v11a1 1 0 102 0V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Dönemlik Başarı Hedefi: %{targetSuccess}</h3>
                                <p className="text-gray-500 font-bold mt-1 text-base">Mevcut dönem için belirlenen akademik başarı eşiği.</p>
                            </div>
                        </div>
                        <button className="px-8 py-4 bg-gray-50 text-gray-700 font-extrabold rounded-2xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Hedefi Düzenle
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <p className="text-gray-400 font-black text-xs mb-6 uppercase tracking-[0.2em]">Toplam Ders Sayısı</p>
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black text-gray-900 leading-none">42</span>
                                <span className="bg-green-50 text-green-600 text-xs font-black px-4 py-2 rounded-xl border border-green-100">+2%</span>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <p className="text-gray-400 font-black text-xs mb-6 uppercase tracking-[0.2em]">Hedef Altı Ders (Risk)</p>
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black text-red-500 leading-none">5</span>
                                <span className="bg-red-50 text-red-500 text-xs font-black px-4 py-2 rounded-xl border border-red-100">+1 (Bu hafta)</span>
                            </div>
                            <div className="absolute top-6 right-6 text-red-100 opacity-20 group-hover:opacity-40 transition-opacity">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <p className="text-gray-400 font-black text-xs mb-6 uppercase tracking-[0.2em]">Genel Geçme Ort.</p>
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black text-gray-900 leading-none">%76</span>
                                <span className="text-gray-400 text-xs font-bold mb-2">Hedefin %4 altı</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Distribution Chart */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm h-full flex flex-col">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Not Ortalaması Dağılımı</h3>
                        <p className="text-gray-500 text-sm font-bold mb-8">Tüm derslerin genel yoğunluk grafiği</p>
                        <div className="flex-1 flex flex-col justify-center relative min-h-[220px]">
                            <Line data={bellCurveData} options={chartOptions} />
                            {/* Target Line Annotation Mockup */}
                            <div className="absolute top-0 bottom-0 left-[75%] border-l-2 border-blue-600 border-dashed z-10">
                                <div className="absolute -top-8 -left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-xl shadow-blue-200 uppercase tracking-widest">Hedef</div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ort. Yoğunluğu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-0.5 border-t-2 border-blue-600 border-dashed"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hedef Çizgisi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Threshold Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-red-100 text-red-600 rounded-2xl shadow-sm shadow-red-50">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Performans Eşiği Altındaki Dersler</h2>
                        <p className="text-gray-500 font-bold text-lg mt-1">Acil müdahale veya inceleme gerektiren kritik dersler.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select className="bg-white border-2 border-gray-50 px-8 py-4 rounded-[20px] font-black text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer">
                        <option>2023-2024 Güz</option>
                        <option>2022-2023 Bahar</option>
                    </select>
                    <select className="bg-white border-2 border-gray-50 px-8 py-4 rounded-[20px] font-black text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer">
                        <option>En Düşük Ortalama</option>
                        <option>En Yüksek Risk</option>
                    </select>
                </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all p-3 group">
                        <div className="bg-white rounded-[42px] p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase bg-blue-50/50 px-4 py-1.5 rounded-xl border border-blue-100">
                                        {course.type}
                                    </span>
                                    <h4 className="text-3xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors pt-1">
                                        {course.id}
                                    </h4>
                                    <p className="text-gray-500 font-extrabold text-base tracking-tight">{course.name}</p>
                                </div>
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl border-4 border-white shadow-md overflow-hidden transform group-hover:-rotate-6 group-hover:scale-110 transition-all duration-300">
                                    <img src={`https://ui-avatars.com/api/?name=${course.lecturer}&background=random&color=fff`} alt={course.lecturer} />
                                </div>
                            </div>

                            <div className="flex justify-between items-end gap-6 pt-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Not Ortalaması</p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">{course.avg}</span>
                                        <span className={`text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 border ${course.trend < 0 ? 'text-red-500 bg-red-50 border-red-100' : course.trend > 0 ? 'text-green-500 bg-green-50 border-green-100' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                                            {course.trend < 0 ? '↓' : course.trend > 0 ? '↑' : '→'}
                                            {Math.abs(course.trend)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 h-14 flex items-end gap-2 pb-1 justify-end px-2">
                                    {[30, 45, 25, 60, 40, 75, 55].map((h, i) => (
                                        <div key={i} className={`w-3 rounded-full transition-all duration-700 ${course.risk ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-gray-200 shadow-sm shadow-gray-100'} group-hover:scale-y-110`} style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Dersi Veren</span>
                                    <span className="text-sm font-black text-gray-600">{course.lecturer}</span>
                                </div>
                                <button
                                    onClick={() => handleOpenModal(course)}
                                    className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all group/btn active:scale-95"
                                >
                                    İncele
                                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={""} // Custom header inside body
                maxWidth="max-w-6xl"
            >
                {selectedCourse && (
                    <div className="p-2 space-y-10">
                        {/* Custom Modal Header */}
                        <div className="flex justify-between items-start border-b border-gray-50 pb-8 -mt-2">
                            <div>
                                <div className="flex items-center gap-4 mb-3">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedCourse.id} - {selectedCourse.name}</h2>
                                    {selectedCourse.risk && (
                                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest shadow-sm shadow-red-50">Risk Grubunda</span>
                                    )}
                                </div>
                                <p className="text-lg text-gray-500 font-bold">Dersi Veren: {selectedCourse.lecturer} • 2023-2024 Güz Dönemi</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Letter Grade distribution */}
                            <div className="lg:col-span-8 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                                <h4 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Harf Notu Dağılımı</h4>
                                <div className="h-[250px] flex items-center justify-center">
                                    <Bar data={barChartData} options={modalBarOptions} />
                                </div>
                            </div>

                            {/* Success Donut */}
                            <div className="lg:col-span-4 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 flex flex-col">
                                <h4 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Başarı Oranı</h4>
                                <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
                                    <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Kalan</span>
                                        <span className="text-4xl font-black text-red-500 leading-none mt-1">%35</span>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3">
                                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                            <span className="text-sm font-bold text-gray-500">Geçen</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">65%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-sm font-bold text-gray-500">Kalan</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">35%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Area Alert */}
                        <div className="bg-red-50/50 p-10 rounded-[40px] border-2 border-red-50 flex items-start gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-red-200/20 pointer-events-none group-hover:scale-110 transition-transform">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="p-4 bg-white rounded-[24px] text-red-500 shadow-xl shadow-red-100 flex-shrink-0">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="relative z-10 flex-1">
                                <h5 className="text-2xl font-black text-red-600 mb-2 tracking-tight">Kritik Risk Alanı Tespiti</h5>
                                <p className="text-red-900/70 font-bold text-lg leading-relaxed max-w-2xl">
                                    Bu derste <strong className="text-red-600 underline decoration-2 underline-offset-4">FF notu alan öğrenci sayısı (28)</strong>, bölüm ortalamasının 3 katıdır. Öğrencilerin çoğu "Diziler ve Döngüler" konusunda zorlandığını belirtmektedir.
                                </p>
                            </div>
                            <button className="self-end px-8 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[20px] shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
                                Raporu İndir
                            </button>
                        </div>
                    </div>
                )}
            </DetailModal>
        </main>
    );
};

export default CourseAnalysis;
