/**
 * Theme Toggle Component
 * Switch between dark and light mode
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-amber-400'
            : 'bg-gray-200 hover:bg-gray-300 text-blue-600'
        }`}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      isDark ? 'bg-gray-800/50' : 'bg-gray-100'
    }`}>
      <Sun className={`w-5 h-5 transition-colors ${
        !isDark ? 'text-amber-500' : 'text-gray-500'
      }`} />

      <button
        onClick={toggleTheme}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
            isDark ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>

      <Moon className={`w-5 h-5 transition-colors ${
        isDark ? 'text-blue-400' : 'text-gray-400'
      }`} />
    </div>
  );
};

export default ThemeToggle;
