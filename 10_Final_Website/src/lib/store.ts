import { create } from 'zustand';

interface SheetFlowStore {
  // Loading
  hasBooted: boolean;
  setBooted: (booted: boolean) => void;

  // Navigation
  navScrolled: boolean;
  setNavScrolled: (scrolled: boolean) => void;

  // Cursor
  cursorVariant: 'default' | 'hover' | 'click' | 'text';
  setCursorVariant: (v: SheetFlowStore['cursorVariant']) => void;

  // Scroll progress (0-1)
  scrollProgress: number;
  setScrollProgress: (p: number) => void;

  // Reduced motion
  reducedMotion: boolean;
  setReducedMotion: (r: boolean) => void;

  // Awakening — one-shot cinematic moment after boot
  awakeningProgress: number; // 0 = pre-awakening, 1 = fully awoken
  setAwakeningProgress: (p: number) => void;

  // Audio
  audioEnabled: boolean;
  audioInitialized: boolean;
  setAudioEnabled: (v: boolean) => void;
  setAudioInitialized: (v: boolean) => void;
}

export const useStore = create<SheetFlowStore>((set) => ({
  hasBooted: false,
  setBooted: (booted) => set({ hasBooted: booted }),

  navScrolled: false,
  setNavScrolled: (scrolled) => set({ navScrolled: scrolled }),

  cursorVariant: 'default',
  setCursorVariant: (v) => set({ cursorVariant: v }),

  scrollProgress: 0,
  setScrollProgress: (p) => set({ scrollProgress: p }),

  reducedMotion: false,
  setReducedMotion: (r) => set({ reducedMotion: r }),

  awakeningProgress: 0,
  setAwakeningProgress: (p) => set({ awakeningProgress: p }),

  audioEnabled: false,
  audioInitialized: false,
  setAudioEnabled: (v) => set({ audioEnabled: v }),
  setAudioInitialized: (v) => set({ audioInitialized: v }),
}));
