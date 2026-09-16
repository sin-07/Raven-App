// Raven Tutorials Mobile - Professional Monochrome (Black & White) Design System
// High-contrast, executive aesthetic inspired by Apple, Linear, and Vercel

export const COLORS = {
  // Pure Pitch & Obsidian Backgrounds
  background: '#000000',           // Pure true OLED black
  backgroundSecondary: '#09090B',  // Zinc dark obsidian
  surface: '#111113',              // Primary dark card surface
  surfaceLight: '#18181B',         // Elevated tiles, inputs, and list items
  surfaceLighter: '#27272A',       // Active chips and interactive hover states
  surfaceHighlight: 'rgba(255, 255, 255, 0.05)',

  // High-Contrast Pure White (Primary Brand)
  primary: '#FFFFFF',              // Pure crisp white (signature CTA)
  primaryLight: '#F4F4F5',         // Soft bright white
  primaryDark: '#D4D4D8',          // Refined metallic silver
  primaryMuted: 'rgba(255, 255, 255, 0.12)',
  primaryBorder: 'rgba(255, 255, 255, 0.22)',

  // Monochrome Metallic / Silver Tones (Subtle accents)
  amber: '#E4E4E7',                // Platinum highlight
  amberMuted: 'rgba(255, 255, 255, 0.08)',
  blue: '#D4D4D8',                 // Cool titanium
  blueMuted: 'rgba(255, 255, 255, 0.08)',
  purple: '#A1A1AA',               // Deep graphite
  purpleMuted: 'rgba(255, 255, 255, 0.08)',
  rose: '#FFFFFF',                 // High-contrast clean white alert
  roseMuted: 'rgba(255, 255, 255, 0.12)',
  cyan: '#F4F4F5',                 // Bright frost
  cyanMuted: 'rgba(255, 255, 255, 0.08)',

  // Precision Hairline Borders
  border: '#27272A',               // Clean dark zinc border
  borderLight: '#3F3F46',          // Interactive focus & card rim
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // Typography Hierarchy
  text: '#FFFFFF',                 // Primary high-contrast text
  textSecondary: '#A1A1AA',        // Secondary legibility gray
  textMuted: '#71717A',            // Tertiary muted caption gray
  textInverse: '#000000',          // Pitch black text for white buttons

  // Status (Refined Monochrome with subtle semantics)
  success: '#FFFFFF',
  warning: '#E4E4E7',
  error: '#EF4444',                // Subtle red retained strictly for form errors
  info: '#A1A1AA',

  // Bottom Navigation Bar
  tabBarBg: '#09090B',
  tabBarBorder: '#1F1F23',
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#52525B',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  heavy: 'System',
};
