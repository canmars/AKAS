import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, Settings, ChevronDown, LogOut, User } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

    useEffect(() => {
        // Kullanıcı bilgilerini localStorage'dan al
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
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
            'Danisman': 'Danışman'
        };
        return roleMap[role] || role;
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo ve Başlık */}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900" style={{ fontWeight: 700 }}>
                                AKAS
                            </h1>
                            <p className="text-xs text-gray-500 font-normal" style={{ fontWeight: 400 }}>
                                Akademik Karar Destek Sistemi
                            </p>
                        </div>
                    </div>

                    {/* Sağ Taraf - Bildirim, Ayarlar, Kullanıcı */}
                    <div className="flex items-center gap-2">

                        {/* Bildirimler */}
                        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ fontWeight: 700, fontSize: '10px' }}>
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Ayarlar */}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>

                        {/* Kullanıcı Menüsü */}
                        {user && (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-semibold text-gray-900" style={{ fontWeight: 600 }}>
                                            {user.ad_soyad}
                                        </p>
                                        <p className="text-xs text-gray-500 font-normal" style={{ fontWeight: 400 }}>
                                            {getRoleDisplayName(user.role)}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setDropdownOpen(false)}
                                        ></div>

                                        {/* Menu */}
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900" style={{ fontWeight: 600 }}>
                                                    {user.ad_soyad}
                                                </p>
                                                <p className="text-xs text-gray-500 font-normal mt-0.5" style={{ fontWeight: 400 }}>
                                                    {user.email}
                                                </p>
                                                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded" style={{ fontWeight: 600 }}>
                                                    {getRoleDisplayName(user.role)}
                                                </span>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        // Navigate to profile
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profilim
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        // Navigate to settings
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Ayarlar
                                                </button>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-200 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-semibold"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Çıkış Yap
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
