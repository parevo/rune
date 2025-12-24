import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ColorPalette = 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'cyan';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorPalette: ColorPalette;
    setColorPalette: (palette: ColorPalette) => void;
    resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color palette definitions (HSL values for primary color)
const COLOR_PALETTES: Record<ColorPalette, { primary: string; ring: string; name: string }> = {
    blue: { primary: '217.2 91.2% 59.8%', ring: '224.3 76.3% 48%', name: 'Ocean Blue' },
    purple: { primary: '262.1 83.3% 57.8%', ring: '263.4 70% 50.4%', name: 'Royal Purple' },
    green: { primary: '142.1 76.2% 36.3%', ring: '142.1 70.6% 45.3%', name: 'Forest Green' },
    orange: { primary: '24.6 95% 53.1%', ring: '20.5 90.2% 48.2%', name: 'Sunset Orange' },
    rose: { primary: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%', name: 'Rose Pink' },
    cyan: { primary: '189.6 94.5% 42.7%', ring: '188.7 85.7% 53.3%', name: 'Cyber Cyan' },
};

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'System' },
];

export const PALETTE_OPTIONS: { value: ColorPalette; label: string; color: string }[] = [
    { value: 'blue', label: 'Ocean Blue', color: '#3b82f6' },
    { value: 'purple', label: 'Royal Purple', color: '#8b5cf6' },
    { value: 'green', label: 'Forest Green', color: '#22c55e' },
    { value: 'orange', label: 'Sunset Orange', color: '#f97316' },
    { value: 'rose', label: 'Rose Pink', color: '#f43f5e' },
    { value: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('rune-theme');
        return (stored as Theme) || 'dark';
    });

    const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => {
        const stored = localStorage.getItem('rune-color-palette');
        return (stored as ColorPalette) || 'blue';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

    // Handle system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateResolvedTheme = () => {
            if (theme === 'system') {
                setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
            } else {
                setResolvedTheme(theme);
            }
        };

        updateResolvedTheme();
        mediaQuery.addEventListener('change', updateResolvedTheme);
        return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }, [theme]);

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);

    // Apply color palette
    useEffect(() => {
        const root = document.documentElement;
        const palette = COLOR_PALETTES[colorPalette];
        root.style.setProperty('--primary', palette.primary);
        root.style.setProperty('--ring', palette.ring);
    }, [colorPalette]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('rune-theme', newTheme);
        setThemeState(newTheme);
    };

    const setColorPalette = (newPalette: ColorPalette) => {
        localStorage.setItem('rune-color-palette', newPalette);
        setColorPaletteState(newPalette);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorPalette, setColorPalette, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
