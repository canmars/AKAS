"""
Türkçe Faker Locale
Türkçe isimler ve veriler için Faker yapılandırması
Gerçek Türkçe isim listeleri kullanır
"""

import random

# Gerçek Türkçe isim listeleri (Türkiye'de en yaygın kullanılan isimler)
TURKISH_FIRST_NAMES = [
    # Erkek isimleri (yaygın)
    'Mehmet', 'Ahmet', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'İbrahim', 'İsmail', 'Osman', 'Yusuf',
    'Fatih', 'Emre', 'Burak', 'Can', 'Kerem', 'Arda', 'Ege', 'Kaan', 'Berk', 'Deniz',
    'Onur', 'Serkan', 'Murat', 'Özgür', 'Tolga', 'Cem', 'Barış', 'Erdem', 'Gökhan', 'Okan',
    'Kemal', 'Recep', 'Yasin', 'Halil', 'Süleyman', 'Ramazan', 'Adem', 'Salih', 'Ömer', 'Furkan',
    'Berkay', 'Eren', 'Alp', 'Kutay', 'Doruk', 'Tuna', 'Koray', 'Utku', 'Emir', 'Mert',
    'Baran', 'Aras', 'Alper', 'Cemre', 'Kutlu', 'Efe', 'Yiğit', 'Bora', 'Tarik', 'Selim',
    'Cihan', 'Kadir', 'Orhan', 'Metin', 'Volkan', 'Erkan', 'Hakan', 'Sinan', 'Taylan', 'Burak',
    'Çağatay', 'Batuhan', 'Berat', 'Ege', 'Kutay', 'Doruk', 'Tuna', 'Koray', 'Utku', 'Emir',
    'Mert', 'Baran', 'Aras', 'Alper', 'Cemre', 'Kutlu', 'Efe', 'Yiğit', 'Bora', 'Tarik',
    'Selim', 'Cihan', 'Kadir', 'Orhan', 'Metin', 'Volkan', 'Erkan', 'Hakan', 'Sinan', 'Taylan',
    'Berkant', 'Berkan', 'Berke', 'Berkem', 'Berkin', 'Berkay', 'Berkcan', 'Berksan', 'Berksoy', 'Berksu',
    'Cemal', 'Cemil', 'Cemre', 'Cem', 'Cemalettin', 'Cemil', 'Cemşit', 'Cengiz', 'Cenk', 'Ceyhun',
    'Derya', 'Deniz', 'Derin', 'Dilaver', 'Dilhan', 'Dilşad', 'Doğan', 'Doğukan', 'Doruk', 'Duran',
    'Efe', 'Ege', 'Egehan', 'Ege', 'Egecan', 'Egehan', 'Ege', 'Egehan', 'Ege', 'Egehan',
    'Furkan', 'Fırat', 'Ferhat', 'Ferit', 'Feridun', 'Fikret', 'Fuat', 'Furkan', 'Furkan', 'Furkan',
    'Gökhan', 'Gökay', 'Gökalp', 'Gökberk', 'Gökcan', 'Gökdeniz', 'Göker', 'Göksel', 'Göktuğ', 'Göktürk',
    'Hakan', 'Halil', 'Haluk', 'Hamza', 'Harun', 'Hasan', 'Hikmet', 'Hüseyin', 'Hüseyin', 'Hüseyin',
    'İbrahim', 'İdris', 'İlhan', 'İlker', 'İlyas', 'İrfan', 'İsa', 'İshak', 'İsmail', 'İzzet',
    'Kaan', 'Kadir', 'Kamil', 'Kartal', 'Kaya', 'Kazım', 'Kemal', 'Kenan', 'Kerem', 'Kerim',
    'Levent', 'Lütfi', 'Lütfullah', 'Mahmut', 'Mehmet', 'Melik', 'Mert', 'Metin', 'Muhammet', 'Murat',
    'Nazım', 'Necati', 'Necdet', 'Nedim', 'Nevzat', 'Nihat', 'Niyazi', 'Nuri', 'Oğuz', 'Okan',
    'Onur', 'Orhan', 'Osman', 'Ömer', 'Özgür', 'Özkan', 'Özkan', 'Özkan', 'Özkan', 'Özkan',
    'Rıza', 'Recep', 'Refik', 'Remzi', 'Rıdvan', 'Rıza', 'Rıza', 'Rıza', 'Rıza', 'Rıza',
    'Salih', 'Samet', 'Sami', 'Savaş', 'Selim', 'Serdar', 'Serkan', 'Sinan', 'Süleyman', 'Şahin',
    'Tahir', 'Taylan', 'Tayfun', 'Tayyar', 'Tolga', 'Tuna', 'Tunahan', 'Tunç', 'Turgut', 'Türker',
    'Uğur', 'Umut', 'Utku', 'Ümit', 'Vedat', 'Veysel', 'Volkan', 'Yasin', 'Yavuz', 'Yılmaz',
    'Zafer', 'Zeki', 'Zeynel', 'Ziya', 'Zülküf', 'Zülküf', 'Zülküf', 'Zülküf', 'Zülküf', 'Zülküf',
    
    # Kadın isimleri (yaygın)
    'Ayşe', 'Fatma', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Şeyma', 'Emine', 'Zeliha', 'Sultan',
    'Selin', 'Derya', 'Burcu', 'Gizem', 'Seda', 'Pınar', 'Özge', 'Esra', 'Ceren', 'Gamze',
    'Melis', 'İrem', 'Büşra', 'Ebru', 'Tuğba', 'Serap', 'Sevgi', 'Gül', 'Nur', 'Aslı',
    'Dilek', 'Özlem', 'Sibel', 'Aylin', 'Hande', 'Berna', 'Şule', 'Yasemin', 'Gonca', 'Ece',
    'Defne', 'İlayda', 'Azra', 'Zehra', 'Rüya', 'Mira', 'Lara', 'Derin', 'Ada', 'Sude',
    'Dilara', 'Beren', 'Elif', 'Zeynep', 'Ayşe', 'Fatma', 'Hatice', 'Emine', 'Zeliha', 'Sultan',
    'Selin', 'Derya', 'Burcu', 'Gizem', 'Seda', 'Pınar', 'Özge', 'Esra', 'Ceren', 'Gamze',
    'Melis', 'İrem', 'Büşra', 'Ebru', 'Tuğba', 'Serap', 'Sevgi', 'Gül', 'Nur', 'Aslı',
    'Aleyna', 'Alara', 'Alaz', 'Alaz', 'Alaz', 'Alaz', 'Alaz', 'Alaz', 'Alaz', 'Alaz',
    'Arzu', 'Aslı', 'Aslıhan', 'Asya', 'Aylin', 'Ayşe', 'Ayşegül', 'Ayşenur', 'Ayşin', 'Azra',
    'Bade', 'Başak', 'Begüm', 'Belinay', 'Beren', 'Berfin', 'Beril', 'Berin', 'Berivan', 'Berrak',
    'Beste', 'Betül', 'Beyza', 'Bilge', 'Bilgenur', 'Binnur', 'Birce', 'Birgül', 'Burcu', 'Büşra',
    'Cansu', 'Cemre', 'Ceren', 'Ceyda', 'Ceylan', 'Damla', 'Defne', 'Demet', 'Deniz', 'Derin',
    'Derya', 'Dicle', 'Didem', 'Dilara', 'Dilek', 'Duygu', 'Ebru', 'Ece', 'Ecem', 'Eda',
    'Eda', 'Eda', 'Eda', 'Eda', 'Eda', 'Eda', 'Eda', 'Eda', 'Eda', 'Eda',
    'Ela', 'Elif', 'Elifnur', 'Elis', 'Elmas', 'Emel', 'Emine', 'Esin', 'Esra', 'Eylül',
    'Fadime', 'Fatma', 'Feyza', 'Figen', 'Filiz', 'Fulya', 'Funda', 'Gamze', 'Gizem', 'Gonca',
    'Gökçe', 'Gökçen', 'Gökçenur', 'Gökşen', 'Gönül', 'Gül', 'Gülay', 'Gülbahar', 'Gülcan', 'Gülden',
    'Gülen', 'Güler', 'Gülhan', 'Güliz', 'Gülşah', 'Gülşen', 'Gülsüm', 'Gülten', 'Günay', 'Güneş',
    'Güven', 'Hande', 'Hazal', 'Hilal', 'Hülya', 'Işıl', 'Işın', 'İdil', 'İlayda', 'İlknur',
    'İnci', 'İpek', 'İrem', 'İzel', 'Kader', 'Kadriye', 'Kamile', 'Kardelen', 'Kevser', 'Kıvılcım',
    'Lale', 'Lara', 'Latife', 'Leyla', 'Meltem', 'Melis', 'Melisa', 'Merve', 'Meryem', 'Mira',
    'Nazlı', 'Neslihan', 'Neşe', 'Nihal', 'Nilay', 'Nur', 'Nuran', 'Nurcan', 'Nurgül', 'Nurhan',
    'Nurten', 'Özge', 'Özlem', 'Öznur', 'Pınar', 'Rabia', 'Rana', 'Reyhan', 'Rüya', 'Rüveyda',
    'Seda', 'Selda', 'Selin', 'Selma', 'Semra', 'Serap', 'Seray', 'Serpil', 'Sevgi', 'Sevil',
    'Sevim', 'Sevinç', 'Sibel', 'Simay', 'Sinem', 'Songül', 'Sude', 'Sultan', 'Şebnem', 'Şeyma',
    'Şule', 'Tuba', 'Tuğba', 'Tülay', 'Türkan', 'Ülkü', 'Ümran', 'Yasemin', 'Yelda', 'Yeliz',
    'Yıldız', 'Zehra', 'Zeliha', 'Zeynep', 'Zümrüt', 'Zümrüt', 'Zümrüt', 'Zümrüt', 'Zümrüt', 'Zümrüt'
]

