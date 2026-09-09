/**
 * MoEYS Cambodian Public High School Management System
 * Theme and Color Customization Engine
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorPaletteId =
  | 'moeys-blue'
  | 'angkor-crimson'
  | 'emerald-jade'
  | 'royal-violet'
  | 'deep-navy'
  | 'amber-gold';

export interface ColorPaletteDef {
  id: ColorPaletteId;
  nameKhmer: string;
  nameEnglish: string;
  descriptionKhmer: string;
  descriptionEnglish: string;
  primaryColor: string; // Hex for preview circles
  accentColor: string;
  gradientClass: string;
}

export const COLOR_PALETTES: ColorPaletteDef[] = [
  {
    id: 'moeys-blue',
    nameKhmer: 'ខៀវក្រសួងអប់រំ (MoEYS Standard)',
    nameEnglish: 'MoEYS Royal Blue & Gold',
    descriptionKhmer: 'ពណ៌ខៀវផ្លូវការនៃក្រសួងអប់រំ យុវជន និងកីឡា ជាមួយក្បូរក្បាច់មាស',
    descriptionEnglish: 'Official Ministry of Education standard blue with golden accents',
    primaryColor: '#2563eb',
    accentColor: '#f59e0b',
    gradientClass: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'angkor-crimson',
    nameKhmer: 'ក្រហមប្រាសាទអង្គរ (Angkor Crimson)',
    nameEnglish: 'Angkor Crimson & Gold',
    descriptionKhmer: 'ពណ៌ក្រហមឆ្អៅរាជវាំងបុរាណខ្មែរ រំលេចដោយពណ៌មាសសិរីមង្គល',
    descriptionEnglish: 'Regal Cambodian crimson red with auspicious gold accents',
    primaryColor: '#e11d48',
    accentColor: '#f59e0b',
    gradientClass: 'from-rose-600 to-red-800',
  },
  {
    id: 'emerald-jade',
    nameKhmer: 'ត្បូងមរកត និងបៃតង (Emerald Jade)',
    nameEnglish: 'Emerald Jade & Teal',
    descriptionKhmer: 'ពណ៌បៃតងត្បូងមរកត តំណាងឱ្យភាពចម្រើនលូតលាស់នៃបញ្ញាសិស្ស',
    descriptionEnglish: 'Fresh emerald green representing academic growth and vitality',
    primaryColor: '#059669',
    accentColor: '#eab308',
    gradientClass: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'royal-violet',
    nameKhmer: 'ស្វាយរាជវាំង (Royal Violet)',
    nameEnglish: 'Royal Violet & Indigo',
    descriptionKhmer: 'ពណ៌ស្វាយថ្លៃថ្នូរ ទំនើប និងមានភាពច្នៃប្រឌិតខ្ពស់',
    descriptionEnglish: 'Dignified royal purple and indigo with high creative aesthetic',
    primaryColor: '#7c3aed',
    accentColor: '#f59e0b',
    gradientClass: 'from-violet-600 to-purple-800',
  },
  {
    id: 'deep-navy',
    nameKhmer: 'ខៀវសមុទ្រជ្រៅ (Deep Navy)',
    nameEnglish: 'Deep Navy & Electric Cyan',
    descriptionKhmer: 'ពណ៌ខៀវជ្រៅបច្ចេកវិទ្យា ផ្តល់នូវអារម្មណ៍ផ្តោតអារម្មណ៍ និងរៀបរយ',
    descriptionEnglish: 'High-tech deep navy with electric cyan for high focus and clarity',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    gradientClass: 'from-sky-600 to-blue-900',
  },
  {
    id: 'amber-gold',
    nameKhmer: 'សំរឹទ្ធមាស (Amber Gold)',
    nameEnglish: 'Amber Gold & Bronze',
    descriptionKhmer: 'ពណ៌មាសសំរឹទ្ធខ្មែរបុរាណ ផ្តល់ភាពកក់ក្តៅ និងកិត្តិយសសិក្សា',
    descriptionEnglish: 'Warm ancient Khmer bronze and amber gold signifying scholastic prestige',
    primaryColor: '#d97706',
    accentColor: '#f97316',
    gradientClass: 'from-amber-600 to-orange-800',
  },
];

const THEME_STORAGE_KEY = 'moeys_theme_mode';
const PALETTE_STORAGE_KEY = 'moeys_color_palette';

export function getStoredTheme(): { mode: ThemeMode; palette: ColorPaletteId } {
  if (typeof window === 'undefined') {
    return { mode: 'light', palette: 'moeys-blue' };
  }

  const storedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  const storedPalette = localStorage.getItem(PALETTE_STORAGE_KEY) as ColorPaletteId | null;

  const mode: ThemeMode =
    storedMode && ['light', 'dark', 'system'].includes(storedMode) ? storedMode : 'light';
  const palette: ColorPaletteId =
    storedPalette && COLOR_PALETTES.some((p) => p.id === storedPalette)
      ? storedPalette
      : 'moeys-blue';

  return { mode, palette };
}

export function applyTheme(mode: ThemeMode, palette: ColorPaletteId) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Set Palette attribute
  root.setAttribute('data-palette', palette);

  // Set Dark/Light Mode
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Persist in localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  } catch (e) {
    // Ignore storage write errors (e.g. incognito quota)
  }
}
