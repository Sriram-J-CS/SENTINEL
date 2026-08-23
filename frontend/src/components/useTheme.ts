import { useState, useEffect } from 'react';

/**
 * Tracks the current theme (dark/light) by watching <html>.classList.
 * Returns an object of theme-aware colors safe to pass to Recharts, SVGs, and inline styles.
 */
export function useTheme() {
  const isDark = () => document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return {
    dark,

    // Background layers
    bgBase:       dark ? '#050810' : '#EBF5FF', // Light Blue background in light mode
    bgSurface:    dark ? '#080C14' : '#FFFFFF',
    bgCard:       dark ? '#0C1220' : '#FFFFFF',
    bgPanel:      dark ? '#0A1018' : '#F0F9FF',
    bgInput:      dark ? '#06080F' : '#E0F2FE', // Light blue input tint in light mode
    bgSidebar:    dark ? '#030508' : '#F0F9FF', // Light blue sidebar in light mode
    bgHeader:     dark ? 'rgba(5,8,16,0.92)' : 'rgba(235,245,255,0.92)',
    bgHighlight:  dark ? 'rgba(255,255,255,0.04)' : 'rgba(14,165,233,0.08)',

    // Text - Dark letters in light mode, White in dark mode
    textPrimary:   dark ? '#F8FAFC' : '#0F172A', // Pure crisp white vs near black
    textSecondary: dark ? '#CBD5E1' : '#334155', // Slate-300 vs Slate-700
    textMuted:     dark ? '#64748B' : '#64748B', // Slate-500
    textInverse:   dark ? '#0F172A' : '#F8FAFC',

    // Borders
    borderBase:    dark ? 'rgba(255,255,255,0.08)' : 'rgba(14,165,233,0.25)',
    borderSubtle:  dark ? 'rgba(255,255,255,0.04)' : 'rgba(14,165,233,0.12)',
    borderAccent:  dark ? 'rgba(34,211,238,0.4)'   : 'rgba(14,165,233,0.5)',

    // Accents: Dark mode (black + red/blue/green) vs Light mode (light blue + emerald/red/amber)
    accentCyan:    dark ? '#38BDF8' : '#0284C7', // Sky-400 vs Sky-600
    accentGreen:   dark ? '#10B981' : '#059669', // Emerald-500 vs Emerald-600
    accentRed:     dark ? '#F43F5E' : '#DC2626', // Rose-500 vs Red-600
    accentAmber:   dark ? '#FBBF24' : '#D97706', // Amber-400 vs Amber-600
    accentViolet:  dark ? '#A78BFA' : '#7C3AED',

    // Chart-specific props (for Recharts axes, grids, and tooltips)
    chartAxis:          dark ? '#64748B' : '#64748B',
    chartTick:          dark ? '#94A3B8' : '#334155',
    chartGrid:          dark ? 'rgba(255,255,255,0.05)' : 'rgba(14,165,233,0.12)',
    chartTooltipBg:     dark ? '#0D1322' : '#FFFFFF',
    chartTooltipBorder: dark ? 'rgba(255,255,255,0.15)' : 'rgba(14,165,233,0.3)',
    chartTooltipText:   dark ? '#F8FAFC' : '#0F172A',
  };
}
