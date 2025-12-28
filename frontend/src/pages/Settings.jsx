import React from 'react';
import { Settings as SettingsIcon, Wrench } from 'lucide-react';

const Settings = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <SettingsIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
                    </div>
                    <p className="text-gray-500 ml-[60px]">Sistem ayarlarını yönetin.</p>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-6">
                            <Wrench className="w-10 h-10 text-blue-600" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Ayarlar Sayfası Yakında Eklenecek
                        </h2>
                        <p className="text-gray-500 leading-relaxed">
                            Sistem ayarları, kullanıcı tercihleri ve diğer yapılandırma seçenekleri 
                            için ayarlar sayfası üzerinde çalışıyoruz.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;

