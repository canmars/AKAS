"""
Risk Calculator
Risk skoru hesaplama (Python implementasyonu)
"""

import random
from datetime import datetime, timedelta

def calculate_risk_skoru(ogrenci_data, program_turu_kodu):
    """
    Öğrenci için risk skoru hesapla (0-100)
    Basitleştirilmiş versiyon - gerçek implementasyon daha karmaşık olacak
    """
    risk_skoru = 0
    
    # Hayalet öğrenci kontrolü
    if ogrenci_data.get('hayalet_mi', False):
        risk_skoru += 30
    
    # Maksimum süre aşımı kontrolü
    mevcut_yariyil = ogrenci_data.get('mevcut_yariyil', 1)
    if program_turu_kodu == 'Doktora':
        maksimum_yariyil = 12
        if mevcut_yariyil >= maksimum_yariyil:
            risk_skoru += 50
        elif mevcut_yariyil >= maksimum_yariyil - 2:
            risk_skoru += 25
    elif program_turu_kodu == 'Tezli_YL':
        maksimum_yariyil = 6
        if mevcut_yariyil >= maksimum_yariyil:
            risk_skoru += 50
        elif mevcut_yariyil >= maksimum_yariyil - 1:
            risk_skoru += 25
    else:  # Tezsiz YL
        maksimum_yariyil = 3
        if mevcut_yariyil >= maksimum_yariyil:
            risk_skoru += 50
    
    # Rastgele risk faktörleri ekle (gerçek implementasyonda iş kurallarına göre)
    risk_skoru += random.randint(0, 30)
    
    # 0-100 arasına sınırla
    return min(100, max(0, risk_skoru))

def get_risk_seviyesi(risk_skoru):
    """Risk skoruna göre risk seviyesi döndür"""
    if risk_skoru <= 30:
        return 'Dusuk'
    elif risk_skoru <= 50:
        return 'Orta'
    elif risk_skoru <= 70:
        return 'Yuksek'
    else:
        return 'Kritik'

