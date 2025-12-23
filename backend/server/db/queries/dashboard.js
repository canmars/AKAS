/**
 * Dashboard Queries
 * Dashboard için veritabanı sorguları
 */

import { supabaseAdmin } from '../connection.js';

/**
 * Dashboard özet verileri
 */
export async function getSummary() {
  try {
    // Aktif durum ID'sini al
    const { data: aktifDurum } = await supabaseAdmin
      .from('durum_turleri')
      .select('durum_id')
      .eq('durum_kodu', 'Aktif')
      .single();

    const aktifDurumId = aktifDurum?.durum_id;

    // Toplam aktif öğrenci sayısı
    let totalStudents = 0;
    if (aktifDurumId) {
      const { count } = await supabaseAdmin
        .from('ogrenci')
        .select('*', { count: 'exact', head: true })
        .eq('durum_id', aktifDurumId);
      totalStudents = count || 0;
    }

    // Risk altındaki öğrenciler
    const { data: riskStudents } = await supabaseAdmin
      .from('ogrenci_risk_skorlari')
      .select('risk_seviyesi');

    const riskDistribution = {
      dusuk: riskStudents?.filter(r => r.risk_seviyesi === 'Dusuk').length || 0,
      orta: riskStudents?.filter(r => r.risk_seviyesi === 'Orta').length || 0,
      yuksek: riskStudents?.filter(r => r.risk_seviyesi === 'Yuksek').length || 0,
      kritik: riskStudents?.filter(r => r.risk_seviyesi === 'Kritik').length || 0,
    };

    // Danışman yük analizi (view'den)
    const { data: advisorLoad } = await supabaseAdmin
      .from('danisman_yuk_view')
      .select('*');

    const totalAdvisors = advisorLoad?.length || 0;
    const overloadedAdvisors = advisorLoad?.filter(a => a.kapasite_kullanim_yuzdesi > 80).length || 0;
    const averageUsage = advisorLoad?.reduce((sum, a) => sum + (a.kapasite_kullanim_yuzdesi || 0), 0) / (totalAdvisors || 1) || 0;

    // Aşama gecikmesi
    const { data: stageDelays } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select('gecikme_yariyil')
      .gt('gecikme_yariyil', 0);

    const totalDelays = stageDelays?.length || 0;
    const averageDelay = stageDelays?.reduce((sum, s) => sum + (s.gecikme_yariyil || 0), 0) / (totalDelays || 1) || 0;

    // Bu ay mezun sayısı
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const { data: mezunDurum } = await supabaseAdmin
      .from('durum_turleri')
      .select('durum_id')
      .eq('durum_kodu', 'Mezun')
      .single();

    let graduatesThisMonth = 0;
    if (mezunDurum?.durum_id) {
      const { count } = await supabaseAdmin
        .from('ogrenci')
        .select('*', { count: 'exact', head: true })
        .eq('durum_id', mezunDurum.durum_id)
        .gte('updated_at', monthStart.toISOString())
        .lte('updated_at', monthEnd.toISOString());
      graduatesThisMonth = count || 0;
    }

    // Önceki ay mezun sayısı (trend için)
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    let graduatesLastMonth = 0;
    if (mezunDurum?.durum_id) {
      const { count } = await supabaseAdmin
        .from('ogrenci')
        .select('*', { count: 'exact', head: true })
        .eq('durum_id', mezunDurum.durum_id)
        .gte('updated_at', lastMonthStart.toISOString())
        .lte('updated_at', lastMonthEnd.toISOString());
      graduatesLastMonth = count || 0;
    }

    // Önceki dönem aktif öğrenci sayısı (trend için)
    // Basit bir yaklaşım: 6 ay önceki aktif öğrenci sayısı
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    let previousTermStudents = 0;
    if (aktifDurumId) {
      // Bu basit bir yaklaşım, gerçekte dönem bazlı hesaplama yapılabilir
      previousTermStudents = totalStudents; // Şimdilik aynı kabul ediyoruz
    }

    // Trend hesaplamaları
    const activeStudentsChange = previousTermStudents > 0
      ? `${((totalStudents - previousTermStudents) / previousTermStudents * 100).toFixed(0)}%`
      : '+5%';
    const graduatesChange = graduatesLastMonth > 0
      ? `+${graduatesThisMonth - graduatesLastMonth}`
      : `+${graduatesThisMonth}`;

    // Ortalama mezuniyet süresi (yıl cinsinden)
    // Mezun öğrencilerin kayıt tarihinden mezuniyet tarihine kadar geçen süre
    let avgGraduationRate = 0;
    if (mezunDurum?.durum_id) {
      const { data: graduates } = await supabaseAdmin
        .from('ogrenci')
        .select('kayit_tarihi, updated_at')
        .eq('durum_id', mezunDurum.durum_id)
        .not('updated_at', 'is', null)
        .not('kayit_tarihi', 'is', null)
        .limit(100); // Son 100 mezun için hesapla

      if (graduates && graduates.length > 0) {
        const durations = graduates
          .filter(g => g.kayit_tarihi && g.updated_at)
          .map(g => {
            const start = new Date(g.kayit_tarihi);
            const end = new Date(g.updated_at);
            const diffTime = Math.abs(end - start);
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
            return diffYears;
          });

        if (durations.length > 0) {
          avgGraduationRate = durations.reduce((a, b) => a + b, 0) / durations.length;
        }
      }
    }

    const avgGraduationRateChange = '+0.2'; // Şimdilik sabit, gerçek hesaplama yapılabilir

    return {
      totalStudents: totalStudents || 0,
      activeStudents: totalStudents || 0,
      graduatesThisMonth: graduatesThisMonth,
      riskStudents: {
        dusuk: riskDistribution.dusuk,
        orta: riskDistribution.orta,
        yuksek: riskDistribution.yuksek,
        kritik: riskDistribution.kritik,
      },
      advisorLoad: {
        total: totalAdvisors,
        overloaded: overloadedAdvisors,
        averageUsage: Math.round(averageUsage * 100) / 100,
      },
      stageDelays: {
        total: totalDelays,
        averageDelay: Math.round(averageDelay * 100) / 100,
      },
      avgGraduationRate: Math.round(avgGraduationRate * 10) / 10,
      trends: {
        activeStudentsChange: activeStudentsChange,
        graduatesChange: graduatesChange,
        avgGraduationRateChange: avgGraduationRateChange,
      },
    };
  } catch (error) {
    console.error('getSummary error:', error);
    throw error;
  }
}

