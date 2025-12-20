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
    # Script: yisans/scripts/seeders/akademik_kadro_seeder.py
    # JSON: kds_lisansustu/lisansustu_docs/deu-akademik-kadro.json
    # Script'ten JSON'a: ../../../lisansustu_docs/deu-akademik-kadro.json
    json_path = os.path.join(os.path.dirname(__file__), '../../../lisansustu_docs/deu-akademik-kadro.json')
    json_path = os.path.abspath(json_path)  # Mutlak yola çevir
    
    if not os.path.exists(json_path):
        print(f"❌ JSON dosyası bulunamadı: {json_path}")
        return []
    
    with open(json_path, 'r', encoding='utf-8') as f:
        kadro_data = json.load(f)
    
    # Anabilim dalları ID'lerini al
    anabilim_dallari = {}
    try:
        response = supabase.table('anabilim_dallari').select('anabilim_dali_id, anabilim_dali_adi').execute()
        if response.data:
            for anabilim_dali in response.data:
                anabilim_dallari[anabilim_dali['anabilim_dali_adi']] = anabilim_dali['anabilim_dali_id']
        else:
            print("❌ Anabilim dalları bulunamadı!")
            return []
    except Exception as e:
        print(f"❌ Anabilim dalları alınamadı: {str(e)}")
        return []
    
    # Mevcut personelleri kontrol et (email'e göre duplicate kontrolü)
    mevcut_personeller = {}
    try:
        response = supabase.table('akademik_personel').select('personel_id, email').execute()
        if response.data:
            for p in response.data:
                mevcut_personeller[p['email']] = p['personel_id']
    except Exception as e:
        print(f"⚠️  Mevcut personeller alınamadı (devam ediliyor): {str(e)}")
    
    # Unvan'a göre maksimum kapasite belirle
    def get_maksimum_kapasite(unvan):
        if unvan == 'Prof. Dr.':
            return 15
        elif unvan == 'Doç. Dr.':
            return 12
        elif unvan == 'Dr. Öğr. Üyesi':
            return 10
        elif unvan in ('Araş. Gör.', 'Araş. Gör. Dr.'):
            return 5
        else:
            return 5  # Varsayılan
    
    # Her akademik personel için
    personel_ids = []
    eklenen_sayisi = 0
    guncellenen_sayisi = 0
    atlanan_sayisi = 0
    
    for personel in kadro_data:
        email = personel.get('eposta', '').strip()
        if not email:
            print(f"⚠️  E-posta bulunamadı, atlanıyor: {personel.get('adSoyad', 'Bilinmeyen')}")
            atlanan_sayisi += 1
            continue
        
        # Ad ve soyadı ayır (unvan'ı çıkar)
        ad_soyad = personel['adSoyad'].replace(personel['unvan'], '').strip()
        ad_parts = ad_soyad.split(' ', 1)
        ad = ad_parts[0] if len(ad_parts) > 0 else ''
        soyad = ad_parts[1] if len(ad_parts) > 1 else ''
        
        if not ad or not soyad:
            print(f"⚠️  Ad veya soyad bulunamadı, atlanıyor: {personel['adSoyad']}")
            atlanan_sayisi += 1
            continue
        
        # Anabilim dalı kontrolü
        anabilim_dali_id = anabilim_dallari.get(personel.get('anabilimDali', ''))
        if not anabilim_dali_id:
            print(f"⚠️  Anabilim dalı bulunamadı: {personel.get('anabilimDali', 'Bilinmeyen')} - {personel['adSoyad']}")
            atlanan_sayisi += 1
            continue
        
        # Duplicate kontrolü - eğer varsa güncelle
        personel_id = mevcut_personeller.get(email)
        
        try:
            if personel_id:
                # Mevcut personeli güncelle
                try:
                    response = supabase.table('akademik_personel').update({
                        'anabilim_dali_id': anabilim_dali_id,
                        'unvan': personel['unvan'],
                        'ad': ad,
                        'soyad': soyad,
                        'maksimum_kapasite': get_maksimum_kapasite(personel['unvan']),
                        'aktif_mi': True
                    }).eq('personel_id', personel_id).execute()
                    
                    if not response.data:
                        print(f"❌ Güncelleme hatası: {personel['adSoyad']} - Veri döndürülmedi")
                        atlanan_sayisi += 1
                        continue
                    
                    guncellenen_sayisi += 1
                    print(f"🔄 {personel['adSoyad']} güncellendi")
                except Exception as e:
                    print(f"❌ Güncelleme hatası: {personel['adSoyad']} - {str(e)}")
                    atlanan_sayisi += 1
                    continue
            else:
                # Yeni personel ekle
                try:
                    response = supabase.table('akademik_personel').insert({
                        'anabilim_dali_id': anabilim_dali_id,
                        'unvan': personel['unvan'],
                        'ad': ad,
                        'soyad': soyad,
                        'email': email,
                        'maksimum_kapasite': get_maksimum_kapasite(personel['unvan']),
                        'aktif_mi': True
                    }).execute()
                    
                    if not response.data or len(response.data) == 0:
                        print(f"❌ Veri eklenemedi: {personel['adSoyad']}")
                        atlanan_sayisi += 1
                        continue
                    
                    personel_id = response.data[0]['personel_id']
                    eklenen_sayisi += 1
                    print(f"✅ {personel['adSoyad']} eklendi")
                except Exception as e:
                    print(f"❌ Ekleme hatası: {personel['adSoyad']} - {str(e)}")
                    atlanan_sayisi += 1
                    continue
            
            personel_ids.append(personel_id)
            
            # Mevcut uzmanlık alanlarını temizle (eğer güncelleniyorsa)
            if personel_id in mevcut_personeller.values():
                try:
                    # Mevcut uzmanlıkları sil
                    supabase.table('akademik_personel_uzmanlik').delete().eq('personel_id', personel_id).execute()
                except:
                    pass  # Hata olsa bile devam et
            
            # Uzmanlık alanlarını ekle
            uzmanlik_sayisi = 0
            for uzmanlik in personel.get('uzmanlikAlanlari', []):
                if not uzmanlik or not uzmanlik.strip():
                    continue
                
                try:
                    response = supabase.table('akademik_personel_uzmanlik').insert({
                        'personel_id': personel_id,
                        'uzmanlik_alani': uzmanlik.strip(),
                        'ana_uzmanlik_mi': False  # İlk uzmanlık alanı ana olabilir, şimdilik False
                    }).execute()
                    
                    if response.data:
                        uzmanlik_sayisi += 1
                    else:
                        print(f"    ⚠️  Uzmanlık eklenemedi: {uzmanlik} - Veri döndürülmedi")
                except Exception as e:
                    print(f"    ⚠️  Uzmanlık eklenemedi: {uzmanlik} - {str(e)}")
            
            if uzmanlik_sayisi > 0:
                print(f"    📋 {uzmanlik_sayisi} uzmanlık alanı eklendi")
            
        except Exception as e:
            print(f"❌ Hata: {personel['adSoyad']} - {str(e)}")
            atlanan_sayisi += 1
            continue
    
    print(f"\n✅ Toplam {len(personel_ids)} akademik personel işlendi")
    print(f"   ➕ {eklenen_sayisi} yeni personel eklendi")
    print(f"   🔄 {guncellenen_sayisi} personel güncellendi")
    if atlanan_sayisi > 0:
        print(f"   ⚠️  {atlanan_sayisi} personel atlandı")
    
    return personel_ids

if __name__ == '__main__':
    seed_akademik_kadro()
