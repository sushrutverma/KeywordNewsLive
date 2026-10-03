import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  darkness: number;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setDarkness: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Computes dynamic CSS custom properties based on darkness percentage (10% to 100%)
export const calculateDarknessTokens = (level: number) => {
  const normalized = Math.max(10, Math.min(100, Math.round(level)));
  const t = (normalized - 10) / 90; // 0.0 (at 10%) to 1.0 (at 100%)

  // Interpolate body background from #1f2229 (31, 34, 41 - soft dark) to #000000 (0, 0, 0 - OLED black)
  const bgR = Math.round(31 * (1 - t));
  const bgG = Math.round(34 * (1 - t));
  const bgB = Math.round(41 * (1 - t));
  const bgHex = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`;

  // Interpolate glass card background from rgba(38, 42, 51, 0.85) to rgba(7, 7, 9, 0.95)
  const cardR = Math.round(38 * (1 - t) + 7 * t);
  const cardG = Math.round(42 * (1 - t) + 7 * t);
  const cardB = Math.round(51 * (1 - t) + 9 * t);
  const cardAlpha = (0.85 + 0.10 * t).toFixed(2);
  const cardBg = `rgba(${cardR}, ${cardG}, ${cardB}, ${cardAlpha})`;

  // Interpolate card border from rgba(65, 70, 84, 0.6) to rgba(38, 38, 48, 0.85)
  const borderR = Math.round(65 * (1 - t) + 38 * t);
  const borderG = Math.round(70 * (1 - t) + 38 * t);
  const borderB = Math.round(84 * (1 - t) + 48 * t);
  const borderAlpha = (0.60 + 0.25 * t).toFixed(2);
  const cardBorder = `rgba(${borderR}, ${borderG}, ${borderB}, ${borderAlpha})`;

  return { bgHex, cardBg, cardBorder, normalized };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Check user system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [darkness, setDarknessState] = useState<number>(() => {
    const saved = localStorage.getItem('darkness_level');
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 10 && val <= 100) return val;
    }
    return 85; // Default: 85% deep charcoal
  });

  const setDarkness = (level: number) => {
    const clamped = Math.max(10, Math.min(100, Math.round(level)));
    setDarknessState(clamped);
    localStorage.setItem('darkness_level', clamped.toString());
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      const { bgHex, cardBg, cardBorder, normalized } = calculateDarknessTokens(darkness);
      root.style.setProperty('--bg-dark', bgHex);
      root.style.setProperty('--card-bg-dark', cardBg);
      root.style.setProperty('--card-border-dark', cardBorder);
      root.style.setProperty('--darkness-level', `${normalized}%`);
    } else {
      root.classList.remove('dark');
      root.style.removeProperty('--bg-dark');
      root.style.removeProperty('--card-bg-dark');
      root.style.removeProperty('--card-border-dark');
      root.style.removeProperty('--darkness-level');
    }
    localStorage.setItem('theme', theme);
  }, [theme, darkness]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, darkness, toggleTheme, setTheme, setDarkness }}>
      {children}
    </ThemeContext.Provider>
  );
};