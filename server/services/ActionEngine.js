/**
 * Action Engine
 * Prescriptive içgörüler ve otomatik aksiyon önerileri
 */

import { supabaseAdmin } from '../db/connection.js';

export class ActionEngine {
  /**
   * Prescriptive içgörüler üret
   * Sadece "risk %10 arttı" değil, "Seminer dersini 2. yarıyılda almalı, aksi halde 4. yarıyılda darboğaz oluşur"
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<Array>} Aksiyon önerileri listesi
   */
  async generateActionableInsights(ogrenciId) {
    try {
      const insights = [];

      // Öğrenci bilgilerini al
      const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
        .from('ogrenci')
        .select(`
          *,
          program_turleri(*),
          ogrenci_akademik_durum(*),
          ogrenci_risk_analizi!inner(risk_skoru, risk_seviyesi)
        `)
        .eq('ogrenci_id', ogrenciId)
        .single();

      if (ogrenciError || !ogrenci) {
        throw new Error('Öğrenci bulunamadı');
      }

      const riskSkoru = ogrenci.ogrenci_risk_analizi?.[0]?.risk_skoru || 0;
      const mevcutYariyil = ogrenci.ogrenci_akademik_durum?.mevcut_yariyil || 0;
      const mevcutAsama = ogrenci.ogrenci_akademik_durum?.mevcut_asinama || 'Ders';
      const programKodu = ogrenci.program_turleri?.program_kodu;

      // 1. Seminer darboğaz analizi
      const seminerInsight = await this.analizEtSeminerDarbogaz(ogrenciId, mevcutYariyil);
      if (seminerInsight) {
        insights.push(seminerInsight);
      }

      // 2. Milestone gecikme analizi
      const milestoneInsight = await this.analizEtMilestoneGecikme(ogrenciId);
      if (milestoneInsight) {
        insights.push(...milestoneInsight);
      }

      // 3. Risk skoru yüksekse öneriler
      if (riskSkoru >= 70) {
        insights.push({
          oncelik: 'Kritik',
          kategori: 'Risk_Yonetimi',
          baslik: 'Kritik Risk Seviyesi',
          mesaj: `Risk skorunuz ${riskSkoru}. Acil müdahale gerekiyor.`,
          aksiyon: 'Danışmanınızla görüşme planlayın ve risk faktörlerini değerlendirin.',
          tahminiEtki: 'Risk skorunu %20-30 azaltabilir'
        });
      }

      // 4. Program türüne özel öneriler
      if (programKodu === 'Doktora') {
        const doktoraInsights = await this.ureDoktoraOnerileri(ogrenciId, mevcutYariyil, mevcutAsama);
        insights.push(...doktoraInsights);
      } else if (programKodu === 'Tezli_YL') {
        const tezliYLInsights = await this.ureTezliYLOnerileri(ogrenciId, mevcutYariyil);
        insights.push(...tezliYLInsights);
      }

      // 5. Hayalet öğrenci kontrolü
      const hayaletInsight = await this.analizEtHayaletOgrenci(ogrenciId, ogrenci.son_login);
      if (hayaletInsight) {
        insights.push(hayaletInsight);
      }

      // Öncelik sırasına göre sırala
      const oncelikSirasi = { 'Kritik': 3, 'Yuksek': 2, 'Orta': 1, 'Dusuk': 0 };
      insights.sort((a, b) => (oncelikSirasi[b.oncelik] || 0) - (oncelikSirasi[a.oncelik] || 0));

      return insights;
    } catch (error) {
      console.error('Aksiyon içgörüsü üretme hatası:', error);
      throw error;
    }
  }