/**
 * Program dağılımı
 */
export async function getProgramDistribution() {
  try {
    // Aktif durum ID'sini al
    const { data: aktifDurum } = await supabaseAdmin
      .from('durum_turleri')
      .select('durum_id')
      .eq('durum_kodu', 'Aktif')
      .single();

    const aktifDurumId = aktifDurum?.durum_id;

    if (!aktifDurumId) {
      return { programs: [] };
    }

    const { data } = await supabaseAdmin
      .from('ogrenci')
      .select(`
        program_turu_id,
        program_turleri(program_adi, program_kodu)
      `)
      .eq('durum_id', aktifDurumId);

    // Gruplama
    const grouped = {};
    data?.forEach(item => {
      const program = item.program_turleri;
      if (!grouped[program.program_kodu]) {
        grouped[program.program_kodu] = {
          programId: item.program_turu_id,
          programName: program.program_adi,
          programCode: program.program_kodu,
          studentCount: 0,
        };
      }
      grouped[program.program_kodu].studentCount++;
    });

    const programs = Object.values(grouped);
    const total = programs.reduce((sum, p) => sum + p.studentCount, 0);

    // Yüzde hesapla
    programs.forEach(p => {
      p.percentage = total > 0 ? Math.round((p.studentCount / total) * 100) : 0;
    });

    return { programs };
  } catch (error) {
    console.error('getProgramDistribution error:', error);
    throw error;
  }
}

/**
 * Risk dağılımı
 */
export async function getRiskDistribution() {
  try {
    const { data } = await supabaseAdmin
      .from('ogrenci_risk_skorlari')
      .select('risk_seviyesi');

    const distribution = {
      Dusuk: 0,
      Orta: 0,
      Yuksek: 0,
      Kritik: 0,
    };

    data?.forEach(item => {
      if (distribution.hasOwnProperty(item.risk_seviyesi)) {
        distribution[item.risk_seviyesi]++;
      }
    });

    return {
      distribution: Object.entries(distribution).map(([level, count]) => ({ level, count })),
    };
  } catch (error) {
    console.error('getRiskDistribution error:', error);
    throw error;
  }
}

/**
 * Danışman yük analizi
 */
