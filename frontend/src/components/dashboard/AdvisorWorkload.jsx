import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdvisorBar = ({ name, value, total, colorClass, status }) => {
    const percentage = (value / total) * 100;

    const colorStyles = {
        emerald: 'bg-emerald-400',
        amber: 'bg-amber-400',
        red: 'bg-red-500',
    };

    return (
        <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="relative w-12 h-44 bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-end">
                <div
                    className={`w-full transition-all duration-700 rounded-t-lg ${colorStyles[colorClass] || 'bg-blue-400'}`}
                    style={{ height: `${percentage}%` }}
                />
            </div>
            <div className="mt-4 text-center">
                <div className={`text-[10px] font-bold ${status === 'Dolu' ? 'text-red-600' : 'text-slate-900'} whitespace-nowrap`}>
                    {name}
                </div>
                <div className={`text-[9px] font-medium ${status === 'Dolu' ? 'text-red-500' : 'text-slate-400'} mt-0.5`}>
                    {value}/{total}
                </div>
            </div>
        </div>
    );
};

const AdvisorWorkload = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const data = await api.get('/dashboard/advisor-load');
                if (!data || !Array.isArray(data)) throw new Error("Invalid advisor data");

                const mappedAdvisors = data.map(adv => {
                    const ratio = (adv.ogrenci_sayisi || 0) / (adv.tezli_kotasi || 1);
                    return {
                        name: `${adv.unvan || ''} ${(adv.ad || '')[0]}. ${adv.soyad || ''}`,
                        value: adv.ogrenci_sayisi || 0,
                        total: adv.tezli_kotasi || 1,
                        colorClass: ratio > 0.9 ? 'red' : ratio > 0.6 ? 'amber' : 'emerald',
                        status: ratio > 0.9 ? 'Dolu' : 'Uygun'
                    };
                });
                setAdvisors(mappedAdvisors.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error("Error fetching advisor load:", error);
                setAdvisors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisors();
    }, []);

    if (loading) return <div className="ads-card p-6 h-full animate-pulse flex flex-col">
        <div className="h-6 w-48 bg-slate-100 mb-8" />
        <div className="flex items-end justify-between gap-2 mt-auto">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-12 h-40 bg-slate-100 rounded-lg" />)}
        </div>
    </div>;

    return (
        <div className="ads-card p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-slate-800">Danışman İş Yükü Dağılımı</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" /> Uygun
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-red-500" /> Dolu
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 mt-auto">
                {advisors.map((advisor, index) => (
                    <AdvisorBar key={index} {...advisor} />
                ))}
            </div>
        </div>
    );
};

export default AdvisorWorkload;
