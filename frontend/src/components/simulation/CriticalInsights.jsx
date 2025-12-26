import React from 'react';

const CriticalInsights = ({ params }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kritik Öngörüler</h3>
            </div>

            <div className="space-y-6">
                {/* 1. Advisor Risk Card */}
                <div className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 flex gap-6 group hover:bg-red-50 transition-all cursor-default">
                    <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center text-red-500 shadow-sm border border-red-50 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-red-900 mb-2">Danışman Eksikliği Riski</h4>
                        <p className="text-base font-medium text-red-700/80 leading-relaxed">
                            2025 projeksiyonunda <span className="font-black text-red-600 underline decoration-2 underline-offset-4">3 öğretim üyesi</span> kritik yük sınırını (%20) aşacaktır. Yeni kadro planlaması önerilir.
                        </p>
                    </div>
                </div>

                {/* 2. Graduation Duration Card */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-8 flex gap-6 group hover:bg-amber-50 transition-all cursor-default">
                    <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center text-amber-500 shadow-sm border border-amber-50 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-amber-900 mb-2">Mezuniyet Süresi Artışı</h4>
                        <p className="text-base font-medium text-amber-700/80 leading-relaxed">
                            Danışman yükündeki artış nedeniyle ortalama tez süresinin <span className="font-black text-amber-600">6 ay</span> uzaması öngörülüyor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriticalInsights;