TURKISH_LAST_NAMES = [
    # En yaygın soyadlar
    'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
    'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
    'Polat', 'Öz', 'Çakır', 'Sarı', 'Erdoğan', 'Güler', 'Şen', 'Akar', 'Bulut', 'Keskin',
    'Özer', 'Ateş', 'Taş', 'Toprak', 'Köse', 'Çiftçi', 'Özçelik', 'Aydoğan', 'Güneş', 'Bozkurt',
    'Aktaş', 'Yücel', 'Özaydın', 'Tekin', 'Çolak', 'Korkmaz', 'Yavuz', 'Aksoy', 'Kurtuluş', 'Özsoy',
    'Aydoğdu', 'Özden', 'Gündüz', 'Özgen', 'Kayaalp', 'Özmen', 'Aydınlı', 'Özçakır', 'Kılıçarslan', 'Özkanat',
    'Aydıncık', 'Özdoğan', 'Türk', 'Çağlar', 'Başar', 'Başaran', 'Başkurt', 'Bayar', 'Bayraktar', 'Bektaş',
    'Bilgin', 'Bozkurt', 'Can', 'Candan', 'Cengiz', 'Çağlayan', 'Çakmak', 'Çalışkan', 'Çam', 'Çankaya',
    'Çeliktaş', 'Çevik', 'Dağ', 'Dalkıran', 'Dede', 'Dedeoğlu', 'Demirci', 'Demirel', 'Dikmen', 'Dinç',
    'Duman', 'Dündar', 'Efe', 'Ekinci', 'Elmas', 'Emre', 'Erdem', 'Erdoğan', 'Eren', 'Ergin',
    'Erkan', 'Erol', 'Ertürk', 'Evren', 'Fırat', 'Genç', 'Göçmen', 'Gök', 'Gökalp', 'Gökçe',
    'Göksel', 'Göktürk', 'Gönül', 'Görgülü', 'Güçlü', 'Gül', 'Güleryüz', 'Gültekin', 'Gümüş', 'Gündoğdu',
    'Güneş', 'Gür', 'Gürel', 'Gürkan', 'Gürsoy', 'Güven', 'Güzel', 'Hakan', 'Halıcı', 'Hamzaoğlu',
    'Han', 'Harmancı', 'Has', 'Hasan', 'Haspolat', 'Hayta', 'Hızır', 'Işık', 'Işıklı', 'İlhan',
    'İnan', 'İnce', 'İnci', 'İpek', 'İşçi', 'İşleyen', 'Kabadayı', 'Kadıoğlu', 'Kahraman', 'Kalaycı',
    'Kalkan', 'Kalyoncu', 'Kamacı', 'Kanat', 'Kandemir', 'Karaağaç', 'Karaaslan', 'Karaca', 'Karadağ', 'Karadeniz',
    'Karagöz', 'Karakaya', 'Karakurt', 'Karaoğlu', 'Karataş', 'Kartal', 'Kartaloğlu', 'Kasap', 'Kaya', 'Kayacan',
    'Kayalı', 'Kayhan', 'Kazancı', 'Keleş', 'Keser', 'Kılıç', 'Kılıçarslan', 'Kılıçlı', 'Kır', 'Kıran',
    'Kırcı', 'Kırıcı', 'Kırım', 'Kırkan', 'Kırmızı', 'Kıvanç', 'Kızıl', 'Kızılkaya', 'Kocaman', 'Koçak',
    'Koçyiğit', 'Koray', 'Korkmaz', 'Köksal', 'Köroğlu', 'Köse', 'Köseoğlu', 'Koyuncu', 'Kurt', 'Kurtuluş',
    'Kuru', 'Kutlu', 'Kutluay', 'Kuyucu', 'Küçük', 'Küçüker', 'Küçükkaya', 'Küçükoğlu', 'Küpeli', 'Kütük',
    'Maden', 'Madenci', 'Mansur', 'Mart', 'Mert', 'Metin', 'Mısır', 'Mor', 'Mutlu', 'Nalbant',
    'Nazlı', 'Necati', 'Nedim', 'Nergis', 'Nesli', 'Nevzat', 'Nur', 'Nuri', 'Ok', 'Okan',
    'Okçu', 'Okur', 'Olgun', 'Onat', 'Onay', 'Onur', 'Oral', 'Orhan', 'Ortaç', 'Osman',
    'Öcal', 'Öden', 'Öğüt', 'Ökmen', 'Ölmez', 'Önal', 'Önder', 'Öner', 'Örnek', 'Örs',
    'Örün', 'Övünç', 'Öz', 'Özay', 'Özbay', 'Özcan', 'Özçelik', 'Özdemir', 'Özden', 'Özdoğan',
    'Özel', 'Özen', 'Özer', 'Özgen', 'Özgür', 'Özkan', 'Özkaya', 'Özmen', 'Özsoy', 'Öztürk',
    'Özyurt', 'Parlak', 'Pektaş', 'Pınar', 'Polat', 'Rıza', 'Sağlam', 'Sakarya', 'Salman', 'Sancak',
    'Sarı', 'Sarıkaya', 'Sarıtaş', 'Savcı', 'Saygı', 'Sayın', 'Seçkin', 'Sevim', 'Sevinç', 'Sezer',
    'Sıcak', 'Sınav', 'Sönmez', 'Soysal', 'Soylu', 'Subaşı', 'Sucu', 'Süleyman', 'Şahin', 'Şahiner',
    'Şanlı', 'Şeker', 'Şen', 'Şenel', 'Şener', 'Şengül', 'Şenol', 'Şentürk', 'Şerbetçi', 'Şimşek',
    'Şirin', 'Şişman', 'Taş', 'Taşçı', 'Taşkın', 'Taştan', 'Tatar', 'Taylan', 'Tekin', 'Tektaş',
    'Temiz', 'Temizel', 'Temur', 'Tepe', 'Terzi', 'Tiryaki', 'Tok', 'Toka', 'Tokat', 'Topal',
    'Topçu', 'Toprak', 'Torun', 'Tosun', 'Tufan', 'Tunç', 'Tuncer', 'Turan', 'Türk', 'Türkay',
    'Türkcan', 'Türker', 'Türkoğlu', 'Türkyılmaz', 'Tütüncü', 'Uçar', 'Uğur', 'Ulu', 'Uludağ', 'Ulusoy',
    'Umut', 'Ural', 'Uras', 'Usta', 'Ustaoğlu', 'Uyanık', 'Uyar', 'Uysal', 'Ünal', 'Üner',
    'Ünlü', 'Ünsal', 'Üstün', 'Vardar', 'Varol', 'Vural', 'Yağcı', 'Yağmur', 'Yalçın', 'Yalçınkaya',
    'Yaman', 'Yanık', 'Yapıcı', 'Yardımcı', 'Yarım', 'Yasa', 'Yaşar', 'Yavuz', 'Yayla', 'Yazıcı',
    'Yazıcıoğlu', 'Yazgan', 'Yedek', 'Yel', 'Yenice', 'Yerlikaya', 'Yeşil', 'Yeşildağ', 'Yeter', 'Yıldız',
    'Yıldırım', 'Yılmaz', 'Yolcu', 'Yoluk', 'Yorulmaz', 'Yüce', 'Yücel', 'Yüksel', 'Yükselen', 'Yurt',
    'Yurttaş', 'Yusuf', 'Zengin', 'Zeybek', 'Zorlu', 'Zülfikar'
]

