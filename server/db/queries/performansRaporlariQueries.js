/**
 * Performans Raporları Queries
 * Danışman, program ve dönem bazlı performans raporları için sorgular
 */

import { supabaseAdmin } from '../connection.js';

export const performansRaporlariQueries = {
  /**
   * Danışman Performans Raporu
   * Yıllık karşılaştırma ve trend analizi
   */
  async getDanismanPerformansRaporu(danismanId = null, yilBaslangic = null, yilBitis = null) {
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
    if (yilBaslangic) {
      query = query.gte('akademik_yil', yilBaslangic);
    }
    if (yilBitis) {
      query = query.lte('akademik_yil', yilBitis);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Program Performans Raporu
   * Program bazlı mezuniyet oranları ve başarı metrikleri
   */
  async getProgramPerformansRaporu(programTuruId = null, akademikYil = null) {
    // ogrenci_basari_trendi'den program bazlı aggregasyon
    let query = supabaseAdmin
      .from('ogrenci_basari_trendi')
      .select(`
        ogrenci!inner(
          ogrenci_id,
          program_turleri!inner(program_turu_id, program_adi, program_kodu),
          durum_turleri!inner(durum_kodu)
        ),
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
      const program = item.ogrenci?.program_turleri;
      if (!program) return;
      
      const programKodu = program.program_kodu || 'N/A';
      if (!programMap[programKodu]) {
        programMap[programKodu] = {
          program_turu_id: program.program_turu_id,
          program_kodu: programKodu,
          program_adi: program.program_adi || 'N/A',
          toplam_ogrenci: 0,
          mezun_sayisi: 0,
          ortalama_not_toplam: 0,
          ortalama_not_sayisi: 0,
          toplam_akts: 0,
          tamamlanan_ders_toplam: 0
        };
      }
      
      programMap[programKodu].toplam_ogrenci += 1;
      if (item.ogrenci.durum_turleri?.durum_kodu === 'Mezun') {
        programMap[programKodu].mezun_sayisi += 1;
      }
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
      mezuniyet_orani: program.toplam_ogrenci > 0 
        ? (program.mezun_sayisi / program.toplam_ogrenci) * 100 
        : 0,
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
   * Dönem Bazlı Performans Raporu
   * Akademik takvim entegrasyonu ile dönem bazlı analiz
   */
  async getDonemBazliPerformans(akademikYil = null, donem = null) {
    // Akademik takvim ile birleştirilmiş dönem bazlı analiz
    let takvimQuery = supabaseAdmin
      .from('akademik_takvim')
      .select('*')
      .order('akademik_yil', { ascending: false })
      .order('yariyil_no', { ascending: false });

    if (akademikYil) {
      takvimQuery = takvimQuery.eq('akademik_yil', akademikYil);
    }
    if (donem) {
      takvimQuery = takvimQuery.eq('donem', donem);
    }

    const { data: takvimData, error: takvimError } = await takvimQuery;
    if (takvimError) throw takvimError;

    // Her dönem için öğrenci sayıları ve metrikler
    const donemRaporlari = [];
    
    for (const donemItem of takvimData || []) {
      // Bu dönemdeki öğrenci başarı trendi
      const { data: basariData, error: basariError } = await supabaseAdmin
        .from('ogrenci_basari_trendi')
        .select(`
          *,
          ogrenci!inner(ogrenci_id, program_turleri!inner(program_adi))
        `)
        .eq('akademik_yil', donemItem.akademik_yil)
        .eq('yariyil', donemItem.yariyil_no);

      if (basariError) continue;

      const toplamOgrenci = basariData.length;
      const ortalamaNot = basariData.length > 0
        ? basariData.reduce((sum, item) => sum + (parseFloat(item.ortalama_not) || 0), 0) / basariData.length
        : 0;
      const toplamAkts = basariData.reduce((sum, item) => sum + (item.toplam_akts || 0), 0);

      donemRaporlari.push({
        akademik_yil: donemItem.akademik_yil,
        donem: donemItem.donem,
        yariyil_no: donemItem.yariyil_no,
        baslangic_tarihi: donemItem.baslangic_tarihi,
        bitis_tarihi: donemItem.bitis_tarihi,
        toplam_ogrenci: toplamOgrenci,
        ortalama_not: ortalamaNot,
        toplam_akts: toplamAkts,
        aktif_mi: donemItem.aktif_mi
      });
    }

    return donemRaporlari;
  },

  /**
   * Risk Yönetimi Skorları
   * Danışman bazlı risk yönetimi performansı
   */
  async getRiskYonetimiSkorlari(danismanId = null) {
    // Danışmanın öğrencilerinin risk skorları
    let query = supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select(`
        *,
        ogrenci!inner(
          ogrenci_id,
          danisman_id,
          program_turleri!inner(program_adi)
        )
      `)
      .order('hesaplama_tarihi', { ascending: false });

    if (danismanId) {
      query = query.eq('ogrenci.danisman_id', danismanId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Danışman bazlı aggregasyon
    const danismanMap = {};
    data.forEach(item => {
      const danismanId = item.ogrenci?.danisman_id;
      if (!danismanId) return;

      if (!danismanMap[danismanId]) {
        danismanMap[danismanId] = {
          danisman_id: danismanId,
          toplam_ogrenci: 0,
          risk_skoru_toplam: 0,
          kritik_riskli_sayisi: 0,
          yuksek_riskli_sayisi: 0,
          orta_riskli_sayisi: 0,
          dusuk_riskli_sayisi: 0
        };
      }

      danismanMap[danismanId].toplam_ogrenci += 1;
      const riskSkoru = item.risk_skoru || 0;
      danismanMap[danismanId].risk_skoru_toplam += riskSkoru;

      if (riskSkoru >= 85) {
        danismanMap[danismanId].kritik_riskli_sayisi += 1;
      } else if (riskSkoru >= 70) {
        danismanMap[danismanId].yuksek_riskli_sayisi += 1;
      } else if (riskSkoru >= 50) {
        danismanMap[danismanId].orta_riskli_sayisi += 1;
      } else {
        danismanMap[danismanId].dusuk_riskli_sayisi += 1;
      }
    });

    // Ortalamaları hesapla
    return Object.values(danismanMap).map(danisman => ({
      ...danisman,
      ortalama_risk_skoru: danisman.toplam_ogrenci > 0
        ? danisman.risk_skoru_toplam / danisman.toplam_ogrenci
        : 0,
      risk_yonetimi_skoru: danisman.toplam_ogrenci > 0
        ? 100 - (danisman.kritik_riskli_sayisi / danisman.toplam_ogrenci) * 100
        : 100
    }));
  }
};

