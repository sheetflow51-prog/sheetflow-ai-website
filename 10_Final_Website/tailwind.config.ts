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
        /**
         * Every colour reads a CSS variable, so one class resolves differently per theme.
         * Light is the default; [data-theme="dark"] (on <html> or on any wrapper) restores the
         * original palette. The values live in globals.css under "THEME TOKENS".
         *
         * `white` is overridden on purpose: in this codebase it means "foreground", not "#fff"
         * (text-white, border-white/10, bg-white/5 ...), so it follows --c-fg. Text on a coloured
         * button uses the .btn-primary class, which keeps a literal white.
         */
        white: 'rgb(var(--c-fg) / <alpha-value>)',
        // Foundation
        void: 'rgb(var(--color-void) / <alpha-value>)',
        ink: {
          50: 'rgb(var(--c-ink-50) / <alpha-value>)',
          100: 'rgb(var(--c-ink-100) / <alpha-value>)',
          200: 'rgb(var(--c-ink-200) / <alpha-value>)',
          300: 'rgb(var(--c-ink-300) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          950: 'rgb(var(--c-ink-950) / <alpha-value>)',
        },
        // Surfaces
        surface: {
          0: 'rgb(var(--c-surface-0) / <alpha-value>)',
          1: 'rgb(var(--c-surface-1) / <alpha-value>)',
          2: 'rgb(var(--c-surface-2) / <alpha-value>)',
          3: 'rgb(var(--c-surface-3) / <alpha-value>)',
          4: 'rgb(var(--c-surface-4) / <alpha-value>)',
        },
        // Intelligence accent
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          bright: 'rgb(var(--color-accent-bright) / <alpha-value>)',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
          deep: 'rgb(var(--color-accent-deep) / <alpha-value>)',
          glow: 'rgb(var(--color-accent) / 0.15)',
        },
        // Gold: the logo's second brand colour
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          bright: 'rgb(var(--color-gold-bright) / <alpha-value>)',
          deep: 'rgb(var(--color-gold-deep) / <alpha-value>)',
        },
        /**
         * @deprecated Alias of `gold`, kept so existing `violet-*` classes keep resolving.
         */
        violet: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          bright: 'rgb(var(--color-gold-bright) / <alpha-value>)',
        },
        // Cyan: horizon light
        cyan: {
          DEFAULT: 'rgb(var(--color-cyan) / <alpha-value>)',
          bright: 'rgb(var(--color-cyan-bright) / <alpha-value>)',
        },
        // Status
        signal: {
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',
          danger: 'rgb(var(--color-danger) / <alpha-value>)',
          info: 'rgb(var(--color-info) / <alpha-value>)',
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
        'glow-sm': '0 0 20px rgb(var(--color-accent) / 0.15)',
        'glow': '0 0 40px rgb(var(--color-accent) / 0.2)',
        'glow-lg': '0 0 80px rgb(var(--color-accent) / 0.3)',
        'glow-violet': '0 0 60px rgb(var(--color-gold) / 0.25)',
        'card': '0 1px 0 rgb(var(--c-fg) / 0.05) inset, 0 8px 24px rgb(var(--c-shadow) / calc(0.3 * var(--k-shadow)))',
        'card-hover': '0 1px 0 rgb(var(--c-fg) / 0.08) inset, 0 20px 60px rgb(var(--c-shadow) / calc(0.4 * var(--k-shadow))), 0 0 0 1px rgb(var(--color-accent) / 0.1), 0 0 40px rgb(var(--color-accent) / 0.1)',
        'inner-highlight': '0 1px 0 rgb(var(--c-fg) / 0.08) inset',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 60% at 20% 20%, rgb(var(--color-accent) / 0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgb(var(--color-gold) / 0.12), transparent 60%), radial-gradient(ellipse 100% 60% at 50% 100%, rgb(var(--color-cyan) / 0.08), transparent 70%)',
        'grid-fade': 'linear-gradient(180deg, rgb(var(--c-fg) / 0.04) 0%, transparent 100%)',
        'gradient-headline': 'linear-gradient(180deg, rgb(var(--c-fg)) 0%, rgb(var(--c-fg) / 0.55) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--g1) 0%, var(--g2) 35%, var(--g5) 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at center, rgb(var(--color-accent) / 0.25), transparent 60%)',
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
