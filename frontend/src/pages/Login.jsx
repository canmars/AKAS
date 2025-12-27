import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('academic'); // 'academic' or 'admin'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Giriş başarısız');
            }

            if (data.success) {
                // Token ve user bilgisini kaydet
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Remember me özelliği
                if (formData.remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Backend'den gelen redirectUrl'e yönlendir
                navigate(data.user.redirectUrl || '/');
            } else {
                setError(data.message || 'Giriş başarısız');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Sol Taraf - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Arka plan görseli - Bina/Kampüs */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2070&auto=format&fit=crop)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(1.5px)'
                    }}
                ></div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/85 to-slate-900/70"></div>

                {/* İçerik */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-white">
                    {/* Logo */}
                    <div className="mb-8 bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30">
                        <GraduationCap className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>

                    {/* Başlık - Beyaz renk */}
                    <h1 className="text-6xl font-bold mb-3 tracking-tight text-white" style={{ fontWeight: 700 }}>
                        AKAS
                    </h1>
                    <p className="text-lg text-slate-300 font-normal mb-12" style={{ fontWeight: 400 }}>
                        Akademik Karar Destek Sistemi
                    </p>

                    {/* Alt çizgi */}
                    <div className="w-20 h-0.5 bg-blue-500 rounded-full mb-12"></div>

                    {/* Alt bilgi */}
                    <div className="absolute bottom-12 text-center">
                        <p className="text-slate-400 text-sm font-normal" style={{ fontWeight: 400 }}>
                            Dokuz Eylül Üniversitesi
                        </p>
                    </div>
                </div>
            </div>

            {/* Sağ Taraf - Form */}
            <div className="flex-1 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-md">
                    {/* Başlık */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                            Sisteme Giriş
                        </h2>
                        <p className="text-gray-600 font-normal" style={{ fontWeight: 400 }}>
                            Devam etmek için lütfen giriş yapınız.
                        </p>
                    </div>

                    {/* Tab Seçici */}
                    <div className="flex mb-8 bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm transition-all duration-200 ${activeTab === 'academic'
                                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                : 'text-gray-600 hover:text-gray-900 font-medium'
                                }`}
                            style={{ fontWeight: activeTab === 'academic' ? 600 : 500 }}
                        >
                            Akademisyen Girişi
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm transition-all duration-200 ${activeTab === 'admin'
                                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                : 'text-gray-600 hover:text-gray-900 font-medium'
                                }`}
                            style={{ fontWeight: activeTab === 'admin' ? 600 : 500 }}
                        >
                            Yönetici Girişi
                        </button>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800 font-medium" style={{ fontWeight: 500 }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                                Kurumsal E-Posta
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all font-normal"
                                placeholder="ad.soyad@deu.edu.tr"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ fontWeight: 400 }}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all pr-12 font-normal"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ fontWeight: 400 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Beni Hatırla Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={formData.remember}
                                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 text-sm text-gray-700 font-medium cursor-pointer"
                                style={{ fontWeight: 500 }}
                            >
                                Beni Hatırla
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2 group"
                            style={{ fontWeight: 600 }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Giriş yapılıyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>Giriş Yap</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Alt Bilgi */}
                    <div className="mt-12 text-center space-y-2">
                        <p className="text-xs text-gray-500 font-normal" style={{ fontWeight: 400 }}>
                            Dokuz Eylül Üniversitesi
                        </p>
                        <p className="text-xs text-gray-400 font-normal" style={{ fontWeight: 400 }}>
                            Yönetim Bilişim Sistemleri © 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
