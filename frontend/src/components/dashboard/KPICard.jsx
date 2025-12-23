import React from 'react';
import PropTypes from 'prop-types';
import { Users, GraduationCap, AlertTriangle, Clock, Info, TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon, trend, variant = 'default', actionBadge, progress, segmentedBar, avatars }) => {

    const getIcon = (iconName, isWatermark = false) => {
        // Watermark için özel stil
        const baseClass = isWatermark ? "w-32 h-32 absolute -right-6 -top-6 opacity-[0.03] text-gray-900 rotate-12" : "w-5 h-5";
        const colorClass = !isWatermark ? (variant === 'destructive' ? 'text-red-500' : 'text-gray-400') : '';

        switch (iconName) {
            case 'users': return <Users className={`${baseClass} ${colorClass}`} />;
            case 'graduation': return <GraduationCap className={`${baseClass} ${colorClass}`} />;
            case 'warning': return <AlertTriangle className={`${baseClass} ${colorClass}`} />;
            case 'clock': return <Clock className={`${baseClass} ${colorClass}`} />;
            case 'info': return <Info className={`${baseClass} ${colorClass}`} />;
            default: return null;
        }
    };

    const formatValue = (val) => {
        return typeof val === 'number' ? val.toLocaleString('tr-TR') : val;
    };

    return (
        <div className={`relative rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between overflow-hidden group ${variant === 'destructive' ? 'bg-red-50/30 border-red-100' : ''}`}>

            {/* Watermark Icon */}
            {icon && getIcon(icon, true)}

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase font-inter">{title}</h3>
                </div>

                <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-5xl font-bold text-gray-900 tracking-tight">{formatValue(value)}</span>
                    {trend && (
                        <div className={`flex items-center text-sm font-bold ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'} bg-opacity-10 px-1.5 py-0.5 rounded`}>
                            {trend.direction === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {trend.value}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-10 mt-6 md:mt-auto pt-2">
                {actionBadge && (
                    <div className="mb-3">
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            {actionBadge}
                        </span>
                    </div>
                )}

                {progress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-gray-400">
                            <span>İlerleme</span>
                            <span className={progress.color === 'green' ? 'text-emerald-600' : 'text-blue-600'}>%{progress.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progress.color === 'green' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${progress.value}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">{progress.label}</p>
                    </div>
                )}

                {segmentedBar && (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full flex gap-1 overflow-hidden p-0.5">
                            {segmentedBar.segments.map((seg, i) => (
                                <div key={i} className={`h-full rounded-full ${seg.color === 'red' ? 'bg-red-400' : seg.color === 'orange' ? 'bg-orange-400' : 'bg-yellow-400'}`} style={{ width: `${seg.width}%` }}></div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">{segmentedBar.label}</p>
                    </div>
                )}

                {avatars && (
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex -space-x-3 hover:space-x-1 transition-all">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm ${i === 0 ? 'bg-indigo-100 text-indigo-600' : i === 1 ? 'bg-pink-100 text-pink-600' : 'bg-gray-800 text-white'}`}>
                                    {i === 2 ? `+${avatars.count}` : (i === 0 ? 'AY' : 'BK')}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium text-right max-w-[80px] leading-tight">{subtitle}</p>
                    </div>
                )}

                {!progress && !segmentedBar && !avatars && !actionBadge && subtitle && (
                    <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
                )}
            </div>
        </div>
    );
};

export default KPICard;
