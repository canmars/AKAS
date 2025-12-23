import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LayoutDashboard, ChevronRight, HelpCircle, Phone, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('danisman'); // 'danisman' | 'yonetici'
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        // Basic role logic matching the legacy code
        const role = selectedRole === 'danisman' ? 'Danisman' : 'Bolum_Baskani';
        localStorage.setItem('userRole', role);
        navigate('/dashboard');
    };

    const handleDevSkip = () => {
        localStorage.setItem('userRole', 'Bolum_Baskani');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 relative flex font-sans">

            {/* Dev Skip Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={handleDevSkip}
                    className="px-3 py-2 text-xs bg-gray-200 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-300 transition-colors font-medium"
                    title="Development: Doğrudan dashboard'a geç"
                >
                    Dev Skip
                </button>
            </div>

            {/* Header (Absolute) */}
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 px-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <LayoutDashboard className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">AKAS</h1>
                        <p className="text-[10px] text-gray-400 font-bold tracking-[0.15em] uppercase">Karar Analiz Sistemi</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors flex items-center gap-2">
                        <HelpCircle size={16} />
                        <span>Yardım</span>
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors flex items-center gap-2">
                        <Phone size={16} />
                        <span>İletişim</span>
                    </button>
                </div>
            </header>

            {/* Left Section - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white lg:bg-transparent z-20">
                <div className="w-full max-w-[440px]">

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-10">
                        {/* Badge */}
                        <div className="mb-8">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-blue-50 text-blue-600 uppercase">
                                Giriş Yap
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">AKAS'a Hoşgeldiniz</h2>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Dokuz Eylül Üniversitesi YBS Bölümü Karar Destek Sistemi</p>

                        {/* Role Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                            <button
                                onClick={() => setSelectedRole('danisman')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedRole === 'danisman' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Danışman
                            </button>
                            <button
                                onClick={() => setSelectedRole('yonetici')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedRole === 'yonetici' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Yönetici
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Kurumsal E-posta</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="kullanici@deu.edu.tr"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-700">Şifre</label>
                                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Şifremi Unuttum?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                            >
                                Giriş Yap
                                <ArrowRight size={18} />
                            </button>
                        </form>

                    </div>
                </div>
            </div>

            {/* Right Section - Visual */}
            <div className="hidden lg:flex flex-1 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Patterns */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-lg text-white">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                        <LayoutDashboard className="text-white" size={32} />
                    </div>

                    <h3 className="text-5xl font-bold mb-6 leading-tight">Veri Odaklı <br /> Kararlar</h3>
                    <p className="text-lg text-blue-100 leading-relaxed font-medium">
                        Lisansüstü eğitim süreçlerini takip etmek, analiz etmek ve stratejik kararları desteklemek için geliştirilmiş yeni nesil platform.
                    </p>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/15 transition-colors cursor-default">
                            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <LayoutDashboard size={20} />
                            </div>
                            <h4 className="font-bold text-sm">YBS Bölümü</h4>
                            <p className="text-xs text-blue-200 mt-1">Özelleştirilmiş yönetim paneli</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/15 transition-colors cursor-default">
                            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <LayoutDashboard size={20} />
                            </div>
                            <h4 className="font-bold text-sm">Analitik Takip</h4>
                            <p className="text-xs text-blue-200 mt-1">Gerçek zamanlı veri analizi</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 text-center text-blue-200/60 text-xs font-medium">
                    © 2024 Dokuz Eylül Üniversitesi - Yönetim Bilişim Sistemleri
                </div>
            </div>

        </div>
    );
};

export default Login;
