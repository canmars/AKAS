import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('academic'); // academic, admin
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication for now
        navigate('/');
    };

    return (
        <div className="min-h-screen flex">
            {/* Branding Sidebar */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                    alt="Campus"
                    className="absolute inset-0 w-full h-full object-cover opacity-40" // Reduced opacity, removed blend mode for better text contrast
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30"></div> {/* Stronger gradient */}

                <div className="relative z-10 w-full p-20 flex flex-col justify-end text-white">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-6xl drop-shadow-md">🎓</span>
                            <h1 className="text-6xl font-black tracking-tighter drop-shadow-md text-white">AKAS</h1>
                        </div>
                        <p className="text-2xl font-bold text-white leading-relaxed max-w-lg drop-shadow-md">
                            Akademik Karar Destek Sistemi
                        </p>
                    </div>

                    <div className="space-y-6">
                        <p className="text-lg text-slate-400 font-medium border-l-4 border-blue-500 pl-6 leading-relaxed">
                            Veri odaklı akademik gelecek için güvenli, hızlı ve profesyonel yönetim paneli.
                        </p>

                        {/* Slider Indicators (Visual) */}
                        <div className="flex gap-2 mt-12">
                            <div className="w-12 h-1.5 bg-blue-500 rounded-full"></div>
                            <div className="w-2 h-1.5 bg-slate-600 rounded-full"></div>
                            <div className="w-2 h-1.5 bg-slate-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center bg-white p-8">
                <div className="w-full max-w-[400px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Hesabınıza Erişin</h2>
                        <p className="text-slate-500 font-medium">Lütfen kurum kimliğinizle giriş yapın.</p>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 mb-8">
                        <button
                            onClick={() => setUserType('academic')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${userType === 'academic' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Akademisyen Girişi
                        </button>
                        <button
                            onClick={() => setUserType('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${userType === 'admin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Yönetici Girişi
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">Kurumsal E-posta</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    placeholder="ad.soyad@universite.edu.tr"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">Şifre</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium tracking-widest"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Beni Hatırla</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                Şifremi Unuttum?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Giriş Yap
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center space-y-4">
                        <p className="text-xs text-slate-400 font-medium">
                            Giriş yapmakta sorun mu yaşıyorsunuz? <a href="#" className="text-blue-600 hover:underline">Bilgi İşlem</a> ile iletişime geçin.
                        </p>
                        <p className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                            © 2024 AKAS. Tüm hakları saklıdır. v2.0.1
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