  /**
   * Otomatik aksiyon önerileri
   * @param {string} riskSeviyesi - Risk seviyesi (Kritik, Yuksek, Orta, Dusuk)
   * @param {Object} ogrenciDurumu - Öğrenci durum bilgileri
   * @returns {Promise<Array>} Aksiyon önerileri
   */
  async suggestActions(riskSeviyesi, ogrenciDurumu) {
    const oneriler = [];

    // Kritik risk → Danışman ile görüşme öner
    if (riskSeviyesi === 'Kritik' || riskSeviyesi === 'Yuksek') {
      oneriler.push({
        tur: 'Danisman_Gorusmesi',
        oncelik: 'Yuksek',
        baslik: 'Danışman Görüşmesi Planlayın',
        mesaj: 'Risk seviyeniz yüksek. Danışmanınızla acil görüşme planlamanız önerilir.',
        aksiyon: 'Danışmanınızla iletişime geçin ve görüşme talep edin.',
        tahminiEtki: 'Risk skorunu %15-25 azaltabilir'
      });
    }

    // Hayalet öğrenci → Email/SMS gönder
    if (ogrenciDurumu.hayaletOgrenciMi) {
      oneriler.push({
        tur: 'Iletisim',
        oncelik: 'Kritik',
        baslik: 'Aktif Olun',
        mesaj: '180 günden fazla süredir sisteme giriş yapmadınız. Lütfen sisteme giriş yapın.',
        aksiyon: 'Sisteme giriş yapın ve akademik durumunuzu kontrol edin.',
        tahminiEtki: 'Engagement skorunu %30 artırabilir'
      });
    }

    // Kapasite aşımı → Öğrenci transferi öner
    if (ogrenciDurumu.kapasiteAsimi) {
      oneriler.push({
        tur: 'Kapasite_Yonetimi',
        oncelik: 'Orta',
        baslik: 'Kapasite Aşımı',
        mesaj: 'Danışmanınızın kapasitesi dolu. Öğrenci transferi değerlendirilebilir.',
        aksiyon: 'Bölüm başkanı ile görüşerek danışman değişikliği talep edin.',
        tahminiEtki: 'Danışman yükünü dengeler'
      });
    }

    return oneriler;
  }

  // ============================================
  // Helper Methods
  // ============================================

  async analizEtSeminerDarbogaz(ogrenciId, mevcutYariyil) {
    const { data: seminerData, error } = await supabaseAdmin
      .from('ogrenci_seminer_darbogaz_view')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .single();

    if (error || !seminerData) return null;

    // 4. yarıyılda ve seminer 'B' değilse kritik
    if (mevcutYariyil === 4 && seminerData.seminer_not_kodu !== 'B') {
      return {
        oncelik: 'Kritik',
        kategori: 'Seminer_Darbogaz',
        baslik: 'Seminer Dersini Hemen Alın',
        mesaj: '4. yarıyıldasınız ve Seminer dersiniz henüz başarılı değil. Bu darboğaz akademik ilerlemenizi engelleyebilir.',
        aksiyon: 'Seminer dersini bu yarıyıl alın ve başarılı olun (B veya üzeri not).',
        tahminiEtki: 'Aşama tıkanıklığını çözer, risk skorunu %20-30 azaltır',
        aciliyet: 'Bu yarıyıl'
      };
    }

    // 3. yarıyılda ve seminer yoksa uyarı
    if (mevcutYariyil === 3 && seminerData.seminer_durumu === 'seminer_yok') {
      return {
        oncelik: 'Yuksek',
        kategori: 'Seminer_Planlama',
        baslik: 'Seminer Dersini Planlayın',
        mesaj: '3. yarıyıldasınız ve henüz Seminer dersiniz yok. 4. yarıyılda darboğaz oluşmaması için planlama yapın.',
        aksiyon: 'Seminer dersini 3. veya 4. yarıyılda almayı planlayın.',
        tahminiEtki: 'Gelecekteki darboğazı önler',
        aciliyet: 'Önümüzdeki 1-2 yarıyıl'
      };
    }

    return null;
  }

  async analizEtMilestoneGecikme(ogrenciId) {
    const { data: milestones, error } = await supabaseAdmin
      .from('akademik_milestone')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .eq('durum', 'Beklemede')
      .lt('hedef_tarih', new Date().toISOString())
      .order('hedef_tarih', { ascending: true });

    if (error || !milestones || milestones.length === 0) return [];

    return milestones.map(milestone => {
      const gecikmeGunu = Math.floor((new Date() - new Date(milestone.hedef_tarih)) / (1000 * 60 * 60 * 24));
      
      return {
        oncelik: gecikmeGunu > 30 ? 'Kritik' : 'Yuksek',
        kategori: 'Milestone_Gecikme',
        baslik: `${this.getMilestoneText(milestone.milestone_turu)} Gecikmiş`,
        mesaj: `${this.getMilestoneText(milestone.milestone_turu)} milestone'ınız ${gecikmeGunu} gün gecikmiş durumda.`,
        aksiyon: 'Milestoneı tamamlamak için gerekli adımları atın ve danışmanınızla görüşün.',
        tahminiEtki: 'Gecikmeyi durdurur, risk skorunu %10-15 azaltır',
        aciliyet: 'Acil'
      };
    });
  }

