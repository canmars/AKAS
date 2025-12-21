/**
 * Login Page
 * Kullanıcı giriş sayfası
 */

import ApiService from '../../services/ApiService.js';

export class LoginPage {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div class="max-w-md w-full">
          <!-- Logo ve Başlık -->
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-slate-900 mb-2">DEÜ KDS</h1>
            <p class="text-slate-600">Karar Destek Sistemi</p>
          </div>

          <!-- Login Card -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">Giriş Yap</h2>
            
            <form id="login-form" class="space-y-6">
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ornek@deu.edu.tr"
                />
              </div>

              <!-- Şifre -->
              <div>
                <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <!-- Hata Mesajı -->
              <div id="login-error" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700"></p>
              </div>

              <!-- Giriş Butonu -->
              <button
                type="submit"
                id="login-button"
                class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Giriş Yap
              </button>
            </form>

            <!-- Development Mode Bypass -->
            <div class="mt-6 pt-6 border-t border-slate-200">
              <p class="text-xs text-slate-500 text-center mb-3">Development Modu</p>
              <button
                id="dev-bypass-button"
                class="w-full py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Geliştirme Modu (Bypass)
              </button>
            </div>
          </div>

          <!-- Footer -->
          <p class="text-center text-sm text-slate-500 mt-6">
            Dokuz Eylül Üniversitesi - Yönetim Bilişim Sistemleri
          </p>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    const devBypassButton = document.getElementById('dev-bypass-button');

    // Form submit
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    // Development bypass
    devBypassButton.addEventListener('click', () => {
      this.handleDevBypass();
    });
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const loginButton = document.getElementById('login-button');

    // Hata mesajını gizle
    errorDiv.classList.add('hidden');

    // Loading state
    loginButton.disabled = true;
    loginButton.textContent = 'Giriş yapılıyor...';

    try {
      // TODO: Supabase Auth ile gerçek login implementasyonu
      // Şimdilik development için basit bir kontrol
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Token'ı sakla
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        
        // Rolü sakla
        if (data.role) {
          localStorage.setItem('user_role', data.role);
        }

        // Ana sayfaya yönlendir
        window.location.hash = this.getRedirectPath(data.role);
      } else {
        throw new Error('Giriş başarısız');
      }
    } catch (error) {
      console.error('Login hatası:', error);
      errorDiv.querySelector('p').textContent = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      errorDiv.classList.remove('hidden');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Giriş Yap';
    }
  }

  handleDevBypass() {
    // Development modunda direkt giriş yap
    localStorage.setItem('auth_token', 'dev-token');
    localStorage.setItem('user_role', 'Bolum_Baskani');
    
    // Ana sayfaya yönlendir
    window.location.hash = '/dashboard';
    window.location.reload();
  }

  getRedirectPath(role) {
    switch (role) {
      case 'Ogrenci':
        return '/ogrenci/dashboard';
      case 'Danisman':
        return '/danisman/dashboard';
      case 'Admin':
      case 'Bolum_Baskani':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }
}

