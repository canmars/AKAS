"""
Türkçe Faker Locale
Türkçe isimler ve veriler için Faker yapılandırması
"""

from faker import Faker

# Türkçe locale ile Faker oluştur
fake_tr = Faker('tr_TR')

# Türkçe isimler için özel fonksiyonlar
def get_turkish_name():
    """Türkçe isim döndür"""
    return fake_tr.name()

def get_turkish_first_name():
    """Türkçe ad döndür"""
    return fake_tr.first_name()

def get_turkish_last_name():
    """Türkçe soyad döndür"""
    return fake_tr.last_name()

def get_turkish_email(name=None):
    """Türkçe e-posta döndür"""
    if name:
        # İsimden e-posta oluştur
        name_clean = name.lower().replace(' ', '.').replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
        return f"{name_clean}@deu.edu.tr"
    return fake_tr.email()

