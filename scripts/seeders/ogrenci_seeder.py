"""
Öğrenci Seeder
150+ öğrenci üretimi (gerçekçi dağılım, Türkçe isimler)
"""

import random
import os
import sys

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase
from utils.faker_tr import get_turkish_first_name, get_turkish_last_name
from utils.date_helpers import get_kayit_tarihi, get_son_login_tarihi
from datetime import datetime

def seed_ogrenciler():
    """Öğrencileri üret"""
    print("👥 Öğrenciler üretiliyor...")
    
    # Program türleri ID'lerini al
    program_turleri = {}
    response = supabase.table('program_turleri').select('program_turu_id, program_kodu').execute()
    
    for program in response.data:
        program_turleri[program['program_kodu']] = program['program_turu_id']
    
    # Durum türleri ID'lerini al
    durum_turleri = {}
    response = supabase.table('durum_turleri').select('durum_id, durum_kodu').execute()
    
    for durum in response.data:
        durum_turleri[durum['durum_kodu']] = durum['durum_id']
    
    # Öğrenci dağılımı
    # Doktora: ~40, Tezli YL: ~50, Tezsiz YL (İÖ): ~30, Tezsiz YL (Uzaktan): ~30
    ogrenci_dagilimi = {
        'Doktora': 40,
        'Tezli_YL': 50,
        'Tezsiz_YL_IO': 30,
        'Tezsiz_YL_Uzaktan': 30
    }
    
    ogrenci_ids = []
    
    for program_kodu, sayi in ogrenci_dagilimi.items():
        print(f"  📝 {program_kodu}: {sayi} öğrenci üretiliyor...")
        
        for i in range(sayi):
            # Türkçe isim üret
            ad = get_turkish_first_name()
            soyad = get_turkish_last_name()
            
            # Kayıt tarihi
            kayit_tarihi = get_kayit_tarihi(program_kodu)
            kayit_tarihi_str = kayit_tarihi.isoformat() if isinstance(kayit_tarihi, datetime) else kayit_tarihi
            
            # Hayalet öğrenci kontrolü (%10 ihtimal)
            hayalet_mi = random.random() < 0.1
            son_login = get_son_login_tarihi(kayit_tarihi, hayalet_mi)
            son_login_str = son_login.isoformat() if son_login and isinstance(son_login, datetime) else None
            
            # Normalizasyon: mevcut_yariyil ve son_login artık ayrı tablolarda
            # Öğrenci ekle (sadece temel bilgiler)
            ogrenci_data = {
                'program_turu_id': program_turleri[program_kodu],
                'durum_id': durum_turleri['Aktif'],
                'kayit_tarihi': kayit_tarihi_str,
                'soft_delete': False
            }
            
            # Program türüne özel alanlar
            if program_kodu == 'Doktora':
                ogrenci_data['kabul_turu'] = random.choice(['Lisans', 'Yuksek_Lisans'])
            elif program_kodu == 'Tezli_YL':
                # ders_tamamlandi_mi ogrenci_akademik_durum tablosuna eklenecek
                pass
            else:  # Tezsiz YL
                # tamamlanan_ders_sayisi ogrenci_akademik_durum tablosuna eklenecek
                pass
            
            response = supabase.table('ogrenci').insert(ogrenci_data).select('ogrenci_id').execute()
            
            if response.error:
                print(f"    ❌ Hata: {ad} {soyad} - {response.error}")
                continue
            
            ogrenci_id = response.data[0]['ogrenci_id']
            
            # Normalizasyon: ogrenci_akademik_durum tablosuna ekle
            # mevcut_yariyil hesaplanacak (view ile), burada cache olarak tutulur
            kayit_datetime = kayit_tarihi if isinstance(kayit_tarihi, datetime) else datetime.fromisoformat(kayit_tarihi_str)
            bugun = datetime.now()
            
            # Basit yarıyıl hesaplama (PostgreSQL function'ı ile aynı mantık)
            kayit_yili = kayit_datetime.year
            kayit_ayi = kayit_datetime.month
            bugun_yili = bugun.year
            bugun_ayi = bugun.month
            
            yil_farki = bugun_yili - kayit_yili
            
            # İlk yarıyıl hesaplama
            if kayit_ayi >= 10:  # Ekim, Kasım, Aralık
                mevcut_yariyil = 1
                ekim_ayindan_sonra_mi = True
            elif kayit_ayi >= 2 and kayit_ayi <= 6:  # Şubat-Haziran
                mevcut_yariyil = 1
                ekim_ayindan_sonra_mi = False
            else:  # Ocak, Temmuz, Ağustos, Eylül
                mevcut_yariyil = 1
                ekim_ayindan_sonra_mi = (kayit_ayi >= 7)
            
            # Geçen yılları hesapla
            if yil_farki > 0:
                mevcut_yariyil += (yil_farki * 2)
            
            # Mevcut yıl içindeki yarıyıl artışını hesapla
            if ekim_ayindan_sonra_mi:
                if bugun_ayi >= 2 and bugun_ayi <= 6:
                    if bugun_yili > kayit_yili:
                        mevcut_yariyil += 1
            else:
                if bugun_ayi >= 10:
                    if bugun_yili > kayit_yili:
                        mevcut_yariyil += 1
            
            # Aynı akademik yıl içinde yarıyıl geçişi kontrolü
            if bugun_yili == kayit_yili:
                if ekim_ayindan_sonra_mi:
                    if bugun_ayi >= 2 and bugun_ayi <= 6:
                        mevcut_yariyil = 2
                else:
                    if bugun_ayi >= 10:
                        mevcut_yariyil = 2
            
            akademik_durum_data = {
                'ogrenci_id': ogrenci_id,
                'mevcut_asinama': random.choice(['Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi']) if program_kodu == 'Doktora' else 'Ders',
                'mevcut_yariyil': mevcut_yariyil,  # Cache olarak tutulur
                'guncelleme_tarihi': datetime.now().isoformat()
            }
            
            if program_kodu == 'Tezli_YL':
                akademik_durum_data['ders_tamamlandi_mi'] = random.choice([True, False])
            elif program_kodu in ('Tezsiz_YL_IO', 'Tezsiz_YL_Uzaktan'):
                akademik_durum_data['tamamlanan_ders_sayisi'] = random.randint(1, 10)
            
            supabase.table('ogrenci_akademik_durum').insert(akademik_durum_data).execute()
            
            # Normalizasyon: ogrenci_son_login tablosuna ekle
            if son_login_str:
                supabase.table('ogrenci_son_login').insert({
                    'ogrenci_id': ogrenci_id,
                    'son_login': son_login_str,
                    'guncelleme_tarihi': datetime.now().isoformat()
                }).execute()
            
            ogrenci_ids.append({
                'ogrenci_id': ogrenci_id,
                'program_kodu': program_kodu,
                'hayalet_mi': hayalet_mi,
                'kayit_tarihi': kayit_datetime
            })
            
            if (i + 1) % 10 == 0:
                print(f"    ✅ {i + 1}/{sayi} öğrenci eklendi")
    
    print(f"✅ Toplam {len(ogrenci_ids)} öğrenci eklendi")
    return ogrenci_ids

if __name__ == '__main__':
    seed_ogrenciler()

