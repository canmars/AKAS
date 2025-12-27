import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FunnelStep = ({ label, value, subValue, colorClass, badge, width }) => {
    const bgColors = {
        blue: 'bg-blue-100/50 text-blue-700',
        lightBlue: 'bg-blue-50 text-blue-600',
        pink: 'bg-pink-50 text-pink-600',
        green: 'bg-emerald-50 text-emerald-700',
    };

    return (
        <div className="flex items-center group h-12">
            <div className="w-32 text-sm font-medium text-slate-600">{label}</div>
            <div className="flex-1 relative h-10 ml-4">
                <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-between px-4 transition-all duration-500 overflow-hidden ${bgColors[colorClass] || bgColors.blue}`}
                    style={{ width: `${width}%` }}
                >
                    <div className="font-bold whitespace-nowrap">{value}</div>
                    <div className="flex items-center gap-2">
                        {subValue && <span className="text-[10px] opacity-70 whitespace-nowrap">{subValue}</span>}
                        {badge && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge.type === 'danger' ? 'bg-red-500 text-white' :
                                badge.type === 'warning' ? 'bg-amber-500 text-white' :
                                    'bg-blue-500 text-white'
                                }`}>
                                {badge.text}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProcessFunnel = () => {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFunnel = async () => {
            try {
                const data = await api.get('/dashboard/funnel');
                // Calculate max value for relative widths
                const maxVal = Math.max(...data.map(d => parseInt(d.value) || 1));

                const mappedSteps = data.map((item, index) => ({
                    label: item.label,
                    value: `${item.value} Öğrenci`,
                    subValue: item.sub_value,
                    badge: item.badge_text ? { text: item.badge_text, type: item.badge_type } : null,
                    colorClass: index === data.length - 1 ? 'green' : 'blue',
                    width: Math.max(30, (parseInt(item.value) / maxVal) * 100)
                }));
                setSteps(mappedSteps);
            } catch (error) {
                console.error("Error fetching funnel:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFunnel();
    }, []);

    if (loading) return <div className="ads-card p-6 h-full animate-pulse">
        <div className="h-6 w-48 bg-slate-100 mb-10" />
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
        </div>
    </div>;

    return (
        <div className="ads-card p-6 h-full">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-lg font-bold text-slate-800">Akademik Süreç Hunisi (Funnel)</h2>
                <button className="text-blue-600 text-sm font-medium hover:underline">Detaylar</button>
            </div>
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <FunnelStep key={index} {...step} />
                ))}
            </div>
        </div>
    );
};

export default ProcessFunnel;
