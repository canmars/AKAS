import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Users,
    UserCheck,
    BookOpen,
    LayoutDashboard,
    Menu,
    X,
    ChevronRight,
    Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/',
            icon: LayoutDashboard,
            description: 'Genel Bakış'
        },
        {
            name: 'Öğrenci Analizi',
            path: '/student-analysis',
            icon: Users,
            description: 'Öğrenci İstatistikleri'
        },
        {
            name: 'Danışman Analizi',
            path: '/advisor-analysis',
            icon: UserCheck,
            description: 'Danışman Yük Dağılımı'
        },
        {
            name: 'Ders Analizi',
            path: '/course-analysis',
            icon: BookOpen,
            description: 'Ders Performansı'
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={2} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ fontWeight: 600 }}>
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 font-normal" style={{ fontWeight: 400 }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Tip Section */}
                    <div className="p-4 border-t border-gray-100 mt-auto">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-lg shadow-blue-100 relative overflow-hidden group">
                            <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Settings className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="text-[10px] font-black text-white/90 uppercase tracking-[0.1em]">
                                        Sistem Notu
                                    </p>
                                </div>
                                <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                                    Detaylı akademik raporlar için filtreleme araçlarını kullanın.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