  async ureDoktoraOnerileri(ogrenciId, mevcutYariyil, mevcutAsama) {
    const oneriler = [];

    // Yeterlik sınavı kontrolü
    if (mevcutYariyil >= 4 && mevcutAsama === 'Ders') {
      oneriler.push({
        oncelik: 'Yuksek',
        kategori: 'Yeterlik_Sinavi',
        baslik: 'Yeterlik Sınavına Hazırlanın',
        mesaj: '4. yarıyıldasınız ve hala Ders aşamasındasınız. Yeterlik sınavına hazırlanmanız önerilir.',
        aksiyon: 'Yeterlik sınavı için başvuru yapın ve hazırlık sürecini başlatın.',
        tahminiEtki: 'Aşama ilerlemesi sağlar, risk skorunu %15-20 azaltır'
      });
    }

    // TİK toplantı kontrolü
    const { data: tikToplantilari, error } = await supabaseAdmin
      .from('tik_toplantilari')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .eq('katilim_durumu', 'Katilmadi')
      .gte('toplanti_tarihi', new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString());

    if (!error && tikToplantilari && tikToplantilari.length >= 2) {
      oneriler.push({
        oncelik: 'Kritik',
        kategori: 'TIK_Katilim',
        baslik: 'TİK Toplantılarına Katılın',
        mesaj: 'Son 12 ayda 2 veya daha fazla TİK toplantısına katılmadınız. Bu durum akademik durumunuzu olumsuz etkileyebilir.',
        aksiyon: 'TİK toplantılarına düzenli katılım sağlayın ve raporlarınızı zamanında verin.',
        tahminiEtki: 'Risk skorunu %25-35 azaltır, pasif duruma düşmeyi önler'
      });
    }

    return oneriler;
  }

  async ureTezliYLOnerileri(ogrenciId, mevcutYariyil) {
    const oneriler = [];

    // Ders tamamlama kontrolü
    if (mevcutYariyil >= 4) {
      const { data: akademikDurum, error } = await supabaseAdmin
        .from('ogrenci_akademik_durum')
        .select('ders_tamamlandi_mi')
        .eq('ogrenci_id', ogrenciId)
        .single();

      if (!error && akademikDurum && !akademikDurum.ders_tamamlandi_mi) {
        oneriler.push({
          oncelik: 'Kritik',
          kategori: 'Ders_Tamamlama',
          baslik: 'Derslerinizi Tamamlayın',
          mesaj: '4. yarıyıldasınız ve dersleriniz henüz tamamlanmamış. Ders tamamlama süresi aşımı riski var.',
          aksiyon: 'Kalan derslerinizi alın ve başarılı olun (7 ders + 60 AKTS + Seminer).',
          tahminiEtki: 'Ders aşamasını tamamlar, risk skorunu %30-40 azaltır',
          aciliyet: 'Bu yarıyıl'
        });
      }
    }

    return oneriler;
  }

  async analizEtHayaletOgrenci(ogrenciId, sonLogin) {
    if (!sonLogin) {
      return {
        oncelik: 'Kritik',
        kategori: 'Hayalet_Ogrenci',
        baslik: 'Sisteme Giriş Yapın',
        mesaj: 'Henüz sisteme giriş yapmamışsınız. Sistem aktiviteniz risk skorunuzu etkiliyor.',
        aksiyon: 'Sisteme giriş yapın ve akademik durumunuzu kontrol edin.',
        tahminiEtki: 'Engagement skorunu %50 artırabilir, risk skorunu %30 azaltır'
      };
    }

    const gunFarki = Math.floor((new Date() - new Date(sonLogin)) / (1000 * 60 * 60 * 24));
    
    if (gunFarki > 180) {
      return {
        oncelik: 'Kritik',
        kategori: 'Hayalet_Ogrenci',
        baslik: 'Aktif Olun',
        mesaj: `${gunFarki} gündür sisteme giriş yapmadınız. Bu durum akademik durumunuzu olumsuz etkiliyor.`,
        aksiyon: 'Sisteme giriş yapın, bildirimlerinizi kontrol edin ve danışmanınızla iletişime geçin.',
        tahminiEtki: 'Hayalet öğrenci durumundan çıkar, risk skorunu %30 azaltır'
      };
    }

    if (gunFarki > 90) {
      return {
        oncelik: 'Yuksek',
        kategori: 'Pasiflik',
        baslik: 'Daha Aktif Olun',
        mesaj: `${gunFarki} gündür sisteme giriş yapmadınız. Daha düzenli giriş yapmanız önerilir.`,
        aksiyon: 'Haftada en az bir kez sisteme giriş yapın ve akademik durumunuzu takip edin.',
        tahminiEtki: 'Engagement skorunu %20 artırabilir'
      };
    }

    return null;
  }

  getMilestoneText(turu) {
    const map = {
      'Yeterlik_Sinavi': 'Yeterlik Sınavı',
      'Tez_Onersi': 'Tez Önerisi',
      'Tez_Savunmasi': 'Tez Savunması',
      'Donem_Projesi': 'Dönem Projesi'
    };
    return map[turu] || turu;
  }
}

