import React, { useState } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    Download,
    Bell,
    CheckCircle,
    Clock,
    GraduationCap,
    FileText,
    ChevronRight,
    Eye,
    Edit,
} from 'lucide-react';

const StudentDetailModal = ({ student, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !student) return null;

    const { profil, danisman, akademik_durum, surec_takibi, risk_analizi } = student;
    const isTezli = surec_takibi?.tezli !== null;
    const isDoktora = profil?.program?.program_adi?.toLowerCase().includes('doktora');

    // Get current semester courses
    const currentCourses = akademik_durum?.alinan_dersler?.filter(course => {
        // Filter for current semester - you may need to adjust this logic
        return course.donem_tipi && course.akademik_yil;
    }) || [];

    // Get TİK meetings
    const tikMeetings = surec_takibi?.tezli?.tik_toplantilari || [];
    const nextTikMeeting = tikMeetings.find(tik => !tik.rapor_verildi_mi);

    // Get stage history
    const stageHistory = [
        ...(tikMeetings.map((tik, index) => ({
            type: 'tik',
            title: `Tez İzleme Komitesi (TİK) ${index + 1}`,
            date: tik.toplanti_tarihi,
            status: tik.rapor_verildi_mi ? 'completed' : 'in_progress',
            result: tik.sonuc,
            reportUrl: tik.rapor_icerigi
        }))),
        ...(surec_takibi?.tezli?.tez_durumu ? [{
            type: 'thesis_proposal',
            title: 'Tez Önerisi Savunması',
            date: surec_takibi.tezli.tez_durumu.baslangic_tarihi,
            status: 'completed',
            result: 'Kabul',
            thesisTitle: surec_takibi.tezli.tez_durumu.baslik
        }] : []),
        ...(surec_takibi?.doktora?.yeterlik_sinavlari?.map(sinav => ({
            type: 'proficiency',
            title: 'Yeterlik Sınavı',
            date: sinav.sinav_tarihi,
            status: 'completed',
            result: sinav.sonuc === 'Basarili' ? 'Oy Birliği ile Başarılı' : sinav.sonuc
        })) || [])
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const tabs = [
        { id: 'overview', label: 'Genel Bakış' },
        { id: 'courses', label: 'Dersler ve Notlar' },
        { id: 'thesis', label: 'Tez Süreci' },
        { id: 'reports', label: 'Raporlar' },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Devam Ediyor': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Devam Ediyor' },
            'Tamamlandı': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Tamamlandı' },
            'Başarılı': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Başarılı' },
            'Kabul': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Kabul' },
            'Oy Birliği ile Başarılı': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Oy Birliği ile Başarılı' },
        };
        const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}>
                {statusInfo.label}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Main Container */}
            <div className="absolute inset-0 flex">
                {/* Left Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Profile Section */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
                                {profil.ad_soyad.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{profil.ad_soyad}</h2>
                            <p className="text-sm text-gray-600 mb-2">
                                {isDoktora ? 'Doktora Öğrencisi' : 'Yüksek Lisans Öğrencisi'}
                            </p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Aktif Öğrenci
                            </span>
                        </div>

                        {/* Academic Summary */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">GNO</span>
                                <span className="text-lg font-bold text-gray-900">{profil.gno?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">KREDİ</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {akademik_durum?.toplam_kredi || 0}/{akademik_durum?.toplam_kredi || 0}
                                </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Öğrenci No</p>
                                <p className="text-sm text-gray-900">{profil.ogrenci_no}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">E-posta</p>
                                <p className="text-sm text-gray-900 break-all">{profil.eposta || profil.kurumsal_email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Telefon</p>
                                <p className="text-sm text-gray-900">{profil.telefon || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Kayıt Tarihi</p>
                                <p className="text-sm text-gray-900">{formatDate(profil.kayit_tarihi)}</p>
                            </div>
                        </div>

                        {/* Download Transcript Button */}
                        <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            <Download className="w-4 h-4" />
                            Transkript İndir
                        </button>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Breadcrumb */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Ana Sayfa</span>
                            <ChevronRight className="w-4 h-4" />
                            <span>Öğrencilerim</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">{profil.ad_soyad} ({profil.ogrenci_no})</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-white">
                        <div className="flex gap-1 px-6">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const isDisabled = tab.id === 'thesis' && !isTezli && !isDoktora;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => !isDisabled && setActiveTab(tab.id)}
                                        disabled={isDisabled}
                                        className={`
                                            px-4 py-3 border-b-2 font-medium text-sm transition-colors
                                            ${isActive
                                                ? 'border-blue-600 text-blue-600'
                                                : isDisabled
                                                ? 'border-transparent text-gray-400 cursor-not-allowed'
                                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {activeTab === 'overview' && (
                            <OverviewContent
                                student={student}
                                nextTikMeeting={nextTikMeeting}
                                stageHistory={stageHistory}
                                currentCourses={currentCourses}
                                formatDate={formatDate}
                                getStatusBadge={getStatusBadge}
                            />
                        )}
                        {activeTab === 'courses' && (
                            <CoursesContent student={student} formatDate={formatDate} getStatusBadge={getStatusBadge} />
                        )}
                        {activeTab === 'thesis' && (
                            <ThesisContent student={student} formatDate={formatDate} />
                        )}
                        {activeTab === 'reports' && (
                            <ReportsContent student={student} formatDate={formatDate} />
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
};

// Overview Tab Content
const OverviewContent = ({ student, nextTikMeeting, stageHistory, currentCourses, formatDate, getStatusBadge }) => {
    return (
        <div className="space-y-6">
            {/* Bekleyen İşlem Card */}
            {nextTikMeeting && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-bl-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Bekleyen İşlem</h3>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Tez İzleme Komitesi (TİK) Raporu</h4>
                            <p className="text-sm text-gray-700 mb-1">
                                Öğrencinin {nextTikMeeting.toplanti_no || '2'}. TİK toplantısı raporunun sisteme girilmesi gerekmektedir.
                            </p>
                            <p className="text-sm text-gray-600">
                                Son tarih: {formatDate(nextTikMeeting.toplanti_tarihi)}
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                            Raporu Şimdi Gir
                        </button>
                        <GraduationCap className="absolute bottom-4 right-4 w-16 h-16 text-blue-200/50" />
                    </div>
                </div>
            )}

            {/* Aşama Geçmişi */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Aşama Geçmişi</h3>
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Tümünü Gör
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Planned Stage */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="w-0.5 h-16 bg-gray-200"></div>
                        </div>
                        <div className="flex-1 pb-6">
                            <p className="text-xs font-medium text-gray-500 mb-1">Planlanan: Aralık 2024</p>
                            <h4 className="font-semibold text-gray-900 mb-1">Tez Savunma Sınavı</h4>
                            <p className="text-sm text-gray-600">Jüri ataması bekleniyor.</p>
                        </div>
                    </div>

                    {/* In Progress Stage */}
                    {nextTikMeeting && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="w-0.5 h-16 bg-gray-200"></div>
                            </div>
                            <div className="flex-1 pb-6">
                                <p className="text-xs font-medium text-blue-600 mb-1">Süreçte</p>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    Tez İzleme Komitesi (TİK) {nextTikMeeting.toplanti_no || '2'}
                                </h4>
                                <p className="text-sm text-gray-600">Toplantı tutanağı ve gelişme raporu bekleniyor.</p>
                            </div>
                        </div>
                    )}

                    {/* Completed Stages */}
                    {stageHistory.filter(s => s.status === 'completed').slice(0, 3).map((stage, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                {index < stageHistory.filter(s => s.status === 'completed').length - 1 && (
                                    <div className="w-0.5 h-16 bg-gray-200"></div>
                                )}
                            </div>
                            <div className="flex-1 pb-6">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Tamamlandı • {formatDate(stage.date)}
                                </p>
                                <h4 className="font-semibold text-gray-900 mb-2">{stage.title}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(stage.result)}
                                    {stage.reportUrl && (
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            Raporu Görüntüle
                                        </button>
                                    )}
                                </div>
                                {stage.thesisTitle && (
                                    <p className="text-sm text-gray-600 italic">"{stage.thesisTitle}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bu Dönem Dersleri */}
            {currentCourses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Bu Dönem Dersleri</h3>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            <Edit className="w-4 h-4" />
                            Not Girişi Yap
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">KOD</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DERS ADI</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">KREDİ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DURUM</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">HARF NOTU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentCourses.map((course, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {course.dersler?.ders_kodu || course.ders_kodu || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {course.dersler?.ders_adi || course.ders_adi || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {course.dersler?.kredisi || course.akts || 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(course.basarili_mi ? 'Tamamlandı' : 'Devam Ediyor')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                                <option>{course.not_kodu || 'Seçiniz'}</option>
                                                <option>AA</option>
                                                <option>BA</option>
                                                <option>BB</option>
                                                <option>CB</option>
                                                <option>CC</option>
                                                <option>DC</option>
                                                <option>DD</option>
                                                <option>FD</option>
                                                <option>FF</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Courses Tab Content
const CoursesContent = ({ student, formatDate, getStatusBadge }) => {
    const { akademik_durum } = student;
    const courses = akademik_durum?.alinan_dersler || [];

    // Group by semester
    const coursesBySemester = courses.reduce((acc, course) => {
        const semester = `${course.akademik_yil} ${course.donem_tipi || ''}` || 'Belirtilmemiş';
        if (!acc[semester]) acc[semester] = [];
        acc[semester].push(course);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ders Geçmişi</h3>
                <div className="space-y-6">
                    {Object.entries(coursesBySemester).map(([semester, semesterCourses]) => (
                        <div key={semester}>
                            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                {semester}
                            </h4>
                            <div className="space-y-2">
                                {semesterCourses.map((course, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-2 px-3 rounded hover:bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {course.dersler?.ders_kodu || course.ders_kodu} - {course.dersler?.ders_adi || course.ders_adi}
                                            </p>
                                            <p className="text-sm text-gray-600">Kredi: {course.dersler?.kredisi || course.akts || 0}</p>
                                        </div>
                                        <span className={`px-3 py-1 font-semibold rounded text-sm ${
                                            ['FF', 'FD'].includes(course.not_kodu)
                                                ? 'bg-red-100 text-red-800'
                                                : ['AA', 'BA'].includes(course.not_kodu)
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {course.not_kodu || '-'}
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

// Thesis Tab Content
const ThesisContent = ({ student, formatDate }) => {
    const { surec_takibi } = student;
    const tezliData = surec_takibi?.tezli;

    return (
        <div className="space-y-6">
            {tezliData?.tez_durumu && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tez Bilgileri</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Tez Başlığı</p>
                            <p className="text-base text-gray-900">{tezliData.tez_durumu.baslik || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Durum</p>
                            <p className="text-base text-gray-900">{tezliData.tez_durumu.durum || '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {tezliData?.tik_toplantilari && tezliData.tik_toplantilari.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">TİK Toplantıları</h3>
                    <div className="space-y-4">
                        {tezliData.tik_toplantilari.map((tik, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">TİK {index + 1}</p>
                                        <p className="text-sm text-gray-600">{formatDate(tik.toplanti_tarihi)}</p>
                                    </div>
                                    {tik.sonuc && (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                            tik.sonuc === 'Basarili' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tik.sonuc}
                                        </span>
                                    )}
                                </div>
                                {tik.rapor_icerigi && (
                                    <p className="text-sm text-gray-700 mt-2">{tik.rapor_icerigi}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Reports Tab Content
const ReportsContent = ({ student, formatDate }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raporlar</h3>
            <p className="text-gray-600">Raporlar burada görüntülenecek.</p>
        </div>
    );
};

export default StudentDetailModal;
