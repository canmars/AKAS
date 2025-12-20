"""
Öğrenci Seeder
260 öğrenci üretimi (gerçekçi dağılım, Türkçe isimler, tam bilgiler)
"""

import random
import os
import sys

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase
from utils.faker_tr import get_turkish_first_name, get_turkish_last_name, get_turkish_tc_no, get_turkish_birth_date
from utils.date_helpers import get_kayit_tarihi, get_son_login_tarihi
from datetime import datetime

def generate_ogrenci_no(kayit_yili, sira_no):
    """
    Öğrenci numarası üret
    Format: YYYY469XXX
    - İlk 4 hane: Yıl (örn: 2023)
    - 3 hane: Bölüm kodu (469 - YBS)
    - Son 3 hane: Eşsiz numara (001-999)
    """
    bolum_kodu = '469'
    # Son 3 haneyi eşsiz yapmak için sira_no kullan (001-999 arası)
    unique_part = str(sira_no).zfill(3)
    return f"{kayit_yili}{bolum_kodu}{unique_part}"

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
    ogrenci_dagilimi = {
        'Doktora': 10,
        'Tezli_YL': 50,
        'Tezsiz_YL_IO': 80,
        'Tezsiz_YL_Uzaktan': 120
    }
    
    ogrenci_ids = []
    ogrenci_no_counter = {}  # Her yıl için sayaç
    used_tc_nos = set()  # Kullanılan TC kimlik numaraları
    yuksek_lisans_kabul_count = 0  # Yüksek Lisans programlarına Yüksek Lisans mezunundan kabul (maksimum 2)
    
    for program_kodu, sayi in ogrenci_dagilimi.items():
        print(f"  📝 {program_kodu}: {sayi} öğrenci üretiliyor...")
        
        for i in range(sayi):
            # Türkçe isim üret
            ad = get_turkish_first_name()
            soyad = get_turkish_last_name()
            
            # Kayıt tarihi
            kayit_tarihi = get_kayit_tarihi(program_kodu)
            kayit_datetime = kayit_tarihi if isinstance(kayit_tarihi, datetime) else datetime.fromisoformat(str(kayit_tarihi))
            kayit_tarihi_str = kayit_datetime.date().isoformat()
            kayit_yili = kayit_datetime.year
            
            # Öğrenci numarası üret (yıl bazlı sayaç)
            if kayit_yili not in ogrenci_no_counter:
                ogrenci_no_counter[kayit_yili] = 0
            ogrenci_no_counter[kayit_yili] += 1
            ogrenci_no = generate_ogrenci_no(kayit_yili, ogrenci_no_counter[kayit_yili])
            
            # TC Kimlik No (eşsiz olmalı)
            max_tc_attempts = 100
            tc_kimlik_no = None
            for _ in range(max_tc_attempts):
                candidate_tc = get_turkish_tc_no()
                if candidate_tc not in used_tc_nos:
                    tc_kimlik_no = candidate_tc
                    used_tc_nos.add(candidate_tc)
                    break
            
            if not tc_kimlik_no:
                print(f"    ⚠️  Eşsiz TC kimlik no bulunamadı, atlanıyor: {ad} {soyad}")
                continue
            
            # Doğum tarihi (program türüne göre)
            if program_kodu == 'Doktora':
                # Doktora: 24-30 yaş arası
                dogum_tarihi = get_turkish_birth_date(min_age=24, max_age=30)
            else:
                # Yüksek Lisans: 20-35 yaş arası
                dogum_tarihi = get_turkish_birth_date(min_age=20, max_age=35)
            
            # Cinsiyet
            cinsiyet = random.choice(['E', 'K'])
            
            # Kabul tarihi (kayıt tarihinden 1-3 ay önce)
            from datetime import timedelta
            kabul_tarihi = kayit_datetime - timedelta(days=random.randint(30, 90))
            kabul_tarihi_str = kabul_tarihi.date().isoformat()
            
            # Hayalet öğrenci kontrolü (%15 ihtimal)
            hayalet_mi = random.random() < 0.15
            son_login = get_son_login_tarihi(kayit_tarihi, hayalet_mi)
            son_login_str = son_login.isoformat() if son_login and isinstance(son_login, datetime) else None
            
            # Öğrenci ekle (tam bilgiler)
            ogrenci_data = {
                'tc_kimlik_no': tc_kimlik_no,
                'ad': ad,
                'soyad': soyad,
                'dogum_tarihi': dogum_tarihi.isoformat(),
                'cinsiyet': cinsiyet,
                'ogrenci_no': ogrenci_no,
                'program_turu_id': program_turleri[program_kodu],
                'durum_id': durum_turleri['Aktif'],
                'kayit_tarihi': kayit_tarihi_str,
                'kabul_tarihi': kabul_tarihi_str,
                'soft_delete': False
            }
            
            # Program türüne özel alanlar
            # program_kabul_turu: Öğrencinin hangi programdan mezun olarak bu programa kabul edildiğini gösterir (program_turleri tablosuna foreign key)
            if program_kodu == 'Doktora':
                # Doktora programına: Sadece Yüksek Lisans mezunları kabul edilir (Tezli_YL)
                ogrenci_data['program_kabul_turu'] = program_turleri.get('Tezli_YL')
            else:
                # Yüksek Lisans programlarına: Çoğunlukla Lisans mezunları kabul edilir
                # %98 Lisans mezunu, %2 Yüksek Lisans mezunu (maksimum 2 Yüksek Lisans)
                if yuksek_lisans_kabul_count >= 2:
                    # Zaten 2 Yüksek Lisans mezunu var, Lisans mezunu kabul et
                    ogrenci_data['program_kabul_turu'] = program_turleri.get('Lisans')
                elif random.random() < 0.98:  # %98 Lisans mezunu
                    ogrenci_data['program_kabul_turu'] = program_turleri.get('Lisans')
                else:
                    # %2 Yüksek Lisans mezunu (maksimum 2) - Tezli_YL
                    ogrenci_data['program_kabul_turu'] = program_turleri.get('Tezli_YL')
                    yuksek_lisans_kabul_count += 1
            
            # program_kabul_turu NULL kontrolü
            if not ogrenci_data.get('program_kabul_turu'):
                print(f"    ⚠️  program_kabul_turu bulunamadı, atlanıyor: {ad} {soyad}")
                continue
            
            try:
                response = supabase.table('ogrenci').insert(ogrenci_data).execute()
                
                if not response.data or len(response.data) == 0:
                    print(f"    ❌ Hata: {ad} {soyad} - Veri eklenemedi")
                    continue
                
                ogrenci_id = response.data[0]['ogrenci_id']
                
                # ogrenci_akademik_durum tablosuna ekle
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
                    'mevcut_yariyil': mevcut_yariyil,
                    'guncelleme_tarihi': datetime.now().isoformat()
                }
                
                if program_kodu == 'Tezli_YL':
                    akademik_durum_data['ders_tamamlandi_mi'] = random.choice([True, False])
                elif program_kodu in ('Tezsiz_YL_IO', 'Tezsiz_YL_Uzaktan'):
                    akademik_durum_data['tamamlanan_ders_sayisi'] = random.randint(1, 10)
                
                # upsert kullan (eğer varsa güncelle, yoksa ekle)
                try:
                    # Önce mevcut kaydı kontrol et
                    existing = supabase.table('ogrenci_akademik_durum').select('ogrenci_id').eq('ogrenci_id', ogrenci_id).execute()
                    
                    if existing.data and len(existing.data) > 0:
                        # Güncelle
                        supabase.table('ogrenci_akademik_durum').update(akademik_durum_data).eq('ogrenci_id', ogrenci_id).execute()
                    else:
                        # Ekle
                        supabase.table('ogrenci_akademik_durum').insert(akademik_durum_data).execute()
                except Exception as e:
                    print(f"    ⚠️  Akademik durum eklenemedi/güncellenemedi: {str(e)}")
                
                # ogrenci_son_login tablosuna ekle (upsert mantığı)
                if son_login_str:
                    try:
                        # Önce mevcut kaydı kontrol et
                        existing = supabase.table('ogrenci_son_login').select('ogrenci_id').eq('ogrenci_id', ogrenci_id).execute()
                        
                        son_login_data = {
                            'ogrenci_id': ogrenci_id,
                            'son_login': son_login_str,
                            'guncelleme_tarihi': datetime.now().isoformat()
                        }
                        
                        if existing.data and len(existing.data) > 0:
                            # Güncelle
                            supabase.table('ogrenci_son_login').update(son_login_data).eq('ogrenci_id', ogrenci_id).execute()
                        else:
                            # Ekle
                            supabase.table('ogrenci_son_login').insert(son_login_data).execute()
                    except Exception as e:
                        print(f"    ⚠️  Son login eklenemedi/güncellenemedi: {str(e)}")
                
                ogrenci_ids.append({
                    'ogrenci_id': ogrenci_id,
                    'program_kodu': program_kodu,
                    'hayalet_mi': hayalet_mi,
                    'kayit_tarihi': kayit_datetime
                })
                
                if (i + 1) % 10 == 0:
                    print(f"    ✅ {i + 1}/{sayi} öğrenci eklendi")
                    
            except Exception as e:
                print(f"    ❌ Hata: {ad} {soyad} - {str(e)}")
                continue
    
    print(f"✅ Toplam {len(ogrenci_ids)} öğrenci eklendi")
    return ogrenci_ids

if __name__ == '__main__':
    seed_ogrenciler()
