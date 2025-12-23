import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Settings } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        localStorage.setItem('userRole', role);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-4">AKAS</h1>
                    <p className="text-xl text-gray-500 font-medium tracking-wide">AKADEMİK KARAR ANALİZ SİSTEMİ</p>
                    <p className="text-sm text-gray-400 mt-6 font-medium uppercase tracking-widest">Devam etmek için rolünüzü seçin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Bölüm Başkanı */}
                    <button
                        onClick={() => handleRoleSelect('Bolum_Baskani')}
                        className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left"
                    >
                        <div className="absolute inset-0 bg-blue-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bölüm Başkanı</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                            Dashboard, detaylı analizler ve stratejik karar destek sistemi erişimi.
                        </p>
                        <span className="inline-flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                            Giriş Yap →
                        </span>
                    </button>

                    {/* Danışman */}
                    <button
                        onClick={() => handleRoleSelect('Danisman')}
                        className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left"
                    >
                        <div className="absolute inset-0 bg-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Danışman</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                            Öğrenci takibi, tez süreç yönetimi ve veri girişi işlemleri için erişim.
                        </p>
                        <span className="inline-flex items-center text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                            Giriş Yap →
                        </span>
                    </button>

                    {/* Admin */}
                    <button
                        onClick={() => handleRoleSelect('Admin')}
                        className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left"
                    >
                        <div className="absolute inset-0 bg-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        <div className="h-16 w-16 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Settings size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                            Sistem konfigürasyonu, kullanıcı yönetimi ve teknik ayarlar için erişim.
                        </p>
                        <span className="inline-flex items-center text-sm font-bold text-gray-600 group-hover:translate-x-1 transition-transform">
                            Giriş Yap →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
