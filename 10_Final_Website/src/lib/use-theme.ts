'use client';

import { useSyncExternalStore } from 'react';
import { DEFAULT_THEME, THEME_EVENT, readTheme, type Theme } from '@/lib/theme';

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

/** The active theme. Server and first client render agree on the default, then it follows the document. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
}
