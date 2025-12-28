import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Bell,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    User,
    Menu,
    X,
    HelpCircle,
    FileText,
    Shield
} from 'lucide-react';
import { createPortal } from 'react-dom';

const Header = ({ onMenuClick, sidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 64, right: 16 });
    const [notificationPosition, setNotificationPosition] = useState({ top: 64, right: 16 });
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const userButtonRef = useRef(null);
    const notificationButtonRef = useRef(null);

    const routeTitles = {
        '/': { title: 'Dashboard' },
        '/dashboard': { title: 'Dashboard' },
        '/student-analysis': { title: 'Öğrenci Analizi' },
        '/advisor-analysis': { title: 'Danışman Analizi' },
        '/course-analysis': { title: 'Ders Analizi' },
        '/settings': { title: 'Ayarlar' },
        '/simulation': { title: 'Simülasyon' },
        '/reports': { title: 'Raporlar' }
    };

    const currentRoute = routeTitles[location.pathname] || { title: 'Panel' };

    // Mock notifications
    const notifications = [
        { id: 1, type: 'warning', title: 'Yüksek Riskli Öğrenci', message: '5 öğrenci kritik risk seviyesinde', time: '2 dakika önce', read: false },
        { id: 2, type: 'info', title: 'Tez Savunması', message: '3 tez savunması bu hafta planlandı', time: '1 saat önce', read: false },
        { id: 3, type: 'success', title: 'Yeni Kayıt', message: '12 yeni öğrenci kaydı tamamlandı', time: '3 saat önce', read: true },
        { id: 4, type: 'warning', title: 'Kota Aşımı', message: '2 danışman kotasını aştı', time: '5 saat önce', read: true }
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Calculate dropdown positions
    useEffect(() => {
        if (dropdownOpen && userButtonRef.current) {
            const rect = userButtonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [dropdownOpen]);

    useEffect(() => {
        if (notificationOpen && notificationButtonRef.current) {
            const rect = notificationButtonRef.current.getBoundingClientRect();
            setNotificationPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [notificationOpen]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                userButtonRef.current && !userButtonRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target) && 
                notificationButtonRef.current && !notificationButtonRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        navigate('/login');
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            'Bolum_Baskani': 'Bölüm Başkanı',
            'Danisman': 'Danışman',
            'Admin': 'Yönetici'
        };
        return roleMap[role] || role;
    };

    const getRoleBadgeColor = (role) => {
        const colorMap = {
            'Bolum_Baskani': 'bg-purple-100 text-purple-700 border-purple-200',
            'Danisman': 'bg-blue-100 text-blue-700 border-blue-200',
            'Admin': 'bg-red-100 text-red-700 border-red-200'
        };
        return colorMap[role] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Side - Breadcrumb */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Menu Toggle - Mobile Only */}
                            <button
                                onClick={onMenuClick}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 lg:hidden"
                                aria-label="Toggle menu"
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {/* Breadcrumb Navigation */}
                            <nav className="flex items-center gap-3 text-sm">
                                <Link 
                                    to="/" 
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                                >
                                    Ana Sayfa
                                </Link>
                                {location.pathname !== '/' && location.pathname !== '/dashboard' && (
                                    <>
                                        <svg 
                                            className="w-4 h-4 text-gray-300 flex-shrink-0" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-gray-600 font-medium">
                                            {currentRoute.title}
                                        </span>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Right Side - Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">

                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    ref={notificationButtonRef}
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {notificationOpen && createPortal(
                                    <div 
                                        className="fixed z-[99999] w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                                        style={{
                                            top: `${notificationPosition.top}px`,
                                            right: `${notificationPosition.right}px`
                                        }}
                                    >
                                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-900">Bildirimler</h3>
                                                <span className="text-xs text-gray-500 font-medium">{unreadCount} yeni</span>
                                            </div>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400">
                                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">Bildirim bulunmuyor</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <button
                                                        key={notification.id}
                                                        onClick={() => {
                                                            setNotificationOpen(false);
                                                            // Navigate based on notification type
                                                        }}
                                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                                                            !notification.read ? 'bg-blue-50/50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${
                                                                notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                                notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-green-100 text-green-600'
                                                            }`}>
                                                                {notification.type === 'warning' && '⚠️'}
                                                                {notification.type === 'info' && 'ℹ️'}
                                                                {notification.type === 'success' && '✓'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mb-2">
                                                                    {notification.message}
                                                                </p>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {notification.time}
                                                                </span>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                                            <button className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700">
                                                Tümünü Görüntüle
                                            </button>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>

                            {/* Settings */}
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                aria-label="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* User Menu */}
                            {user && (
                                <div className="relative ml-1" ref={dropdownRef}>
                                    <button
                                        ref={userButtonRef}
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                                    >
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                                <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className="text-sm font-bold text-gray-900 leading-none">
                                                {user.ad_soyad || user.ad || 'Kullanıcı'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                {getRoleDisplayName(user.role)}
                                            </p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown */}
                                    {dropdownOpen && createPortal(
                                        <div 
                                            className="fixed z-[99999] w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                                            style={{
                                                top: `${dropdownPosition.top}px`,
                                                right: `${dropdownPosition.right}px`
                                            }}
                                        >
                                            {/* User Info Header */}
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <User className="w-6 h-6 text-white" strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">
                                                            {user.ad_soyad || user.ad || 'Kullanıcı'}
                                                        </p>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {user.email || 'email@example.com'}
                                                        </p>
                                                        <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md border ${getRoleBadgeColor(user.role)}`}>
                                                            {getRoleDisplayName(user.role)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        navigate('/profile');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    Profilim
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        navigate('/settings');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <Settings className="w-4 h-4 text-gray-400" />
                                                    Ayarlar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        navigate('/help');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <HelpCircle className="w-4 h-4 text-gray-400" />
                                                    Yardım & Destek
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        navigate('/docs');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    Dokümantasyon
                                                </button>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-200"></div>

                                            {/* Logout */}
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-semibold rounded-lg"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
