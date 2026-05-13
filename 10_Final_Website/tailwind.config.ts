import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '2.5rem',
        xl: '3rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Foundation
        void: '#060608',
        ink: {
          50: '#FFFFFF',
          100: '#F5F7FA',
          200: '#D6DCE8',
          300: '#A0A8BC',
          400: '#6B7490',
          500: '#3D4460',
          600: '#2A3045',
          700: '#1E2435',
          800: '#141720',
          900: '#0F1117',
          950: '#0A0B0F',
        },
        // Surfaces
        surface: {
          0: '#060608',
          1: '#0A0B0F',
          2: '#0F1117',
          3: '#141720',
          4: '#1A1F2E',
        },
        // Intelligence accent
        accent: {
          DEFAULT: '#6366F1',
          bright: '#818CF8',
          light: '#A5B4FC',
          deep: '#4F46E5',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          bright: '#A78BFA',
        },
        // Status
        signal: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
          info: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Cinematic scale
        'monument': ['clamp(64px, 9vw, 128px)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '700' }],
        'cinematic': ['clamp(48px, 6.5vw, 96px)', { lineHeight: '0.98', letterSpacing: '-0.035em', fontWeight: '700' }],
        'headline': ['clamp(36px, 5vw, 64px)', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        'subhead': ['clamp(24px, 3vw, 36px)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'kicker': ['11px', { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '500' }],
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'wide': '0.02em',
        'wider': '0.08em',
        'widest': '0.12em',
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        'full': '999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '128': '32rem',
        '144': '36rem',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow': '0 0 40px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 80px rgba(99, 102, 241, 0.3)',
        'glow-violet': '0 0 60px rgba(139, 92, 246, 0.25)',
        'card': '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.1)',
        'inner-highlight': '0 1px 0 rgba(255,255,255,0.08) inset',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(139,92,246,0.12), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6,182,212,0.08), transparent 70%)',
        'grid-fade': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        'gradient-headline': 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.55) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #06B6D4 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(40px) rotate(-360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'scan-line': {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-blur': {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0px)' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'data-flow': 'data-flow 3s linear infinite',
        'scan-line': 'scan-line 4s ease-in-out infinite',
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'reveal-blur': 'reveal-blur 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
