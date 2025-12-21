/**
 * Notification Bell Component - Tableau Style
 * Bildirim ikonu, okunmamış sayısı, dropdown menü
 */

import ApiService from '../../services/ApiService.js';
import formatters from '../../utils/formatters.js';

export class NotificationBell {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onNotificationClick: options.onNotificationClick || null,
      autoRefresh: options.autoRefresh !== false,
      refreshInterval: options.refreshInterval || 30000, // 30 saniye
      ...options
    };
    this.unreadCount = 0;
    this.notifications = [];
    this.isOpen = false;
    this.render();
    this.loadNotifications();
    this.setupAutoRefresh();
  }

  async loadNotifications() {
    // Token kontrolü - token yoksa istek yapma
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.unreadCount = 0;
      this.updateBadge();
      return;
    }

    try {
      const response = await ApiService.getOkunmamisBildirimSayisi();
      this.unreadCount = response.data?.okunmamis_sayisi || response.data?.sayi || 0;
      this.updateBadge();
    } catch (error) {
      // 401 Unauthorized hatası sessizce handle et (token geçersiz veya yok)
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        this.unreadCount = 0;
        this.updateBadge();
        return;
      }
      console.error('Bildirim yükleme hatası:', error);
    }
  }

  async loadNotificationList() {
    // Token kontrolü - token yoksa istek yapma
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.notifications = [];
      this.updateDropdown();
      return;
    }

    try {
      const response = await ApiService.getBildirimler(10);
      // Response format: { success: true, data: [...] }
      this.notifications = Array.isArray(response.data) ? response.data : [];
      this.updateDropdown();
    } catch (error) {
      // 401 Unauthorized hatası sessizce handle et (token geçersiz veya yok)
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        this.notifications = [];
        this.updateDropdown();
        return;
      }
      console.error('Bildirim listesi yükleme hatası:', error);
      this.notifications = [];
      this.updateDropdown();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="relative">
        <button 
          class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors notification-bell-btn"
          onclick="window.notificationBell?.toggleDropdown()"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          ${this.unreadCount > 0 ? `
            <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full notification-badge">
              ${this.unreadCount > 99 ? '99+' : this.unreadCount}
            </span>
          ` : ''}
        </button>
        
        <!-- Dropdown -->
        <div class="hidden absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 notification-dropdown">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Bildirimler</h3>
            ${this.unreadCount > 0 ? `
              <button 
                class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onclick="window.notificationBell?.markAllAsRead()"
              >
                Tümünü Okundu İşaretle
              </button>
            ` : ''}
          </div>
          <div class="max-h-96 overflow-y-auto notification-list">
            <!-- Notifications will be rendered here -->
          </div>
          <div class="p-3 border-t border-gray-200 text-center">
            <button 
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onclick="window.location.hash='/bildirimler'"
            >
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      </div>
    `;

    // Global erişim için
    window.notificationBell = this;
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });
  }

  updateBadge() {
    const badge = this.container.querySelector('.notification-badge');
    const bellBtn = this.container.querySelector('.notification-bell-btn');
    
    if (this.unreadCount > 0) {
      if (!badge) {
        const badgeEl = document.createElement('span');
        badgeEl.className = 'absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full notification-badge';
        badgeEl.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        bellBtn.appendChild(badgeEl);
      } else {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      }
    } else {
      if (badge) {
        badge.remove();
      }
    }
  }

  async updateDropdown() {
    const listContainer = this.container.querySelector('.notification-list');
    if (!listContainer) return;

    if (this.notifications.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-sm">Yeni bildirim yok</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.notifications.map(notif => {
      const priority = notif.bildirim_onceligi?.toLowerCase() || 'medium';
      const priorityClass = {
        'kritik': 'border-l-red-500 bg-red-50',
        'yuksek': 'border-l-orange-500 bg-orange-50',
        'orta': 'border-l-blue-500 bg-blue-50',
        'dusuk': 'border-l-gray-500 bg-gray-50'
      }[priority] || 'border-l-gray-500 bg-gray-50';

      return `
        <div 
          class="p-4 border-l-4 ${priorityClass} hover:bg-gray-50 cursor-pointer transition-colors notification-item ${notif.okundu_mi ? '' : 'font-semibold'}"
          data-notification-id="${notif.bildirim_id}"
          onclick="window.notificationBell?.handleNotificationClick('${notif.bildirim_id}')"
        >
          <div class="flex items-start justify-between mb-1">
            <div class="flex-1">
              <p class="text-sm text-gray-900">${notif.mesaj || 'Bildirim'}</p>
              <p class="text-xs text-gray-500 mt-1">
                ${formatters.formatDate(notif.olusturma_tarihi)}
              </p>
            </div>
            ${!notif.okundu_mi ? `
              <span class="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
            ` : ''}
          </div>
          ${notif.bildirim_turleri?.bildirim_turu_adi ? `
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
              ${notif.bildirim_turleri.bildirim_turu_adi}
            </span>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  async openDropdown() {
    this.isOpen = true;
    const dropdown = this.container.querySelector('.notification-dropdown');
    if (dropdown) {
      dropdown.classList.remove('hidden');
      await this.loadNotificationList();
    }
  }

  closeDropdown() {
    this.isOpen = false;
    const dropdown = this.container.querySelector('.notification-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  async handleNotificationClick(notificationId) {
    // Token kontrolü
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    // Bildirimi okundu işaretle
    try {
      await ApiService.markBildirimAsRead(notificationId);
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateBadge();
      
      // Listeyi güncelle
      const item = this.container.querySelector(`[data-notification-id="${notificationId}"]`);
      if (item) {
        item.classList.remove('font-semibold');
        const dot = item.querySelector('.bg-blue-600');
        if (dot) dot.remove();
      }
    } catch (error) {
      // 401 hatası sessizce handle et
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        return;
      }
      console.error('Bildirim okundu işaretleme hatası:', error);
    }

    // Callback çağır
    if (this.options.onNotificationClick) {
      this.options.onNotificationClick(notificationId);
    }

    this.closeDropdown();
  }

  async markAllAsRead() {
    // Token kontrolü
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    try {
      // Tüm bildirimleri okundu işaretle
      for (const notif of this.notifications) {
        if (!notif.okundu_mi) {
          await ApiService.markBildirimAsRead(notif.bildirim_id);
        }
      }
      this.unreadCount = 0;
      this.updateBadge();
      await this.loadNotificationList();
    } catch (error) {
      // 401 hatası sessizce handle et
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        return;
      }
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  }

  setupAutoRefresh() {
    if (this.options.autoRefresh) {
      setInterval(() => {
        this.loadNotifications();
      }, this.options.refreshInterval);
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    window.notificationBell = null;
  }
}

