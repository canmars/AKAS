"""
Risk Analizi Seeder
Her öğrenci için risk analizi verileri üretir
"""

import os
import sys
from datetime import datetime, timedelta

# Script klasörünü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import supabase
from utils.risk_calculator import calculate_risk_skoru, get_risk_seviyesi

def seed_risk_analizi(ogrenci_ids):
    """Risk analizi verilerini üret"""
    print("⚠️  Risk analizleri hesaplanıyor...")
    
    # Program türleri kodlarını al
    program_turleri = {}
    response = supabase.table('program_turleri').select('program_turu_id, program_kodu').execute()
    
    for program in response.data:
        program_turleri[program['program_turu_id']] = program['program_kodu']
    
    analiz_sayisi = 0
    
    # Hayalet öğrenci eşiği: 180 gün (6 ay)
    HAYALET_ESIK_GUN = 180
    
    for ogrenci in ogrenci_ids:
        try:
            hayalet_ogrenci_mi = False
            son_login = None
            mevcut_yariyil = 1
            
            # Normalizasyon: ogrenci_mevcut_durum_view kullanılıyor
            # Öğrenci bilgilerini view'dan al
            try:
                response = supabase.table('ogrenci_mevcut_durum_view').select('ogrenci_id, mevcut_yariyil, son_login').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
                
                if response.data:
                    ogrenci_data = response.data
                    mevcut_yariyil = ogrenci_data.get('mevcut_yariyil', 1)
                    son_login_str = ogrenci_data.get('son_login')
                    
                    # Son login tarihini parse et ve hayalet kontrolü yap
                    if son_login_str:
                        try:
                            if isinstance(son_login_str, str):
                                # ISO format veya farklı formatları parse et
                                if 'T' in son_login_str:
                                    son_login = datetime.fromisoformat(son_login_str.replace('Z', '+00:00'))
                                else:
                                    son_login = datetime.strptime(son_login_str.split('T')[0], '%Y-%m-%d')
                            else:
                                son_login = son_login_str
                            
                            # 180 günden eskiyse hayalet öğrenci
                            if (datetime.now() - son_login.replace(tzinfo=None)).days > HAYALET_ESIK_GUN:
                                hayalet_ogrenci_mi = True
                        except:
                            # Parse edilemezse hayalet say
                            hayalet_ogrenci_mi = True
                    else:
                        # Son login yoksa hayalet öğrenci
                        hayalet_ogrenci_mi = True
            except:
                # View'dan okunamazsa, ogrenci tablosundan son_login al
                try:
                    ogrenci_response = supabase.table('ogrenci').select('son_login').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
                    if ogrenci_response.data:
                        son_login_str = ogrenci_response.data.get('son_login')
                        if son_login_str:
                            try:
                                if isinstance(son_login_str, str):
                                    if 'T' in son_login_str:
                                        son_login = datetime.fromisoformat(son_login_str.replace('Z', '+00:00'))
                                    else:
                                        son_login = datetime.strptime(son_login_str.split('T')[0], '%Y-%m-%d')
                                else:
                                    son_login = son_login_str
                                
                                if (datetime.now() - son_login.replace(tzinfo=None)).days > HAYALET_ESIK_GUN:
                                    hayalet_ogrenci_mi = True
                            except:
                                hayalet_ogrenci_mi = True
                        else:
                            hayalet_ogrenci_mi = True
                except:
                    # Hiçbir yerden okunamazsa, ogrenci_ids'den al (fallback)
                    hayalet_ogrenci_mi = ogrenci.get('hayalet_mi', False)
            
            # Program türünü al
            try:
                ogrenci_response = supabase.table('ogrenci').select('program_turu_id').eq('ogrenci_id', ogrenci['ogrenci_id']).single().execute()
                if ogrenci_response.data:
                    program_kodu = program_turleri.get(ogrenci_response.data['program_turu_id'])
                    
                    # Risk skoru hesapla
                    risk_skoru = calculate_risk_skoru({
                        'mevcut_yariyil': mevcut_yariyil,
                        'hayalet_mi': hayalet_ogrenci_mi
                    }, program_kodu)
                else:
                    continue
            except:
                continue
            
            risk_seviyesi = get_risk_seviyesi(risk_skoru)
            
            # Risk analizi ekle (ogrenci tablosunda mevcut_risk_skoru yok, sadece risk_analizi tablosunda)
            try:
                response = supabase.table('ogrenci_risk_analizi').insert({
                    'ogrenci_id': ogrenci['ogrenci_id'],
                    'risk_skoru': risk_skoru,
                    'risk_seviyesi': risk_seviyesi,
                    'tehlike_turu': 'Genel',
                    'hayalet_ogrenci_mi': hayalet_ogrenci_mi,  # Hesaplanan değeri kullan
                    'risk_faktorleri': {
                        'hayalet_mi': hayalet_ogrenci_mi,
                        'son_login': son_login.isoformat() if son_login else None,
                        'hesaplama_tarihi': datetime.now().isoformat()
                    }
                }).execute()
                
                if response.data:
                    analiz_sayisi += 1
            except:
                # Sessizce atla
                pass
        except Exception as e:
            # Sessizce atla
            continue
        
        if analiz_sayisi % 20 == 0:
            print(f"    ✅ {analiz_sayisi} risk analizi eklendi")
    
    print(f"✅ Toplam {analiz_sayisi} risk analizi eklendi")

if __name__ == '__main__':
    print("⚠️  Bu seeder'ı doğrudan çalıştırmayın. seed.py üzerinden çalıştırın.")

