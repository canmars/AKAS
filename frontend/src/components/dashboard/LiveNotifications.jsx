
import React from 'react';

const LiveNotifications = ({ alerts }) => {
    const items = (alerts && alerts.length > 0) ? alerts : [
        { id: 1, type: 'ACİL', title: 'Tez Savunma Süresi Doluyor', time: '10dk önce', desc: '3 Öğrenci için azami süre bu ay bitiyor. Danışman uyarısı gönderilmeli.', action: 'Aksiyon Al →', color: 'red' },
        { id: 2, type: 'DİKKAT', title: 'Onay Bekleyen Ders Kayıtları', time: '2s önce', desc: 'Toplam 12 öğrenci danışman onayı bekliyor. Süreç %85 tamamlandı.', color: 'orange' },
        { id: 3, type: 'BİLGİ', title: 'Bölüm Kurulu', time: 'Dün', desc: "Yarın 14:00'te Rektörlük binasında toplantı planlanmıştır.", color: 'blue' }
    ];

    /* 
      Screenshot Colors:
      - Red Border: #EF4444
      - Orange Border: #F59E0B
      - Blue Border: #3B82F6
      - ACIL Text: red-600, DIKKAT text: orange-600, BILGI text: blue-600
    */

    const getBorderColor = (color) => {
        switch (color) {
            case 'red': return 'border-l-red-500';
            case 'orange': return 'border-l-orange-500';
            case 'blue': return 'border-l-blue-500';
            default: return 'border-l-gray-300';
        }
    };

    const getBadgeColor = (color) => {
        switch (color) {
            case 'red': return 'text-red-600';
            case 'orange': return 'text-orange-600';
            case 'blue': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"></div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Canlı Bildirimler</h3>
                </div>
                <div className="bg-red-50 text-red-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg">
                    {items.length}
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {items.map((item, index) => (
                    <div key={item.id || index} className={`p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow border-l-4 ${getBorderColor(item.color)}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${getBadgeColor(item.color)}`}>{item.type}</span>
                            <span className="text-[10px] font-medium text-gray-400">{item.time}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                        {item.action && (
                            <button className="mt-3 text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors group">
                                {item.action.replace('→', '')} <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-2">
                <button className="w-full py-3 bg-[#1F2937] hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-gray-200">
                    Tüm Bildirimleri Yönet
                </button>
            </div>
        </div>
    );
};

export default LiveNotifications;
