import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AlarmItem = ({ name, stage, riskScore, reason, avatar }) => {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all duration-200 group">
            <div className="relative">
                <img
                    src={avatar || 'https://i.pravatar.cc/150?u=default'}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-slate-800 truncate">{name}</h4>
                    <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[10px] font-bold">
                            {riskScore} Risk
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate">{stage}</p>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{reason}</p>
                </div>
            </div>
        </div>
    );
};

const CriticalAlarms = () => {
    const [alarms, setAlarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlarms = async () => {
            try {
                const data = await api.get('/dashboard/critical-alarms');
                if (!data || !Array.isArray(data)) throw new Error("Invalid alarm data");

                const mappedAlarms = data.map(item => ({
                    name: item.name || 'Unknown',
                    stage: item.stage || 'Unknown',
                    riskScore: (item.risk_score || 0).toString(),
                    reason: item.reason || 'No reason provided',
                    avatar: item.avatar_url
                }));
                setAlarms(mappedAlarms);
            } catch (error) {
                console.error("Error fetching alarms:", error);
                setAlarms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlarms();
    }, []);

    if (loading) return <div className="ads-card p-6 h-full animate-pulse flex flex-col">
        <div className="h-6 w-48 bg-slate-100 mb-6" />
        <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
        </div>
    </div>;

    return (
        <div className="ads-card p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">
                        <span className="mr-2">🚨</span> Kritik Öğrenci Alarmları ({alarms.length})
                    </h2>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">Tümünü Gör</button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
                {alarms.length > 0 ? (
                    alarms.map((alarm, index) => (
                        <AlarmItem key={index} {...alarm} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="text-4xl mb-4">✅</span>
                        <p className="text-sm font-medium">Kritik alarm bulunmuyor</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriticalAlarms;
