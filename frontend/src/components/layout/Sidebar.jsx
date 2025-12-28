import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    Users,
    UserCheck,
    BookOpen,
    LayoutDashboard,
    X,
    ChevronRight,
    Settings,
    BarChart3,
    TrendingUp,
    FileText,
    HelpCircle,
    Sparkles,
    LogOut,
    Copy
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: 'Ana Sayfa',
            path: '/',
            icon: LayoutDashboard,
        },
        {
            name: 'Öğrenci Analizi',
            path: '/student-analysis',
            icon: Users,
        },
        {
            name: 'Danışman Analizi',
            path: '/advisor-analysis',
            icon: UserCheck,
        },
        {
            name: 'Ders Analizi',
            path: '/course-analysis',
            icon: BookOpen,
        },
        {
            name: 'Raporlar',
            path: '/reports',
            icon: BarChart3,
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar - VARDIS Style */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen bg-white border-r border-gray-200
                    transform transition-all duration-300 ease-in-out z-50
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    w-64
                    shadow-xl lg:shadow-sm
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h1 className="text-center text-sm font-bold text-gray-900">DEÜ YBS</h1>
                        <p className="text-center text-xs text-gray-500">Akademik Takip Sistemi</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200 font-medium text-sm
                                        ${active 
                                            ? 'bg-blue-50 text-blue-700' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-100">
                        {/* Hızlı Erişim Bölümü */}
                        <div className="p-4 bg-gray-50">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Hızlı Erişim
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                                Öğrenci raporları ve analiz araçlarına kolay erişim
                            </p>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Raporları Aç
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 space-y-2">
                            <Link
                                to="/settings"
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Ayarlar</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
