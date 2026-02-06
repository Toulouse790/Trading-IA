/**
 * Theme Context for Dark/Light Mode
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'trading_ia_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update document class for global CSS
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme colors utility
export const themeColors = {
  dark: {
    bg: 'bg-black',
    bgSecondary: 'bg-[#0a0a0a]',
    bgCard: 'bg-gray-900/50',
    bgInput: 'bg-gray-800',
    border: 'border-gray-800',
    borderLight: 'border-gray-700',
    text: 'text-gray-200',
    textSecondary: 'text-gray-400',
    textMuted: 'text-gray-500',
  },
  light: {
    bg: 'bg-gray-50',
    bgSecondary: 'bg-white',
    bgCard: 'bg-white',
    bgInput: 'bg-gray-100',
    border: 'border-gray-200',
    borderLight: 'border-gray-300',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
  },
};

// Hook to get theme-aware classes
export const useThemeClasses = () => {
  const { isDark } = useTheme();
  return isDark ? themeColors.dark : themeColors.light;
};
