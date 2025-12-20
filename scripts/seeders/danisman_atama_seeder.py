"""
Danışman Atama Seeder
Öğrencileri akademik personel'e atar
"""

import random
import os
import sys

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase
from datetime import datetime

def seed_danisman_atamalari(ogrenci_ids):
    """Danışman atamalarını yap"""
    print("👨‍🏫 Danışman atamaları yapılıyor...")
    
    # Akademik personel ID'lerini al (view'dan mevcut_yuk bilgisini al)
    # mevcut_yuk sütunu akademik_personel tablosunda yok, view ile hesaplanıyor
    # View'da aktif_mi sütunu yok, bu yüzden önce aktif personelleri al, sonra view'dan yük bilgisini al
    try:
        # Önce aktif personelleri al
        aktif_response = supabase.table('akademik_personel').select('personel_id, maksimum_kapasite').eq('aktif_mi', True).execute()
        if not aktif_response.data:
            print("❌ Aktif akademik personel bulunamadı!")
            return
        
        aktif_personel_dict = {p['personel_id']: p['maksimum_kapasite'] for p in aktif_response.data}
        aktif_personel_ids = set(aktif_personel_dict.keys())
        
        # View'dan mevcut_yuk bilgisini al
        try:
            view_response = supabase.table('akademik_personel_yuk_view').select('personel_id, mevcut_yuk').execute()
            if view_response.data:
                # View'dan gelen yük bilgilerini dict'e çevir
                yuk_dict = {p['personel_id']: p.get('mevcut_yuk', 0) for p in view_response.data}
                # Aktif personeller için liste oluştur
                personel_list = [
                    {
                        'personel_id': pid,
                        'maksimum_kapasite': aktif_personel_dict[pid],
                        'mevcut_yuk': yuk_dict.get(pid, 0)
                    }
                    for pid in aktif_personel_ids
                ]
            else:
                # View'dan veri gelmezse, mevcut_yuk'ı 0 olarak varsay
                personel_list = [
                    {
                        'personel_id': pid,
                        'maksimum_kapasite': aktif_personel_dict[pid],
                        'mevcut_yuk': 0
                    }
                    for pid in aktif_personel_ids
                ]
        except Exception as e:
            # View'dan okunamazsa, mevcut_yuk'ı 0 olarak varsay
            print(f"    ⚠️  View'dan yük bilgisi alınamadı, 0 olarak varsayılıyor: {str(e)}")
            personel_list = [
                {
                    'personel_id': pid,
                    'maksimum_kapasite': aktif_personel_dict[pid],
                    'mevcut_yuk': 0
                }
                for pid in aktif_personel_ids
            ]
    except Exception as e:
        print(f"❌ Akademik personel alınamadı: {str(e)}")
        return
    
    if not personel_list:
        print("❌ Akademik personel bulunamadı!")
        return
    
    # Mevcut aktif danışman atamalarını kontrol et
    mevcut_atamalar = set()
    try:
        mevcut_response = supabase.table('danisman_gecmisi').select('ogrenci_id').eq('aktif_mi', True).execute()
        if mevcut_response.data:
            mevcut_atamalar = {a['ogrenci_id'] for a in mevcut_response.data}
    except:
        pass
    
    atama_sayisi = 0
    atlanan_sayisi = 0
    guncellenen_sayisi = 0
    
    for ogrenci in ogrenci_ids:
        ogrenci_id = ogrenci['ogrenci_id']
        
        # Eğer öğrencinin zaten aktif bir danışmanı varsa, atla veya güncelle
        if ogrenci_id in mevcut_atamalar:
            # Mevcut atamayı kontrol et
            try:
                mevcut_atama_response = supabase.table('danisman_gecmisi').select('danisman_id').eq('ogrenci_id', ogrenci_id).eq('aktif_mi', True).single().execute()
                if mevcut_atama_response.data:
                    # Zaten aktif bir danışmanı var, atla
                    atlanan_sayisi += 1
                    continue
            except:
                # Hata varsa devam et, yeni atama yapmayı dene
                pass
        
        # Kapasitesi olan personel bul
        uygun_personel = [p for p in personel_list if p.get('mevcut_yuk', 0) < p['maksimum_kapasite']]
        
        if not uygun_personel:
            print("⚠️  Tüm personel kapasitesi dolu!")
            break
        
        # Rastgele bir personel seç
        danisman = random.choice(uygun_personel)
        
        # Danışman ataması yap
        atama_tarihi = ogrenci['kayit_tarihi']
        if isinstance(atama_tarihi, datetime):
            atama_tarihi_str = atama_tarihi.isoformat()
        else:
            atama_tarihi_str = atama_tarihi
        
        try:
            response = supabase.table('danisman_gecmisi').insert({
                'ogrenci_id': ogrenci_id,
                'danisman_id': danisman['personel_id'],
                'atama_tarihi': atama_tarihi_str,
                'aktif_mi': True
            }).execute()
            
            if not response.data:
                print(f"    ❌ Hata: Öğrenci {ogrenci_id} - Veri eklenemedi")
                atlanan_sayisi += 1
                continue
            
            # Personel yükünü güncelle (view'dan tekrar oku - trigger otomatik güncelleyecek)
            # Seeder'da güncel tutmak için view'dan tekrar oku
            try:
                updated_response = supabase.table('akademik_personel_yuk_view').select('mevcut_yuk').eq('personel_id', danisman['personel_id']).single().execute()
                if updated_response.data:
                    # Personel listesindeki değeri güncelle
                    for p in personel_list:
                        if p['personel_id'] == danisman['personel_id']:
                            p['mevcut_yuk'] = updated_response.data.get('mevcut_yuk', 0)
                            break
            except:
                # View'dan okuyamazsak manuel artır (sadece seeder için)
                for p in personel_list:
                    if p['personel_id'] == danisman['personel_id']:
                        p['mevcut_yuk'] = p.get('mevcut_yuk', 0) + 1
                        break
            
            atama_sayisi += 1
            mevcut_atamalar.add(ogrenci_id)  # Mevcut atamalar listesine ekle
        except Exception as e:
            error_str = str(e)
            # Duplicate key hatası ise, öğrencinin zaten aktif bir danışmanı var demektir
            if 'unique_aktif_danisman' in error_str or 'duplicate key' in error_str.lower():
                atlanan_sayisi += 1
                # Sessizce atla, çok fazla mesaj yazdırmayalım
                if atlanan_sayisi <= 5:  # İlk 5 hatayı göster
                    print(f"    ⚠️  Öğrenci {ogrenci_id} zaten aktif bir danışmana sahip, atlanıyor")
                elif atlanan_sayisi == 6:
                    print(f"    ⚠️  ... (daha fazla atlanan öğrenci var)")
            else:
                print(f"    ❌ Hata: Öğrenci {ogrenci_id} - {error_str}")
                atlanan_sayisi += 1
            continue
        
        if atama_sayisi % 20 == 0:
            print(f"    ✅ {atama_sayisi} atama yapıldı")
    
    print(f"✅ Toplam {atama_sayisi} danışman ataması yapıldı")
    if atlanan_sayisi > 0:
        print(f"   ⚠️  {atlanan_sayisi} öğrenci atlandı (zaten aktif danışmanı var)")

if __name__ == '__main__':
    # Öğrenci ID'leri gerekli
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")

