import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdvisorChart = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/advisors/load-distribution');
                setAdvisors(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4">Yükleniyor...</div>;

    // Mock max load per advisor type or global
    const MAX_LOAD = 20; // This could be dynamic based on title

    const getStatus = (count) => {
        if (count >= 18) return { label: 'Yüksek Yük', color: 'text-red-500', barColor: 'bg-red-500' };
        if (count >= 12) return { label: 'İdeal Yük', color: 'text-green-500', barColor: 'bg-green-500' };
        if (count >= 5) return { label: 'Orta Yük', color: 'text-amber-500', barColor: 'bg-amber-500' };
        return { label: 'Düşük Yük', color: 'text-blue-500', barColor: 'bg-blue-500' };
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Danışman İş Yükü Dağılımı</h3>
                    <p className="text-sm text-gray-500">Ders saati ve danışmanlık toplamı</p>
                </div>
                <button className="text-sm text-blue-600 font-medium flex items-center hover:underline">
                    Tümünü Gör
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar flex-1">
                {advisors.map((advisor, index) => {
                    const percentage = Math.min((advisor.mevcut_danismanlik_sayisi / MAX_LOAD) * 100, 100);
                    const status = getStatus(advisor.mevcut_danismanlik_sayisi);

                    return (
                        <div key={index} className="group relative">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover border border-gray-100"
                                        src={`https://ui-avatars.com/api/?name=${advisor.ad}+${advisor.soyad}&background=random&color=fff`}
                                        alt=""
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="text-sm font-bold text-gray-900 truncate">
                                            {advisor.unvan} {advisor.ad} {advisor.soyad}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold">
                                            <span className={status.color}>{status.label}</span>
                                            <span className={status.color}>({advisor.mevcut_danismanlik_sayisi}/{MAX_LOAD})</span>
                                        </div>
                                    </div>

                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full ${status.barColor} transition-all duration-1000`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Tooltip on Hover */}
                            <div className="absolute left-14 top-10 z-10 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                <p className="font-bold mb-1">{advisor.unvan} {advisor.ad} {advisor.soyad}</p>
                                <div className="flex justify-between py-1 border-b border-gray-700">
                                    <span>Mevcut Danışmanlık:</span>
                                    <span className="font-bold">{advisor.mevcut_danismanlik_sayisi}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-700">
                                    <span>Maks. Kapasite:</span>
                                    <span className="font-bold">{MAX_LOAD}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Doluluk Oranı:</span>
                                    <span className="font-bold">%{Math.round(percentage)}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default AdvisorChart;
