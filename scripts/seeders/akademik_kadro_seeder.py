"""
Akademik Kadro Seeder
deu-akademik-kadro.json'dan akademik kadro import
"""

import json
import os
import sys

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase

def seed_akademik_kadro():
    """Akademik kadroyu import et"""
    print("📚 Akademik kadro import ediliyor...")
    
    # JSON dosyasını oku
    json_path = os.path.join(os.path.dirname(__file__), '../../lisansustu_docs/deu-akademik-kadro.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        kadro_data = json.load(f)
    
    # Anabilim dalları ID'lerini al
    anabilim_dallari = {}
    response = supabase.table('anabilim_dallari').select('anabilim_dali_id, anabilim_dali_adi').execute()
    
    for anabilim_dali in response.data:
        anabilim_dallari[anabilim_dali['anabilim_dali_adi']] = anabilim_dali['anabilim_dali_id']
    
    # Unvan'a göre maksimum kapasite belirle
    def get_maksimum_kapasite(unvan):
        if unvan == 'Prof. Dr.':
            return 15
        elif unvan == 'Doç. Dr.':
            return 12
        elif unvan == 'Dr. Öğr. Üyesi':
            return 10
        else:  # Araş. Gör.
            return 5
    
    # Her akademik personel için
    personel_ids = []
    for personel in kadro_data:
        # Ad ve soyadı ayır
        ad_soyad = personel['adSoyad'].replace(personel['unvan'], '').strip()
        ad_parts = ad_soyad.split(' ', 1)
        ad = ad_parts[0] if len(ad_parts) > 0 else ''
        soyad = ad_parts[1] if len(ad_parts) > 1 else ''
        
        # Akademik personel ekle
        response = supabase.table('akademik_personel').insert({
            'anabilim_dali_id': anabilim_dallari.get(personel['anabilimDali']),
            'unvan': personel['unvan'],
            'ad': ad,
            'soyad': soyad,
            'email': personel['eposta'],
            'maksimum_kapasite': get_maksimum_kapasite(personel['unvan']),
            'mevcut_yuk': 0,
            'aktif_mi': True
        }).select('personel_id').execute()
        
        if response.error:
            print(f"❌ Hata: {personel['adSoyad']} - {response.error}")
            continue
        
        personel_id = response.data[0]['personel_id']
        personel_ids.append(personel_id)
        
        # Uzmanlık alanlarını ekle
        for uzmanlik in personel.get('uzmanlikAlanlari', []):
            supabase.table('akademik_personel_uzmanlik').insert({
                'personel_id': personel_id,
                'uzmanlik_alani': uzmanlik,
                'ana_uzmanlik_mi': False
            }).execute()
        
        print(f"✅ {personel['adSoyad']} eklendi")
    
    print(f"✅ Toplam {len(personel_ids)} akademik personel eklendi")
    return personel_ids

if __name__ == '__main__':
    seed_akademik_kadro()

