/**
 * Stage Tracking Queries
 * Aşama takibi için veritabanı sorguları
 */

import { supabaseAdmin } from '../connection.js';

/**
 * Aşama takibi özet verileri
 */
export async function getStageTrackingSummary() {
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

    // Önceki yıl karşılaştırması (basit yaklaşım)
    const now = new Date();
    const lastYear = now.getFullYear() - 1;
    let previousYearStudents = totalStudents; // Şimdilik aynı, gerçek hesaplama yapılabilir
    const yearChange = previousYearStudents > 0 
      ? Math.round(((totalStudents - previousYearStudents) / previousYearStudents) * 100)
      : 12;

    // Riskli durum (gecikme) - gecikmesi olan öğrenciler
    const { data: delayedStudents } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select('ogrenci_id')
      .gt('gecikme_yariyil', 0);

    const riskyCount = delayedStudents?.length || 0;

    // Ortalama tamamlanma süresi (dönem cinsinden)
    const { data: mezunDurum } = await supabaseAdmin
      .from('durum_turleri')
      .select('durum_id')
      .eq('durum_kodu', 'Mezun')
      .single();

    let avgCompletion = 0;
    let expectedCompletion = 4.0;
    if (mezunDurum?.durum_id) {
      const { data: graduates } = await supabaseAdmin
        .from('ogrenci')
        .select('kayit_tarihi, mezuniyet_tarihi, program_turu_id, program_turleri!inner(program_adi)')
        .eq('durum_id', mezunDurum.durum_id)
        .not('mezuniyet_tarihi', 'is', null)
        .not('kayit_tarihi', 'is', null)
        .limit(100);

      if (graduates && graduates.length > 0) {
        const durations = graduates
          .filter(g => g.kayit_tarihi && g.mezuniyet_tarihi)
          .map(g => {
            const start = new Date(g.kayit_tarihi);
            const end = new Date(g.mezuniyet_tarihi);
            const diffTime = Math.abs(end - start);
            const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
            const diffSemesters = diffMonths / 6; // 6 ay = 1 dönem
            return diffSemesters;
          });

        if (durations.length > 0) {
          avgCompletion = durations.reduce((a, b) => a + b, 0) / durations.length;
        }
      }
    }

    // Bu dönem mezun sayısı
    const currentSemester = getCurrentSemester();
    let thisSemesterGraduates = 0;
    if (mezunDurum?.durum_id) {
      const semesterStart = getSemesterStartDate(currentSemester);
      const semesterEnd = getSemesterEndDate(currentSemester);
      
      const { count } = await supabaseAdmin
        .from('ogrenci')
        .select('*', { count: 'exact', head: true })
        .eq('durum_id', mezunDurum.durum_id)
        .gte('mezuniyet_tarihi', semesterStart.toISOString().split('T')[0])
        .lte('mezuniyet_tarihi', semesterEnd.toISOString().split('T')[0]);
      
      thisSemesterGraduates = count || 0;
    }

    return {
      totalStudents,
      yearChange: yearChange > 0 ? `+${yearChange}%` : `${yearChange}%`,
      riskyCount,
      avgCompletion: Math.round(avgCompletion * 10) / 10,
      expectedCompletion,
      thisSemesterGraduates,
      currentSemester,
    };
  } catch (error) {
    console.error('getStageTrackingSummary error:', error);
    throw error;
  }
}

/**
 * Aşama bazlı öğrenci dağılımı (detaylı)
 */
export async function getStageDistributionDetailed() {
  try {
    const { data } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select(`
        asama_kodu,
        asama_adi,
        ogrenci_id
      `);

    // Aşama bazlı gruplama
    const grouped = {};
    data?.forEach(item => {
      if (!grouped[item.asama_kodu]) {
        grouped[item.asama_kodu] = {
          stageCode: item.asama_kodu,
          stageName: item.asama_adi,
          studentCount: 0,
        };
      }
      grouped[item.asama_kodu].studentCount++;
    });

    // Aşama sırasına göre sırala
    const stageOrder = {
      'DERS_DONEMI': 1,
      'YETERLILIK': 2,
      'TEZ_ONERISI': 3,
      'TEZ_CALISMASI': 4,
      'TEZ_SAVUNMASI': 5,
    };

    const stages = Object.values(grouped)
      .sort((a, b) => (stageOrder[a.stageCode] || 99) - (stageOrder[b.stageCode] || 99));

    return { stages };
  } catch (error) {
    console.error('getStageDistributionDetailed error:', error);
    throw error;
  }
}

/**
 * Süre analizi
 */