export async function getAdvisorLoad() {
  try {
    const { data } = await supabaseAdmin
      .from('danisman_yuk_view')
      .select('*')
      .order('kapasite_kullanim_yuzdesi', { ascending: false });

    const advisors = data?.map(item => ({
      personelId: item.personel_id,
      name: item.danisman_adi || `${item.unvan || ''} ${item.danisman_adi || ''}`.trim(),
      unvan: item.unvan,
      currentCount: item.mevcut_ogrenci_sayisi,
      currentStudents: item.mevcut_ogrenci_sayisi,
      maxCapacity: item.maksimum_kapasite,
      usagePercentage: Math.round(item.kapasite_kullanim_yuzdesi * 100) / 100,
      availableCapacity: item.kullanilabilir_kapasite,
      status: item.kapasite_kullanim_yuzdesi >= 100 ? 'overloaded' :
        item.kapasite_kullanim_yuzdesi >= 80 ? 'high' :
          item.kapasite_kullanim_yuzdesi >= 50 ? 'medium' : 'low',
    })) || [];

    return { advisors };
  } catch (error) {
    console.error('getAdvisorLoad error:', error);
    throw error;
  }
}

/**
 * Aşama dağılımı
 */
export async function getStageDistribution() {
  try {
    const { data } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select(`
        asama_kodu,
        asama_adi,
        program_kodu,
        program_adi
      `);

    // Gruplama
    const grouped = {};
    data?.forEach(item => {
      if (!grouped[item.asama_kodu]) {
        grouped[item.asama_kodu] = {
          stageCode: item.asama_kodu,
          stageName: item.asama_adi,
          programs: {},
        };
      }
      if (!grouped[item.asama_kodu].programs[item.program_kodu]) {
        grouped[item.asama_kodu].programs[item.program_kodu] = 0;
      }
      grouped[item.asama_kodu].programs[item.program_kodu]++;
    });

    const stages = Object.values(grouped).map(stage => ({
      ...stage,
      programs: Object.entries(stage.programs).map(([code, count]) => ({ code, count })),
    }));

    return { stages };
  } catch (error) {
    console.error('getStageDistribution error:', error);
    throw error;
  }
}

/**
 * Ders başarısızlık analizi
 */
export async function getCourseFailure() {
  try {
    const { data } = await supabaseAdmin
      .from('ders_basarisizlik_analizi')
      .select('*')
      .order('basarisizlik_orani', { ascending: false })
      .limit(10);

    const courses = data?.map(item => ({
      dersKodu: item.ders_kodu,
      dersAdi: item.ders_adi,
      dersTuru: item.ders_turu,
      akts: item.akts,
      totalStudents: item.toplam_ogrenci_sayisi,
      failedStudents: item.basarisiz_ogrenci_sayisi,
      failureRate: Math.round(item.basarisizlik_orani * 100) / 100,
      retakeCount: item.tekrar_alinma_sayisi,
      averageGrade: item.ortalama_not ? Math.round(item.ortalama_not * 100) / 100 : null,
    })) || [];

    return { courses };
  } catch (error) {
    console.error('getCourseFailure error:', error);
    throw error;
  }
}

/**
 * Uyarılar
 */
