import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext } from './ThemeContext';
import type { Theme } from './ThemeContext';
import inkMaskSprite from '../assets/masks/theme-ink-sprite.webp';

const THEME_STORAGE_KEY = 'kimdave-theme';

type ViewTransitionHandle = {
  finished: Promise<void>;
  ready: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransitionHandle;
};

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

function applyThemeToDom(nextTheme: Theme): void {
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', nextTheme === 'dark' ? '#0E0E0E' : '#F7F5F0');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    return 'dark';
  });

  const themeRef = useRef<Theme>(theme);
  const isTransitioningRef = useRef(false);

  // Sync DOM attribute on mount and whenever theme state settles
  useEffect(() => {
    themeRef.current = theme;
    applyThemeToDom(theme);
  }, [theme]);

  // Preload ink-wash sprite on idle so it never competes with hero LCP
  useEffect(() => {
    const win = window as IdleWindow;
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const preloadMask = () => {
      const img = new Image();
      img.decoding = 'async';
      img.src = inkMaskSprite;
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(preloadMask, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(preloadMask, 1200);
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const commitThemeChange = useCallback((nextTheme: Theme) => {
    if (nextTheme === themeRef.current || isTransitioningRef.current) {
      return;
    }

    const doc = document as ViewTransitionDocument;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof doc.startViewTransition !== 'function' || prefersReducedMotion) {
      themeRef.current = nextTheme;
      applyThemeToDom(nextTheme);
      setThemeState(nextTheme);
      return;
    }

    isTransitioningRef.current = true;
    document.documentElement.classList.add('theme-transitioning');

    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      window.clearTimeout(safetyTimerId);
      document.documentElement.classList.remove('theme-transitioning');
      isTransitioningRef.current = false;
    };

    const safetyTimerId = window.setTimeout(cleanup, 1200);

    try {
      const transition = doc.startViewTransition(() => {
        themeRef.current = nextTheme;
        applyThemeToDom(nextTheme);
        flushSync(() => {
          setThemeState(nextTheme);
        });
      });

      transition.finished.then(cleanup, cleanup);
    } catch {
      themeRef.current = nextTheme;
      applyThemeToDom(nextTheme);
      setThemeState(nextTheme);
      cleanup();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = themeRef.current === 'dark' ? 'light' : 'dark';
    commitThemeChange(nextTheme);
  }, [commitThemeChange]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      commitThemeChange(newTheme);
    },
    [commitThemeChange]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
