import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    const navLinks = [
        { name: 'Bölüm Özeti', path: '/' },
        { name: 'Ders Analizi', path: '/course-analysis' },
        { name: 'Öğrenci Takibi', path: '/students' },
        { name: 'Simülasyon', path: '/simulation' },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-110">A</div>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter shadow-blue-500/10">AKAS</span>
                    </Link>
                    <nav className="hidden md:flex gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-base font-bold px-5 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                        ? 'text-blue-600 bg-blue-50 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <button className="relative p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                    <div className="w-11 h-11 bg-gray-200 rounded-2xl overflow-hidden border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="Profile" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
