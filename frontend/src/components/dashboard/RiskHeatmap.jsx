
import React from 'react';

const RiskHeatmap = () => {
    // Mock columns and rows
    const columns = [
        { id: 'yl_tez', label: 'YL (Tez)' },
        { id: 'yl_ders', label: 'YL (Ders)' },
        { id: 'doktora', label: 'Doktora' },
        { id: 'butunlesik', label: 'Bütünleşik' }
    ];

    const rows = [
        { id: 'akademik', label: 'Akademik Başarı' },
        { id: 'sure', label: 'Süre Aşımı' },
        { id: 'devamsizlik', label: 'Devamsızlık' },
        { id: 'kayit', label: 'Kayıt/Harç' }
    ];

    // Map exact colors from screenshot (Visual estimation)
    // Red: #F87171 (Light Red)
    // Orange: #FBBF24 (Amber)
    // Green: #A7F3D0 (Pale Emerald)
    // Light Green: #D1FAE5

    const getCellColor = (rowId, colId) => {
        // Hardcoded pattern to match screenshot randomness style
        const key = `${rowId}-${colId}`;
        const map = {
            'akademik-yl_tez': 'bg-[#EF4444]', // Red solid
            'akademik-yl_ders': 'bg-[#FBBF24]', // Orange
            'akademik-doktora': 'bg-[#A7F3D0]', // Green Light
            'akademik-butunlesik': 'bg-[#d1fae5]', // Very Light Green

            'sure-yl_tez': 'bg-[#F87171]', // Light Red
            'sure-yl_ders': 'bg-[#FDE68A]', // Light Yellow
            'sure-doktora': 'bg-[#A7F3D0]',
            'sure-butunlesik': 'bg-[#d1fae5]',

            'devamsizlik-yl_tez': 'bg-[#d1fae5]',
            'devamsizlik-yl_ders': 'bg-[#d1fae5]',
            'devamsizlik-doktora': 'bg-[#TPBD8]', // ?

            // Let's use a simpler consistent logic if specific mapping is too much
            // But strict screenshot matching requires specific look.
        };

        if (key === 'akademik-yl_tez') return 'bg-[#F87171]';
        if (key === 'akademik-yl_ders') return 'bg-[#FCD34D]';
        if (key === 'akademik-doktora') return 'bg-[#A7F3D0]';
        if (key === 'akademik-butunlesik') return 'bg-[#D1FAE5]';

        if (key === 'sure-yl_tez') return 'bg-[#F87171]';
        if (key === 'sure-yl_ders') return 'bg-[#FCD34D]';
        if (key === 'sure-doktora') return 'bg-[#A7F3D0]';
        if (key === 'sure-butunlesik') return 'bg-[#D1FAE5]';

        if (key === 'devamsizlik-yl_tez') return 'bg-[#D1FAE5]';
        if (key === 'devamsizlik-yl_ders') return 'bg-[#D1FAE5]';
        if (key === 'devamsizlik-doktora') return 'bg-[#FCD34D]';
        if (key === 'devamsizlik-butunlesik') return 'bg-[#F87171]';

        if (key === 'kayit-yl_tez') return 'bg-[#D1FAE5]';
        if (key === 'kayit-yl_ders') return 'bg-[#D1FAE5]';
        if (key === 'kayit-doktora') return 'bg-[#D1FAE5]';
        if (key === 'kayit-butunlesik') return 'bg-[#FCD34D]';

        return 'bg-gray-100';
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Risk Yoğunluk Haritası</h3>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span> Yüksek</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]"></span> Orta</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A7F3D0]"></span> Düşük</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {/* Header Row */}
                <div className="flex gap-3">
                    <div className="w-24 flex-shrink-0"></div> {/* Empty corner */}
                    {columns.map(col => (
                        <div key={col.id} className="flex-1 text-[11px] font-bold text-gray-400 text-center uppercase tracking-wider">{col.label}</div>
                    ))}
                </div>

                {/* Data Rows */}
                {rows.map(row => (
                    <div key={row.id} className="flex gap-3 items-center">
                        <div className="w-24 flex-shrink-0 text-xs font-bold text-gray-500 text-right pr-2">{row.label}</div>
                        {columns.map(col => (
                            <div key={`${row.id}-${col.id}`} className={`flex-1 h-12 rounded-lg ${getCellColor(row.id, col.id)} hover:opacity-90 transition-all cursor-pointer relative group`}>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap font-medium">
                                        {row.label} - {col.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskHeatmap;
