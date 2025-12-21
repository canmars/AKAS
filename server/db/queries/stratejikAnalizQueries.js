/**
 * Stratejik Analiz Queries
 * Başarı trendi, danışman performansı, darboğaz analizi için veritabanı sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const stratejikAnalizQueries = {
  /**
   * Öğrenci Başarı Trendi
   * ogrenci_basari_trendi tablosundan dönem bazlı başarı verilerini getirir
   */
  async getBasariTrendi(ogrenciId = null, akademikYil = null, yariyil = null) {
    let query = supabaseAdmin
      .from('ogrenci_basari_trendi')
      .select(`
        *,
        ogrenci!inner(ogrenci_id, ad, soyad, program_turleri!inner(program_adi, program_kodu))
      `)
      .order('akademik_yil', { ascending: false })
      .order('yariyil', { ascending: false });

    if (ogrenciId) {
      query = query.eq('ogrenci_id', ogrenciId);
    }
    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }
    if (yariyil) {
      query = query.eq('yariyil', yariyil);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Danışman Performans Metrikleri
   * danisman_performans_metrikleri tablosundan performans verilerini getirir
   */
  async getDanismanPerformans(danismanId = null, akademikYil = null) {
    let query = supabaseAdmin
      .from('danisman_performans_metrikleri')
      .select(`
        *,
        akademik_personel!inner(personel_id, ad, soyad, unvan)
      `)
      .order('akademik_yil', { ascending: false });

    if (danismanId) {
      query = query.eq('danisman_id', danismanId);
    }
    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Süreç Darboğaz Analizi
   * surec_darbogaz_analizi tablosundan darboğaz verilerini getirir
   */
  async getSurecDarbogaz(asama = null, programTuruId = null, akademikYil = null) {
    let query = supabaseAdmin
      .from('surec_darbogaz_analizi')
      .select(`
        *,
        program_turleri(program_adi, program_kodu)
      `)
      .order('analiz_tarihi', { ascending: false });

    if (asama) {
      query = query.eq('asama', asama);
    }
    if (programTuruId) {
      query = query.eq('program_turu_id', programTuruId);
    }
    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Program Bazlı Başarı Karşılaştırması
   * Tüm programlar için başarı metriklerini getirir
   */
  async getProgramBazliBasari(akademikYil = null) {
    // ogrenci_basari_trendi'den program bazlı aggregasyon
    let query = supabaseAdmin
      .from('ogrenci_basari_trendi')
      .select(`
        ogrenci!inner(program_turleri!inner(program_adi, program_kodu)),
        akademik_yil,
        yariyil,
        ortalama_not,
        tamamlanan_ders_sayisi,
        toplam_akts
      `);

    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Program bazlı aggregasyon
    const programMap = {};
    data.forEach(item => {
      const programKodu = item.ogrenci?.program_turleri?.program_kodu || 'N/A';
      if (!programMap[programKodu]) {
        programMap[programKodu] = {
          program_kodu: programKodu,
          program_adi: item.ogrenci?.program_turleri?.program_adi || 'N/A',
          toplam_ogrenci: 0,
          ortalama_not_toplam: 0,
          ortalama_not_sayisi: 0,
          toplam_akts: 0,
          tamamlanan_ders_toplam: 0
        };
      }
      programMap[programKodu].toplam_ogrenci += 1;
      if (item.ortalama_not) {
        programMap[programKodu].ortalama_not_toplam += parseFloat(item.ortalama_not);
        programMap[programKodu].ortalama_not_sayisi += 1;
      }
      programMap[programKodu].toplam_akts += item.toplam_akts || 0;
      programMap[programKodu].tamamlanan_ders_toplam += item.tamamlanan_ders_sayisi || 0;
    });

    // Ortalamaları hesapla
    return Object.values(programMap).map(program => ({
      ...program,
      ortalama_not: program.ortalama_not_sayisi > 0 
        ? program.ortalama_not_toplam / program.ortalama_not_sayisi 
        : 0,
      ortalama_akts: program.toplam_ogrenci > 0 
        ? program.toplam_akts / program.toplam_ogrenci 
        : 0,
      ortalama_ders_sayisi: program.toplam_ogrenci > 0 
        ? program.tamamlanan_ders_toplam / program.toplam_ogrenci 
        : 0
    }));
  },

  /**
   * Kritik Darboğazlar
   * Kritik darboğazları getirir
   */
  async getKritikDarbogazlar() {
    const { data, error } = await supabaseAdmin
      .from('surec_darbogaz_analizi')
      .select(`
        *,
        program_turleri(program_adi, program_kodu)
      `)
      .eq('kritik_darbogaz_mi', true)
      .order('takilan_ogrenci_sayisi', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Danışman Performans Karşılaştırması
   * Tüm danışmanların performans metriklerini getirir (karşılaştırma için)
   */
  async getDanismanPerformansKarsilastirma(akademikYil = null) {
    let query = supabaseAdmin
      .from('danisman_performans_metrikleri')
      .select(`
        *,
        akademik_personel!inner(personel_id, ad, soyad, unvan)
      `)
      .order('basari_orani', { ascending: false });

    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    } else {
      // En son akademik yıl
      const { data: latestYear } = await supabaseAdmin
        .from('danisman_performans_metrikleri')
        .select('akademik_yil')
        .order('akademik_yil', { ascending: false })
        .limit(1)
        .single();
      
      if (latestYear) {
        query = query.eq('akademik_yil', latestYear.akademik_yil);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