def get_turkish_first_name():
    """Gerçek Türkçe ad döndür"""
    return random.choice(TURKISH_FIRST_NAMES)

def get_turkish_last_name():
    """Gerçek Türkçe soyad döndür"""
    return random.choice(TURKISH_LAST_NAMES)

def get_turkish_name():
    """Gerçek Türkçe isim-soyisim döndür"""
    return f"{get_turkish_first_name()} {get_turkish_last_name()}"

def get_turkish_email(name=None):
    """Türkçe e-posta döndür"""
    if name:
        # İsimden e-posta oluştur
        name_clean = name.lower().replace(' ', '.').replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
        return f"{name_clean}@deu.edu.tr"
    # E-posta oluştur
    first_name = get_turkish_first_name().lower()
    last_name = get_turkish_last_name().lower()
    first_name_clean = first_name.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
    last_name_clean = last_name.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
    return f"{first_name_clean}.{last_name_clean}@deu.edu.tr"

def get_turkish_tc_no():
    """Geçerli formatlı TC kimlik no döndür (11 haneli, ilk hane 0 olamaz)"""
    # İlk hane 1-9 arası olmalı
    first_digit = random.randint(1, 9)
    # Kalan 10 hane
    remaining = ''.join([str(random.randint(0, 9)) for _ in range(10)])
    return f"{first_digit}{remaining}"

def get_turkish_birth_date(min_age=20, max_age=50):
    """Türkçe doğum tarihi döndür"""
    from datetime import datetime, timedelta
    
    today = datetime.now()
    max_birth_date = today - timedelta(days=min_age * 365)
    min_birth_date = today - timedelta(days=max_age * 365)
    
    time_between = (max_birth_date - min_birth_date).days
    random_days = random.randint(0, time_between)
    birth_date = min_birth_date + timedelta(days=random_days)
    
    return birth_date.date()
