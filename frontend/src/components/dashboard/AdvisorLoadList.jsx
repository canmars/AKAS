
import React from 'react';

const AdvisorLoadList = ({ advisors }) => {
    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'NA';
    };

    // Force colors for specific mock names to match screenshot strictly
    const getAvatarColor = (name) => {
        if (name.includes('Yılmaz')) return 'bg-blue-100 text-blue-600';
        if (name.includes('Kaya')) return 'bg-purple-100 text-purple-600';
        if (name.includes('Demir')) return 'bg-emerald-100 text-emerald-600';
        if (name.includes('Vural')) return 'bg-gray-100 text-gray-500';

        const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
        let hash = 0;
        const safeName = name || '';
        for (let i = 0; i < safeName.length; i++) {
            hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const topAdvisors = (advisors || [])
        .sort((a, b) => (b.currentStudents || b.currentCount || 0) - (a.currentStudents || a.currentCount || 0))
        .slice(0, 5);

    // Mock data normalized
    const displayAdvisors = topAdvisors.length > 0 ? topAdvisors : [
        { name: 'Prof. Dr. A. Yılmaz', currentStudents: 14, maxCapacity: 15 },
        { name: 'Doç. Dr. B. Kaya', currentStudents: 8, maxCapacity: 12 },
        { name: 'Dr. C. Demir', currentStudents: 3, maxCapacity: 8 },
        { name: 'Dr. E. Vural', izindemi: true }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Danışman Yükü</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-6">
                    {displayAdvisors.map((advisor, index) => {
                        const name = advisor.name || advisor.unvan || 'Danışman';
                        const currentCount = advisor.currentStudents || advisor.currentCount || 0;
                        const maxCapacity = advisor.maxCapacity || 10;
                        const percentage = maxCapacity > 0 ? Math.round((currentCount / maxCapacity) * 100) : 0;

                        return (
                            <div key={index} className="flex items-center gap-4 group cursor-default">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-110 ${getAvatarColor(name)}`}>
                                    {getInitials(name)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
                                        {advisor.izindemi ? (
                                            <span className="text-xs text-gray-400 font-semibold tracking-wide">İzinli</span>
                                        ) : (
                                            <span className="text-xs text-gray-500 font-medium">{currentCount}/{maxCapacity}</span>
                                        )}
                                    </div>

                                    {!advisor.izindemi ? (
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                        </div>
                                    ) : (
                                        <div className="h-2 w-full bg-gray-50 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdvisorLoadList;
