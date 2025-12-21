/**
 * Akademik Takvim Queries
 * Akademik takvim yönetimi ve dönem bazlı analiz sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const akademikTakvimQueries = {
  /**
   * Akademik Takvim Listesi
   * Tüm dönemleri getirir
   */
  async getAkademikTakvim(akademikYil = null, donem = null) {
    let query = supabaseAdmin
      .from('akademik_takvim')
      .select('*')
      .order('akademik_yil', { ascending: false })
      .order('yariyil_no', { ascending: false });

    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }
    if (donem) {
      query = query.eq('donem', donem);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Aktif Dönem
   * Şu anki aktif dönemi getirir
   */
  async getAktifDonem() {
    const { data, error } = await supabaseAdmin
      .from('akademik_takvim')
      .select('*')
      .eq('aktif_mi', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Dönem Bazlı Öğrenci Sayıları
   * Her dönem için aktif öğrenci sayıları
   */
  async getDonemBazliOgrenciSayilari(akademikYil = null) {
    // Öğrenci kayıt tarihlerine göre dönem bazlı sayıları hesapla
    let takvimQuery = supabaseAdmin
      .from('akademik_takvim')
      .select('*')
      .order('akademik_yil', { ascending: false });

    if (akademikYil) {
      takvimQuery = takvimQuery.eq('akademik_yil', akademikYil);
    }

    const { data: takvimData, error: takvimError } = await takvimQuery;
    if (takvimError) throw takvimError;

    const donemSayilari = [];
    
    for (const donem of takvimData || []) {
      // Bu dönemde kayıt olan öğrenci sayısı
      const { count, error: ogrenciError } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id', { count: 'exact', head: true })
        .gte('kayit_tarihi', donem.baslangic_tarihi)
        .lte('kayit_tarihi', donem.bitis_tarihi)
        .eq('soft_delete', false);

      if (ogrenciError) continue;

      donemSayilari.push({
        akademik_yil: donem.akademik_yil,
        donem: donem.donem,
        yariyil_no: donem.yariyil_no,
        baslangic_tarihi: donem.baslangic_tarihi,
        bitis_tarihi: donem.bitis_tarihi,
        ogrenci_sayisi: count || 0,
        aktif_mi: donem.aktif_mi
      });
    }

    return donemSayilari;
  },

  /**
   * Dönem Bazlı Risk Dağılımı
   * Her dönem için risk skorları dağılımı
   */
  async getDonemBazliRiskDagilimi(akademikYil = null) {
    // ogrenci_basari_trendi'den dönem bazlı risk analizi
    let query = supabaseAdmin
      .from('ogrenci_basari_trendi')
      .select(`
        akademik_yil,
        yariyil,
        ogrenci!inner(
          ogrenci_id,
          ogrenci_risk_analizi!inner(risk_skoru, risk_seviyesi)
        )
      `);

    if (akademikYil) {
      query = query.eq('akademik_yil', akademikYil);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Dönem bazlı grupla
    const donemMap = {};
    data.forEach(item => {
      const key = `${item.akademik_yil}-${item.yariyil}`;
      if (!donemMap[key]) {
        donemMap[key] = {
          akademik_yil: item.akademik_yil,
          yariyil: item.yariyil,
          toplam_ogrenci: 0,
          risk_skoru_toplam: 0,
          kritik_riskli: 0,
          yuksek_riskli: 0,
          orta_riskli: 0,
          dusuk_riskli: 0
        };
      }

      donemMap[key].toplam_ogrenci += 1;
      const riskSkoru = item.ogrenci?.ogrenci_risk_analizi?.[0]?.risk_skoru || 0;
      donemMap[key].risk_skoru_toplam += riskSkoru;

      if (riskSkoru >= 85) {
        donemMap[key].kritik_riskli += 1;
      } else if (riskSkoru >= 70) {
        donemMap[key].yuksek_riskli += 1;
      } else if (riskSkoru >= 50) {
        donemMap[key].orta_riskli += 1;
      } else {
        donemMap[key].dusuk_riskli += 1;
      }
    });

    return Object.values(donemMap).map(donem => ({
      ...donem,
      ortalama_risk_skoru: donem.toplam_ogrenci > 0
        ? donem.risk_skoru_toplam / donem.toplam_ogrenci
        : 0
    }));
  }
};