export async function getDurationAnalysis() {
  try {
    // Tez yazım süreci ortalaması
    const { data: thesisStages } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select(`
        ogrenci_id,
        asama_adi,
        gecikme_yariyil,
        asama_kodu
      `)
      .eq('asama_kodu', 'TEZ_CALISMASI');

    let thesisAvgDuration = 0;
    let thesisExpectedDuration = 2.0;
    let thesisDelay = 0;

    if (thesisStages && thesisStages.length > 0) {
      // Tez çalışması aşamasındaki öğrencilerin ortalama süresi
      // Basit bir yaklaşım: gecikme + beklenen süre
      const durations = thesisStages.map(s => {
        const baseDuration = thesisExpectedDuration;
        const delay = s.gecikme_yariyil || 0;
        return baseDuration + delay;
      });

      if (durations.length > 0) {
        thesisAvgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        thesisDelay = thesisAvgDuration - thesisExpectedDuration;
      }
    }

    // Ders dönemi ortalaması
    const { data: courseStages } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select(`
        ogrenci_id,
        asama_adi,
        gecikme_yariyil,
        asama_kodu
      `)
      .eq('asama_kodu', 'DERS_DONEMI');

    let courseAvgDuration = 0;
    let courseExpectedDuration = 2.0;
    let courseStatus = 'Normal';

    if (courseStages && courseStages.length > 0) {
      const durations = courseStages.map(s => {
        const baseDuration = courseExpectedDuration;
        const delay = s.gecikme_yariyil || 0;
        return baseDuration + delay;
      });

      if (durations.length > 0) {
        courseAvgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const courseDelay = courseAvgDuration - courseExpectedDuration;
        courseStatus = courseDelay > 0.5 ? 'Gecikme' : 'Normal';
      }
    }

    return {
      thesisWriting: {
        avgDuration: Math.round(thesisAvgDuration * 10) / 10,
        expectedDuration: thesisExpectedDuration,
        delay: Math.round(thesisDelay * 10) / 10,
        status: thesisDelay > 0 ? 'Gecikme' : 'Normal',
      },
      coursePeriod: {
        avgDuration: Math.round(courseAvgDuration * 10) / 10,
        expectedDuration: courseExpectedDuration,
        status: courseStatus,
      },
    };
  } catch (error) {
    console.error('getDurationAnalysis error:', error);
    throw error;
  }
}

/**
 * Gecikme analizi ve riskli öğrenciler
 */
export async function getDelayedStudents(filters = {}) {
  try {
    // Önce gecikmesi olan öğrencileri bul
    const { data: delayedStages } = await supabaseAdmin
      .from('ogrenci_mevcut_asama')
      .select('ogrenci_id, asama_kodu, asama_adi, gecikme_yariyil')
      .gt('gecikme_yariyil', 0)
      .order('gecikme_yariyil', { ascending: false })
      .limit(50);

    if (!delayedStages || delayedStages.length === 0) {
      return { students: [] };
    }

    // Öğrenci ID'lerini topla
    const studentIds = [...new Set(delayedStages.map(s => s.ogrenci_id))];

    // Öğrenci bilgilerini çek
    let studentQuery = supabaseAdmin
      .from('ogrenci')
      .select(`
        ogrenci_id,
        ad,
        soyad,
        ogrenci_no,
        program_turu_id,
        danisman_id,
        program_turleri!inner(program_adi, program_kodu)
      `)
      .in('ogrenci_id', studentIds);

    // Filtreler
    if (filters.programId) {
      studentQuery = studentQuery.eq('program_turu_id', filters.programId);
    }

    if (filters.advisorId) {
      studentQuery = studentQuery.eq('danisman_id', filters.advisorId);
    }

    const { data: studentsData } = await studentQuery;

    // Danışman bilgilerini çek
    const advisorIds = [...new Set(studentsData?.map(s => s.danisman_id).filter(Boolean) || [])];
    const { data: advisorsData } = advisorIds.length > 0
      ? await supabaseAdmin
          .from('akademik_personel')
          .select('personel_id, ad, soyad, unvan')
          .in('personel_id', advisorIds)
      : { data: [] };

    const advisorsMap = {};
    advisorsData?.forEach(a => {
      advisorsMap[a.personel_id] = a;
    });

    // Öğrenci-stage eşleştirmesi
    const stageMap = {};
    delayedStages.forEach(s => {
      if (!stageMap[s.ogrenci_id]) {
        stageMap[s.ogrenci_id] = s;
      }
    });

    // Sonuçları birleştir
    const students = studentsData?.map(student => {
      const stage = stageMap[student.ogrenci_id];
      const advisor = advisorsMap[student.danisman_id];
      
      return {
        studentId: student.ogrenci_id,
        name: `${student.ad || ''} ${student.soyad || ''}`.trim(),
        studentNo: student.ogrenci_no || '',
        program: student.program_turleri?.program_adi || '',
        programCode: student.program_turleri?.program_kodu || '',
        currentStage: stage?.asama_adi || '',
        stageCode: stage?.asama_kodu || '',
        advisor: advisor ? `${advisor.unvan || ''} ${advisor.ad || ''} ${advisor.soyad || ''}`.trim() : '',
        delaySemesters: stage?.gecikme_yariyil || 0,
        delayStatus: (stage?.gecikme_yariyil || 0) >= 3 ? 'critical' : (stage?.gecikme_yariyil || 0) >= 2 ? 'high' : 'medium',
      };
    }) || [];

    // Gecikme süresine göre sırala
    students.sort((a, b) => b.delaySemesters - a.delaySemesters);

    return { students };
  } catch (error) {
    console.error('getDelayedStudents error:', error);
    throw error;
  }
}

/**
 * Yardımcı fonksiyonlar
 */
function getCurrentSemester() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  if (month >= 8 || month <= 0) {
    return `${year}-${year + 1} Güz`;
  } else {
    return `${year - 1}-${year} Bahar`;
  }
}

function getSemesterStartDate(semester) {
  const [yearRange, term] = semester.split(' ');
  const [startYear] = yearRange.split('-');
  const year = parseInt(startYear);
  
  if (term === 'Güz') {
    return new Date(year, 8, 1); // Eylül
  } else {
    return new Date(year, 1, 1); // Şubat
  }
}

function getSemesterEndDate(semester) {
  const [yearRange, term] = semester.split(' ');
  const [startYear] = yearRange.split('-');
  const year = parseInt(startYear);
  
  if (term === 'Güz') {
    return new Date(year, 0, 31); // Ocak sonu
  } else {
    return new Date(year, 5, 30); // Haziran sonu
  }
}

