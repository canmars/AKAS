/**
 * Performance Utilities
 * Lazy loading, caching, debouncing, throttling
 */

/**
 * Debounce function - Bir fonksiyonun belirli bir süre içinde sadece bir kez çalışmasını sağlar
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - Bir fonksiyonun belirli bir süre içinde maksimum bir kez çalışmasını sağlar
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Simple cache implementation
 */
export class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 dakika default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

/**
 * Stale-while-revalidate strategy
 */
export async function staleWhileRevalidate(key, fetchFn, cache) {
  const cached = cache.get(key);
  
  // Eğer cache'de varsa hemen döndür
  if (cached) {
    // Arka planda yeniden fetch et
    fetchFn().then(data => {
      cache.set(key, data);
    }).catch(() => {
      // Hata durumunda sessizce devam et
    });
    return cached;
  }
  
  // Cache'de yoksa fetch et
  const data = await fetchFn();
  cache.set(key, data);
  return data;
}

/**
 * Intersection Observer for lazy loading components
 */
export function observeElement(element, callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(element);
  return observer;
}

/**
 * Virtual scrolling helper (basit versiyon)
 */
export function virtualScroll(container, items, itemHeight, renderItem) {
  const containerHeight = container.clientHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  const scrollTop = container.scrollTop;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);

  return items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    offset: (startIndex + index) * itemHeight
  }));
}

