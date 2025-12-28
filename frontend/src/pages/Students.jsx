import React, { useState } from 'react';

const Students = () => {
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: 'TOPLAM', value: '412', icon: 'users', color: 'blue' },
        { label: 'RİSKLİ', value: '%12', icon: 'alert', color: 'red' },
        { label: 'MEZUN', value: '38', icon: 'grad', color: 'green' },
    ];

    const studentData = [
        { id: '2021502034', name: 'Mehmet Demir', advisor: 'Prof. Dr. Ali Y.', gno: 2.14, status: 'Ders Tekrarı', risk: 'high' },
        { id: '2022502110', name: 'Ayşe Yılmaz', advisor: 'Doç. Dr. Zeynep K.', gno: 3.85, status: 'Tez Yazımında', risk: 'none' },
        { id: '2021502005', name: 'Caner Erkin', advisor: 'Dr. Burak T.', gno: 2.65, status: 'Öneri Aşamasında', risk: 'medium' },
        { id: '2022502220', name: 'Selin Kaya', advisor: 'Doç. Dr. Zeynep K.', gno: 3.20, status: 'Savunma Bekleniyor', risk: 'none' },
    ];

    return (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header & Stats Row */}
            <div className="flex justify-end gap-8 mb-12">


                <div className="flex flex-wrap gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white px-8 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                                    'bg-green-50 text-green-600'
                                }`}>
                                {stat.icon === 'users' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 00-7 7v1h11v-1a7 7 0 00-7-7z" /></svg>}
                                {stat.icon === 'alert' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                                {stat.icon === 'grad' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" /></svg>}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Sidebar: Filters */}
                <aside className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                Filtrele & Ara
                            </h3>
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">42 Sonuç</span>
                        </div>

                        {/* Search */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Öğrenci adı, no veya danışman..."
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white px-6 py-4 rounded-[20px] font-bold text-gray-700 outline-none transition-all placeholder:text-gray-400 pr-12"
                            />
                            <svg className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        {/* Quick Filters */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Hızlı Filtreler</p>
                            <div className="flex flex-wrap gap-2">
                                <button className="px-4 py-2 bg-gray-50 text-gray-600 text-[11px] font-black rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">Tez Savunması Yakın</button>
                                <button className="px-4 py-2 bg-red-50 text-red-600 text-[11px] font-black rounded-xl border border-red-100">Risk Grubu</button>
                                <button className="px-4 py-2 bg-gray-50 text-gray-600 text-[11px] font-black rounded-xl hover:bg-blue-50">Ders Tekrarı</button>
                            </div>
                        </div>

                        {/* Risk Status */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Risk Durumu</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Yüksek Risk', color: 'bg-red-500' },
                                    { label: 'Orta Risk', color: 'bg-yellow-500' },
                                    { label: 'Normal', color: 'bg-green-500', checked: true }
                                ].map((item, idx) => (
                                    <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-gray-200 group-hover:border-blue-200'}`}>
                                                {item.checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tez Stage */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Tez Aşaması</p>
                            <div className="space-y-3">
                                {['Öneri Bekleyen', 'Araştırma / Yazım', 'Savunma'].map((stage, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${idx === 1 ? 'bg-blue-600 border-blue-600' : 'border-gray-200 group-hover:border-blue-200'}`}>
                                            {idx === 1 && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{stage}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* GNO Slider Mockup */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">GNO Aralığı</p>
                                <span className="text-[10px] font-black text-gray-500 uppercase">2.00 - 4.00</span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full mt-4">
                                <div className="absolute left-[30%] right-0 h-full bg-blue-500 rounded-full"></div>
                                <div className="absolute left-[30%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-pointer"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-pointer"></div>
                            </div>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4">
                            Filtreleri Uygula
                        </button>
                    </div>
                </aside>

                {/* Main Content: Table/Kanban View */}
                <div className="lg:col-span-9 space-y-8">
                    {/* View Switcher & Export */}
                    <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                Tablo
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                Kanban
                            </button>
                        </div>
                        <div className="flex items-center gap-3 pr-4">
                            <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                            <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Öğrenci</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danışman</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">GNO</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tez Durumu</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {studentData.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-all cursor-pointer group">
                                        <td className="px-8 py-6 relative">
                                            {student.risk === 'high' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                <span className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{student.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${student.advisor}&background=random&color=fff`} alt={student.advisor} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-600">{student.advisor}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2 min-w-[100px]">
                                                <span className={`text-base font-black ${student.gno < 2.5 ? 'text-red-500' : 'text-green-600'}`}>{student.gno}</span>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${student.gno < 2.5 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${(student.gno / 4) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border ${student.status.includes('Ders') ? 'bg-red-50 text-red-600 border-red-100' :
                                                student.status.includes('Yazım') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    student.status.includes('Öneri') ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                        'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                {student.status === 'Ders Tekrarı' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mr-2 mb-0.5"></span>}
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Overlay-like Footer */}
                        <div className="bg-gray-50/50 p-6 flex justify-between items-center border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gösterilen: 1-4 / 412</span>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all font-black text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 font-black text-sm">1</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 font-black text-sm">2</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 font-black text-sm">...</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all font-black text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Preview Sections */}
                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Kanban Görünümü</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Kanban Column */}
                            {[
                                { title: 'Tez Önerisi', count: 14, color: 'gray' },
                                {
                                    title: 'Araştırma & Yazım', count: 28, color: 'blue', items: [
                                        { name: 'Ayşe Yılmaz', gno: 3.85, time: '1 hafta', status: 'normal' }
                                    ]
                                },
                                {
                                    title: 'Savunma', count: 3, color: 'purple', items: [
                                        { name: 'Selin Kaya', time: 'Dün', status: 'normal' }
                                    ]
                                }
                            ].map((col, idx) => (
                                <div key={idx} className="space-y-6">
                                    <div className={`p-5 rounded-2xl flex items-center justify-between border ${col.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                        col.color === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                                            'bg-gray-50 border-gray-100 text-gray-500'
                                        }`}>
                                        <span className="text-sm font-black uppercase tracking-wider">{col.title}</span>
                                        <span className="text-xs font-black px-3 py-1 bg-white/50 rounded-lg">{col.count}</span>
                                    </div>

                                    {col.items?.map((item, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all space-y-4 group">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-black text-gray-900 group-hover:text-blue-600 transition-all">{item.name}</h5>
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'normal' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            {item.gno && (
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.gno / 4) * 100}%` }}></div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-gray-100 overflow-hidden">
                                                        <img src={`https://ui-avatars.com/api/?name=Advisor&background=random&color=fff`} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400">Danışman</span>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 uppercase">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Mock Card for Risk */}
                                    {idx === 0 && (
                                        <div className="bg-white p-6 rounded-[32px] border-2 border-red-500 shadow-xl shadow-red-50 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-gray-900">Mehmet Demir</h4>
                                                <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase tracking-widest">RİSK</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-black text-gray-300">Prof. Dr. Ali Y.</span>
                                                <span className="text-[10px] font-black text-red-600 uppercase">Acil</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Students;
