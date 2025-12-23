/**
 * Design Tokens
 * Modern SaaS tasarım sistemi için design tokens
 */

export const colors = {
  // Light mode colors
  light: {
    background: '#FFFFFF',
    foreground: '#0A0A0A',
    card: '#FFFFFF',
    'card-foreground': '#0A0A0A',
    primary: '#3B82F6',
    'primary-foreground': '#FFFFFF',
    secondary: '#F3F4F6',
    'secondary-foreground': '#1F2937',
    muted: '#F9FAFB',
    'muted-foreground': '#6B7280',
    accent: '#F0F9FF',
    'accent-foreground': '#1E40AF',
    destructive: '#EF4444',
    'destructive-foreground': '#FFFFFF',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#3B82F6',
  },
  // Risk seviyesi renkleri
  risk: {
    dusuk: '#10B981',    // Green
    orta: '#F59E0B',     // Amber
    yuksek: '#F97316',   // Orange
    kritik: '#EF4444',   // Red
  },
  // Program renkleri
  program: {
    DOKTORA: '#3B82F6',
    TEZLI_YL: '#8B5CF6',
    TEZSIZ_IO: '#10B981',
    TEZSIZ_UZAKTAN: '#F59E0B',
  },
};

export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const typography = {
  'text-xs': '0.75rem',    // 12px
  'text-sm': '0.875rem',   // 14px
  'text-base': '1rem',     // 16px
  'text-lg': '1.125rem',   // 18px
  'text-xl': '1.25rem',    // 20px
  'text-2xl': '1.5rem',    // 24px
  'text-3xl': '1.875rem',  // 30px
  'text-4xl': '2.25rem',   // 36px
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  default: '0.375rem',  // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const animations = {
  duration: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  animations,
};

