/**
 * Admin Veri Yükleme Page
 * Excel veri yükleme ve yönetim sayfası
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class AdminVeriYuklemePage {
  constructor(container) {
    this.container = container;
    this.selectedFile = null;
    this.uploadHistory = [];
  }

  render() {
    if (!this.container) {
      console.error('AdminVeriYuklemePage: Container is not defined');
      return;
    }

    this.container.innerHTML = `
      <div class="p-6 lg:p-8 space-y-8">
        <!-- Başlık -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Veri Yükleme</h1>
          <p class="text-slate-600">Excel dosyası yükleyerek toplu öğrenci verisi ekleyebilirsiniz.</p>
        </div>

        <!-- Excel Yükleme Alanı -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-slate-900 mb-4">Excel Dosyası Yükle</h2>
            
            <!-- Drag & Drop Alanı -->
            <div 
              id="drop-zone" 
              class="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input 
                type="file" 
                id="file-input" 
                accept=".xlsx,.xls" 
                class="hidden"
              />
              <div class="space-y-4">
                <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p class="text-lg font-medium text-slate-700">
                    Dosyayı buraya sürükleyin veya tıklayın
                  </p>
                  <p class="text-sm text-slate-500 mt-2">
                    Sadece Excel dosyaları (.xlsx, .xls) kabul edilir
                  </p>
                </div>
                <div id="selected-file-info" class="hidden mt-4 p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm font-medium text-blue-900">
                    <span id="selected-file-name"></span>
                    <span id="selected-file-size" class="text-blue-700 ml-2"></span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Yükleme Butonu -->
            <div class="mt-6 flex justify-end">
              <button 
                id="upload-button" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Yükle
              </button>
            </div>

            <!-- Yükleme Durumu -->
            <div id="upload-status" class="hidden mt-6"></div>
          </div>
        </div>

        <!-- Yükleme Geçmişi -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-slate-900">Yükleme Geçmişi</h2>
              <button 
                id="refresh-history-button" 
                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Yenile
              </button>
            </div>
            
            <div id="upload-history-container">
              <div class="text-center py-8 text-slate-500">
                Yükleniyor...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.loadUploadHistory();
  }

  setupEventListeners() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const refreshButton = document.getElementById('refresh-history-button');

    // Dosya seçme
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    uploadButton.addEventListener('click', () => this.handleUpload());
    refreshButton.addEventListener('click', () => this.loadUploadHistory());
  }

  handleFileSelect(file) {
    // Dosya tipi kontrolü
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.showError('Sadece Excel dosyaları (.xlsx, .xls) kabul edilir');
      return;
    }

    this.selectedFile = file;
    
    // UI güncelle
    const fileInfo = document.getElementById('selected-file-info');
    const fileName = document.getElementById('selected-file-name');
    const fileSize = document.getElementById('selected-file-size');
    const uploadButton = document.getElementById('upload-button');

    fileInfo.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = `(${this.formatFileSize(file.size)})`;
    uploadButton.disabled = false;
  }

  async handleUpload() {
    if (!this.selectedFile) {
      this.showError('Lütfen bir dosya seçin');
      return;
    }

    const uploadButton = document.getElementById('upload-button');
    const uploadStatus = document.getElementById('upload-status');
    
    uploadButton.disabled = true;
    uploadButton.textContent = 'Yükleniyor...';
    uploadStatus.classList.remove('hidden');
    uploadStatus.innerHTML = `
      <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p class="text-blue-900 font-medium">Dosya yükleniyor ve işleniyor...</p>
      </div>
    `;

    try {
      const response = await ApiService.uploadExcel(this.selectedFile);
      
      if (response.success) {
        this.showSuccess(response.data);
        // Dosya seçimini temizle
        this.selectedFile = null;
        document.getElementById('file-input').value = '';
        document.getElementById('selected-file-info').classList.add('hidden');
        uploadButton.disabled = true;
        uploadButton.textContent = 'Yükle';
        
        // Geçmişi yenile
        this.loadUploadHistory();
      } else {
        throw new Error('Yükleme başarısız');
      }
    } catch (error) {
      this.showError(error.message || 'Dosya yüklenirken bir hata oluştu');
      uploadButton.disabled = false;
      uploadButton.textContent = 'Yükle';
    }
  }

  showSuccess(data) {
    const uploadStatus = document.getElementById('upload-status');
    const successRate = ((data.basariliSatirSayisi / data.toplamSatirSayisi) * 100).toFixed(1);
    
    uploadStatus.innerHTML = `
      <div class="p-4 bg-green-50 rounded-lg border border-green-200">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-green-900 font-semibold mb-2">Yükleme Tamamlandı</p>
            <div class="text-sm text-green-800 space-y-1">
              <p>Toplam Satır: <span class="font-medium">${data.toplamSatirSayisi}</span></p>
              <p>Başarılı: <span class="font-medium text-green-700">${data.basariliSatirSayisi}</span> (${successRate}%)</p>
              ${data.hataliSatirSayisi > 0 ? `<p>Hatalı: <span class="font-medium text-red-600">${data.hataliSatirSayisi}</span></p>` : ''}
              <p>İşlem Süresi: <span class="font-medium">${data.islemSuresi.toFixed(2)} saniye</span></p>
            </div>
            ${data.hataliSatirSayisi > 0 ? `
              <div class="mt-3">
                <button 
                  id="show-errors-button" 
                  class="text-sm text-green-700 hover:text-green-800 font-medium underline"
                >
                  Hata detaylarını göster
                </button>
                <div id="error-details" class="hidden mt-2 p-3 bg-red-50 rounded border border-red-200 max-h-60 overflow-y-auto">
                  ${this.renderErrorDetails(data.hataDetaylari)}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Hata detayları toggle
    const showErrorsButton = document.getElementById('show-errors-button');
    const errorDetails = document.getElementById('error-details');
    if (showErrorsButton && errorDetails) {
      showErrorsButton.addEventListener('click', () => {
        errorDetails.classList.toggle('hidden');
      });
    }
  }

  showError(message) {
    const uploadStatus = document.getElementById('upload-status');
    uploadStatus.classList.remove('hidden');
    uploadStatus.innerHTML = `
      <div class="p-4 bg-red-50 rounded-lg border border-red-200">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-900 font-medium">${message}</p>
        </div>
      </div>
    `;
  }

  renderErrorDetails(hataDetaylari) {
    if (!hataDetaylari || hataDetaylari.length === 0) {
      return '<p class="text-sm text-red-800">Hata detayı bulunamadı</p>';
    }

    return `
      <div class="space-y-2">
        ${hataDetaylari.slice(0, 10).map(hata => `
          <div class="text-sm">
            <p class="font-medium text-red-900">Satır ${hata.satir}:</p>
            <ul class="list-disc list-inside text-red-800 ml-2">
              ${hata.hatalar.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
        ${hataDetaylari.length > 10 ? `<p class="text-sm text-red-700 italic">... ve ${hataDetaylari.length - 10} hata daha</p>` : ''}
      </div>
    `;
  }

  async loadUploadHistory() {
    const container = document.getElementById('upload-history-container');
    container.innerHTML = '<div class="text-center py-4 text-slate-500">Yükleniyor...</div>';

    try {
      const response = await ApiService.getUploadHistory(20);
      
      if (response.success && response.data && response.data.length > 0) {
        this.uploadHistory = response.data;
        container.innerHTML = this.renderUploadHistory(response.data);
      } else {
        container.innerHTML = `
          <div class="text-center py-8 text-slate-500">
            <p>Henüz yükleme geçmişi bulunmuyor</p>
          </div>
        `;
      }
    } catch (error) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <p>Yükleme geçmişi yüklenirken bir hata oluştu: ${error.message}</p>
        </div>
      `;
    }
  }

  renderUploadHistory(history) {
    return `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Dosya Adı</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Tarih</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Toplam</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Başarılı</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Hatalı</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Durum</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            ${history.map(item => {
              const durumRenk = item.yukleme_durumu === 'Basarili' ? 'bg-green-100 text-green-800' :
                               item.yukleme_durumu === 'Kismi_Basarili' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800';
              
              return `
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${item.dosya_adi}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">
                    ${formatters.formatDate(item.yukleme_tarihi)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">${item.yuklenen_satir_sayisi}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-green-700 font-medium">${item.basarili_satir_sayisi}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-red-700 font-medium">${item.hatali_satir_sayisi}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${durumRenk}">
                      ${item.yukleme_durumu.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  destroy() {
    // Cleanup
    this.selectedFile = null;
    this.uploadHistory = [];
  }
}

