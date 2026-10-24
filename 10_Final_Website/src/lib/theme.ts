/**
 * Theme: Light is the default, always.
 *
 * The founder's rule (2026-10-21): the site loads in Light mode regardless of
 * the visitor's operating-system setting, and Dark is something a visitor chooses
 * with the toggle in the navigation. So there is deliberately no
 * `prefers-color-scheme` anywhere in this codebase; only an explicit choice,
 * saved in `localStorage`, changes the default. To flip the default, change
 * `DEFAULT_THEME` here and nothing else.
 *
 * The palette itself lives in `globals.css` under "THEME TOKENS". Dark is the
 * original SheetFlow palette, unchanged. Any element can opt into it with
 * `data-theme="dark"`, which is how the hero and the other 3D "stage" panels stay
 * dark inside the light page.
 */

export type Theme = 'light' | 'dark';

export const DEFAULT_THEME: Theme = 'light';
export const THEME_KEY = 'sf-theme';
export const THEME_EVENT = 'sf-theme';
export const THEME_COLOR: Record<Theme, string> = { light: '#F6F7FA', dark: '#060608' };

/**
 * Runs in <head> before first paint (inlined by layout.tsx), so there is no flash
 * of the wrong theme. `?theme=dark|light` exists for screenshots and QA only.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,t='${DEFAULT_THEME}';var s=localStorage.getItem('${THEME_KEY}');if(s==='dark'||s==='light')t=s;var m=/[?&]theme=(dark|light)\\b/.exec(location.search);if(m)t=m[1];d.setAttribute('data-theme',t);var c=document.querySelector('meta[name="theme-color"]');if(c)c.setAttribute('content',t==='dark'?'${THEME_COLOR.dark}':'${THEME_COLOR.light}')}catch(e){}})();`;

export function readTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Applies and (optionally) remembers a theme, with a short class-scoped cross-fade. */
export function applyTheme(theme: Theme, persist = true): void {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  root.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private mode or blocked storage: the choice just lasts for this visit */
    }
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  window.setTimeout(() => root.classList.remove('theme-anim'), 450);
}
