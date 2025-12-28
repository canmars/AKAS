import React, { useState } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    AlertTriangle,
    BookOpen,
    FileText,
    MessageSquare,
    Send,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';

const StudentDetailModal = ({ student, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: User },
        { id: 'transcript', label: 'Transcript & Dersler', icon: BookOpen },
        { id: 'thesis', label: 'Tez & Süreç', icon: FileText },
        { id: 'notes', label: 'Notlar & Aksiyon', icon: MessageSquare },
    ];

    // Check if program is Tezli/Doktora
    const isTezli = student.surec_takibi?.tezli !== null;
    const isDoktora = student.surec_takibi?.doktora !== null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
                            {student.profil.ad_soyad.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{student.profil.ad_soyad}</h2>
                            <p className="text-blue-100">{student.profil.ogrenci_no}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex gap-1 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            // Disable thesis tab if not Tezli/Doktora
                            const isDisabled = tab.id === 'thesis' && !isTezli && !isDoktora;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                                    disabled={isDisabled}
                                    className={`
                                        flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                                        ${isActive
                                            ? 'border-blue-600 text-blue-600'
                                            : isDisabled
                                            ? 'border-transparent text-gray-400 cursor-not-allowed'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && <OverviewTab student={student} />}
                    {activeTab === 'transcript' && <TranscriptTab student={student} />}
                    {activeTab === 'thesis' && <ThesisTab student={student} />}
                    {activeTab === 'notes' && (
                        <NotesTab
                            student={student}
                            notes={notes}
                            setNotes={setNotes}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// ========== SEKME 1: GENEL BAKIŞ ==========
const OverviewTab = ({ student }) => {
    const { profil, danisman, risk_analizi, zaman_cizelgesi } = student;

    return (
        <div className="space-y-6">
            {/* Top Section: Profil + Risk Radarı */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profil Kartı */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Profil Bilgileri
                    </h3>
                    <div className="space-y-3">
                        <InfoRow icon={Mail} label="E-posta" value={profil.eposta || 'Belirtilmemiş'} />
                        <InfoRow icon={Phone} label="Telefon" value={profil.telefon || 'Belirtilmemiş'} />
                        <InfoRow icon={Calendar} label="Kayıt Tarihi" value={new Date(profil.kayit_tarihi).toLocaleDateString('tr-TR')} />
                        <InfoRow icon={BookOpen} label="Program" value={profil.program?.program_adi} />
                        <InfoRow icon={TrendingUp} label="GNO" value={profil.gno?.toFixed(2) || 'N/A'} />
                        <InfoRow icon={Calendar} label="Mevcut Yarıyıl" value={profil.mevcut_yariyil} />
                    </div>
                    {danisman && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-sm font-medium text-gray-700">Danışman</p>
                            <p className="text-base text-gray-900 font-semibold">{danisman.ad_soyad}</p>
                            <p className="text-sm text-gray-600">{danisman.eposta}</p>
                        </div>
                    )}
                </div>

                {/* Risk Radarı */}
                {risk_analizi && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Risk Analizi
                        </h3>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Risk Skoru</span>
                                <span className="text-2xl font-bold text-red-600">{risk_analizi.risk_skoru}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(risk_analizi.risk_skoru, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Seviye: <span className="font-semibold">{risk_analizi.risk_seviyesi}</span></p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Risk Faktörleri:</p>
                            {risk_analizi.risk_faktorleri && Object.entries(risk_analizi.risk_faktorleri).map(([key, value]) => {
                                if (value === false || value === 0) return null;
                                return (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                            {typeof value === 'number' && `: ${value}`}
                                            {typeof value === 'boolean' && value && ' (Var)'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Son Güncelleme: {new Date(risk_analizi.son_guncelleme).toLocaleDateString('tr-TR')}
                        </p>
                    </div>
                )}
            </div>

            {/* Zaman Çizelgesi */}
            {zaman_cizelgesi && zaman_cizelgesi.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Zaman Çizelgesi
                    </h3>
                    <div className="relative">
                        {/* Timeline */}
                        <div className="space-y-4">
                            {zaman_cizelgesi.map((asama, index) => (
                                <div key={asama.asama_id} className="flex gap-4">
                                    {/* Timeline Indicator */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                asama.tamamlandi_mi
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}
                                        >
                                            {asama.tamamlandi_mi ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <Clock className="w-5 h-5" />
                                            )}
                                        </div>
                                        {index < zaman_cizelgesi.length - 1 && (
                                            <div className="w-0.5 h-16 bg-gray-200"></div>
                                        )}
                                    </div>
                                    {/* Timeline Content */}
                                    <div className="flex-1 pb-8">
                                        <h4 className="font-semibold text-gray-900">{asama.asama_adi}</h4>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <p>Başlangıç: {new Date(asama.baslangic_tarihi).toLocaleDateString('tr-TR')}</p>
                                            {asama.bitis_tarihi && (
                                                <p>Bitiş: {new Date(asama.bitis_tarihi).toLocaleDateString('tr-TR')}</p>
                                            )}
                                        </div>
                                        {asama.tamamlandi_mi && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                Tamamlandı
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== SEKME 2: TRANSCRIPT & DERSLER ==========
const TranscriptTab = ({ student }) => {
    const { akademik_durum } = student;
    const { basarisiz_dersler, alinan_dersler } = akademik_durum;

    // Group courses by semester
    const coursesBySemester = alinan_dersler.reduce((acc, course) => {
        const semester = course.donem || 'Belirtilmemiş';
        if (!acc[semester]) acc[semester] = [];
        acc[semester].push(course);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Başarısız Dersler Uyarısı */}
            {basarisiz_dersler.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">Başarısız Dersler ({basarisiz_dersler.length})</h3>
                    </div>
                    <div className="space-y-2">
                        {basarisiz_dersler.map((course) => (
                            <div key={course.ders_id} className="bg-white rounded p-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {course.dersler.ders_kodu} - {course.dersler.ders_adi}
                                    </p>
                                    <p className="text-sm text-gray-600">Dönem: {course.donem}</p>
                                </div>
                                <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded">
                                    {course.harf_notu}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tüm Dersler (Dönem Dönem) */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ders Geçmişi</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Toplam Kredi: <span className="font-semibold">{akademik_durum.toplam_kredi}</span>
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    {Object.entries(coursesBySemester).map(([semester, courses]) => (
                        <div key={semester}>
                            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                {semester}
                            </h4>
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <div
                                        key={course.ders_id}
                                        className="flex justify-between items-center py-2 px-3 rounded hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {course.dersler.ders_kodu} - {course.dersler.ders_adi}
                                            </p>
                                            <p className="text-sm text-gray-600">Kredi: {course.dersler.kredisi}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 font-semibold rounded ${
                                                ['FF', 'FD'].includes(course.harf_notu)
                                                    ? 'bg-red-100 text-red-800'
                                                    : ['AA', 'BA'].includes(course.harf_notu)
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {course.harf_notu}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ========== SEKME 3: TEZ & SÜREÇ ==========
const ThesisTab = ({ student }) => {
    const { surec_takibi } = student;
    const tezliData = surec_takibi?.tezli;
    const doktoraData = surec_takibi?.doktora;

    return (
        <div className="space-y-6">
            {/* Doktora Yeterlik Sınavları */}
            {doktoraData?.yeterlik_sinavlari && doktoraData.yeterlik_sinavlari.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Yeterlik Sınavları
                    </h3>
                    <div className="space-y-3">
                        {doktoraData.yeterlik_sinavlari.map((sinav) => (
                            <div key={sinav.sinav_id} className="bg-white rounded-lg p-4 border border-purple-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Sınav Tarihi: {new Date(sinav.sinav_tarihi).toLocaleDateString('tr-TR')}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Puan: {sinav.puan}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded font-medium ${
                                            sinav.sonuc === 'Başarılı'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {sinav.sonuc}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TİK Toplantıları */}
            {tezliData?.tik_toplantilari && tezliData.tik_toplantilari.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        TİK Toplantı Geçmişi
                    </h3>
                    <div className="space-y-3">
                        {tezliData.tik_toplantilari.map((tik) => (
                            <div key={tik.toplanti_id} className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-gray-900">
                                        {new Date(tik.toplanti_tarihi).toLocaleDateString('tr-TR')}
                                    </p>
                                    <span
                                        className={`px-3 py-1 rounded text-sm font-medium ${
                                            tik.karar === 'Onaylandı'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {tik.karar}
                                    </span>
                                </div>
                                {tik.sonraki_toplanti && (
                                    <p className="text-sm text-gray-600">
                                        Sonraki Toplantı: {new Date(tik.sonraki_toplanti).toLocaleDateString('tr-TR')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tez Durumu */}
            {tezliData?.tez_durumu && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Tez Bilgileri
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tez Başlığı</p>
                            <p className="text-base text-gray-900 font-semibold">{tezliData.tez_durumu.tez_basligi}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Aşama</p>
                            <p className="text-base text-gray-900">{tezliData.tez_durumu.tez_asamasi}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Başlangıç</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(tezliData.tez_durumu.baslangic_tarihi).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Beklenen Bitiş</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(tezliData.tez_durumu.beklenen_bitis).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!tezliData && !doktoraData && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bu öğrenci için tez/süreç bilgisi bulunmamaktadır.</p>
                </div>
            )}
        </div>
    );
};

// ========== SEKME 4: NOTLAR & AKSİYON ==========
const NotesTab = ({ student, notes, setNotes }) => {
    const handleSendEmailToAdvisor = () => {
        if (student.danisman?.eposta) {
            window.location.href = `mailto:${student.danisman.eposta}?subject=Öğrenci: ${student.profil.ad_soyad}`;
        } else {
            alert('Danışman e-posta bilgisi bulunamadı.');
        }
    };

    const handleSendWarningToStudent = () => {
        if (student.profil.eposta) {
            window.location.href = `mailto:${student.profil.eposta}?subject=Önemli Uyarı`;
        } else {
            alert('Öğrenci e-posta bilgisi bulunamadı.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Notlar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Öğrenciye Özel Notlar
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Bu öğrenci hakkında notlarınızı buraya yazabilirsiniz..."
                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Notu Kaydet
                </button>
            </div>

            {/* Aksiyonlar */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Aksiyonlar</h3>
                <div className="space-y-3">
                    <button
                        onClick={handleSendEmailToAdvisor}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                        <Send className="w-5 h-5" />
                        Danışmana Mail At
                    </button>
                    <button
                        onClick={handleSendWarningToStudent}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors font-medium shadow-md"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Öğrenciye Uyarı Gönder
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Component
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-base text-gray-900 break-words">{value}</p>
        </div>
    </div>
);

export default StudentDetailModal;