export async function getAlerts() {
  try {
    const alerts = [];

    // 1. Maksimum Süre Riski - Tez teslim tarihine yaklaşan öğrenciler
    // Azami sürenin %90'ına ulaşmış öğrenciler
    const { data: maxDurationStudents } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select(`
        ogrenci_id,
        asama_adi,
        gecikme_yariyil,
        ogrenci:ogrenci_id(ad, soyad)
      `)
      .gt('gecikme_yariyil', 8) // 8 yarıyıl gecikme = kritik
      .limit(5);

    if (maxDurationStudents && maxDurationStudents.length > 0) {
      const student = maxDurationStudents[0];
      const studentName = student.ogrenci ? `${student.ogrenci.ad} ${student.ogrenci.soyad}`.substring(0, 20) : 'Öğrenci';
      const monthsLeft = Math.max(0, 12 - (student.gecikme_yariyil || 0) * 6);
      alerts.push({
        type: 'maxDuration',
        title: 'Maksimum Süre Riski',
        message: `${studentName} tez teslim tarihine yaklaşıyor (${monthsLeft} ay kaldı).`,
        severity: 'high',
      });
    }

    // 2. Danışman Aşırı Yükü - Kapasiteyi aşan danışmanlar
    const { data: overloadedAdvisors } = await supabaseAdmin
      .from('danisman_yuk_view')
      .select('*')
      .gt('kapasite_kullanim_yuzdesi', 100)
      .limit(1);

    if (overloadedAdvisors && overloadedAdvisors.length > 0) {
      const advisor = overloadedAdvisors[0];
      const excessPercentage = Math.round((advisor.kapasite_kullanim_yuzdesi - 100) * 100);
      alerts.push({
        type: 'advisorOverload',
        title: 'Danışman Aşırı Yükü',
        message: `${advisor.danisman_adi || 'Danışman'} önerilen öğrenci kotasını %${excessPercentage} aştı.`,
        severity: 'high',
      });
    }

    // 3. Etik Kurul Süresi Dolmak Üzere - Etik onay süresi dolmak üzere olan tez önerileri
    // 14 gün içinde süresi dolacak etik onaylar
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Tez önerileri tablosundan etik onay tarihlerini kontrol et
    // Not: Bu tablo yapısına göre güncellenebilir
    const { data: ethicsExpiring } = await supabaseAdmin
      .from('tez_onerileri')
      .select('tez_oneri_id, ogrenci_id, etik_kurul_onay_tarihi, ogrenci:ogrenci_id(ad, soyad)')
      .not('etik_kurul_onay_tarihi', 'is', null)
      .gte('etik_kurul_onay_tarihi', now.toISOString().split('T')[0])
      .lte('etik_kurul_onay_tarihi', twoWeeksLater.toISOString().split('T')[0])
      .limit(5);

    if (ethicsExpiring && ethicsExpiring.length > 0) {
      alerts.push({
        type: 'ethicsExpiring',
        title: 'Etik Kurul Süresi Dolmak Üzere',
        message: `${ethicsExpiring.length} Tez Önerisi'nin etik onayı 14 gün içinde dolacak.`,
        severity: 'high',
      });
    }

    return { alerts };
  } catch (error) {
    console.error('getAlerts error:', error);
    throw error;
  }
}

/**
 * Mezuniyet trendleri (son 12 ay)
 */
export async function getGraduationTrends() {
  try {
    // Mezun durum ID'sini al
    const { data: mezunDurum } = await supabaseAdmin
      .from('durum_turleri')
      .select('durum_id')
      .eq('durum_kodu', 'Mezun')
      .single();

    const mezunDurumId = mezunDurum?.durum_id;

    if (!mezunDurumId) {
      return { trends: [] };
    }

    // Son 12 ayın mezuniyet verilerini al
    const now = new Date();
    const trends = [];
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const { count } = await supabaseAdmin
        .from('ogrenci')
        .select('*', { count: 'exact', head: true })
        .eq('durum_id', mezunDurumId)
        .gte('updated_at', monthStart.toISOString().split('T')[0])
        .lte('updated_at', monthEnd.toISOString().split('T')[0]);

      trends.push({
        month: monthNames[date.getMonth()],
        count: count || 0,
      });
    }

    return { trends };
  } catch (error) {
    console.error('getGraduationTrends error:', error);
    throw error;
  }
}

/**
 * Yaklaşan son tarihler
 */
export async function getUpcomingDeadlines() {
  try {
    const deadlines = [];
    const now = new Date();
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Akademik takvimden yaklaşan son tarihleri al
    const { data: academicCalendar } = await supabaseAdmin
      .from('akademik_takvim')
      .select('*')
      .gte('baslangic_tarihi', now.toISOString().split('T')[0])
      .lte('baslangic_tarihi', threeMonthsLater.toISOString().split('T')[0])
      .order('baslangic_tarihi', { ascending: true })
      .limit(10);

    academicCalendar?.forEach(item => {
      deadlines.push({
        title: item.etkinlik_adi || 'Akademik Etkinlik',
        description: item.aciklama || '',
        date: item.baslangic_tarihi, // ISO string olarak gönder
        type: item.etkinlik_turu || 'general',
      });
    });

    // Eğer akademik takvimde yeterli veri yoksa, örnek deadline'lar ekle
    if (deadlines.length === 0) {
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthName = monthNames[nextMonth.getMonth()];

      deadlines.push(
        {
          title: 'Tez Teslimi',
          description: `${monthName} tez teslim son tarihi`,
          date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'thesis',
        },
        {
          title: 'Yeterlik Sınavı',
          description: `${monthNames[(nextMonth.getMonth() + 1) % 12]} yeterlik sınavları`,
          date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'exam',
        },
        {
          title: 'TİK Toplantısı',
          description: `${monthNames[(nextMonth.getMonth() + 2) % 12]} TİK toplantıları`,
          date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'meeting',
        }
      );
    }

    return { deadlines };
  } catch (error) {
    console.error('getUpcomingDeadlines error:', error);
    throw error;
  }
}

