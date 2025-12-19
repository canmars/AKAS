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
    
    # Akademik personel ID'lerini al
    response = supabase.table('akademik_personel').select('personel_id, maksimum_kapasite, mevcut_yuk').eq('aktif_mi', True).execute()
    
    personel_list = response.data
    
    if not personel_list:
        print("❌ Akademik personel bulunamadı!")
        return
    
    atama_sayisi = 0
    
    for ogrenci in ogrenci_ids:
        # Kapasitesi olan personel bul
        uygun_personel = [p for p in personel_list if p['mevcut_yuk'] < p['maksimum_kapasite']]
        
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
        
        response = supabase.table('danisman_gecmisi').insert({
            'ogrenci_id': ogrenci['ogrenci_id'],
            'danisman_id': danisman['personel_id'],
            'atama_tarihi': atama_tarihi_str,
            'aktif_mi': True
        }).execute()
        
        if response.error:
            print(f"    ❌ Hata: Öğrenci {ogrenci['ogrenci_id']} - {response.error}")
            continue
        
        # Personel yükünü artır (trigger otomatik yapacak ama manuel de güncelleyebiliriz)
        danisman['mevcut_yuk'] += 1
        atama_sayisi += 1
        
        if atama_sayisi % 20 == 0:
            print(f"    ✅ {atama_sayisi} atama yapıldı")
    
    print(f"✅ Toplam {atama_sayisi} danışman ataması yapıldı")

if __name__ == '__main__':
    # Öğrenci ID'leri gerekli
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")

