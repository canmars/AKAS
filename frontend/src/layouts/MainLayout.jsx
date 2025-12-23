import React from 'react';
import { Search, Bell, BarChart2 } from 'lucide-react';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-white px-4 h-20 fixed w-full top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border-b border-gray-100">
                <div className="max-w-[1920px] mx-auto h-full flex items-center justify-between">

                    {/* Left: Logo & Nav Links */}
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                                <BarChart2 className="text-white" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-bold text-xl leading-none tracking-tight">AKAS</span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mt-1">KARAR ANALİZ SİSTEMİ</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Panel - Active */}
                            <button className="px-5 py-2.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-600 transition-colors">
                                Panel
                            </button>
                            <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Akademik
                            </button>
                            <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Öğrenciler
                            </button>
                            <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Simülasyon
                            </button>
                        </div>
                    </div>

                    {/* Right: Search, Notifications, Profile */}
                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative hidden xl:block group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input type="text"
                                className="block w-80 pl-11 pr-4 py-3 border border-gray-100 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 sm:text-sm shadow-sm transition-all"
                                placeholder="Veri ara..." />
                        </div>

                        <div className="flex items-center gap-4 pl-4 border-l border-gray-100 h-10">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors">
                                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                <Bell className="h-6 w-6" />
                            </button>

                            {/* Profile */}
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 ring-2 ring-white shadow-sm cursor-pointer hover:ring-blue-100 transition-all">
                                <img src="https://ui-avatars.com/api/?name=Ali+Yilmaz&background=fdba74&color=fff" alt="Profile" className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    </div>

                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 min-h-screen">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
