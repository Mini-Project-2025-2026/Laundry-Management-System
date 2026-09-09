// Fresh, airy Light Sky Blue palette inspired by modern Scandinavian
// laundromats — crisp porcelain surfaces, fresh linen whites, and luminous sky blue accents.

export const colors = {
  ink: '#0F172A',         // Deep slate, crisp & readable
  inkSoft: '#64748B',     // Neutral slate text
  paper: '#F8FAFC',       // Clean, fresh porcelain background
  panel: '#FFFFFF',       // Pure card white
  panelAlt: '#F0F9FF',    // Soft ice sky tinted surface
  line: '#E2E8F0',        // Subtle crisp border
  steel: '#0284C7',       // Sky blue accent
  steelDark: '#0369A1',   // Deep sky tone
  tabBarBg: '#FFFFFF',    // Clean bright tab bar
  tabBarBorder: '#E2E8F0',
  stamp: '#F59E0B',       // Warm honey amber for stars & badges
  stampDark: '#D97706',
  stampInk: '#78350F',
  good: '#10B981',        // Fresh emerald green
  goodSoft: '#ECFDF5',
  alert: '#EF4444',       // Clean coral red
  alertSoft: '#FEF2F2',
  warnSoft: '#FFFBEB',
  warnInk: '#B45309',
  brand: '#0EA5E9',       // Luminous light sky blue primary
  brandDark: '#0284C7',   // Rich sky contrast
  brandSoft: '#E0F2FE',   // Fresh water soft tint
  brandLight: '#F0F9FF',  // Pale ice blue background
  gradientTop: '#0284C7', // Clean sky top
  gradientMid: '#0EA5E9', // Luminous light sky blue
};

// Owner dashboard palette (refined slate-blue rather than muddy black)
export const darkColors = {
  bg: '#0F172A',
  card: '#1E293B',
  cardBorder: '#334155',
  accent: '#0EA5E9',
  accentSoft: '#0284C7',
  textPrimary: '#FFFFFF',
  textMuted: '#94A3B8',
  good: '#10B981',
  goodSoft: '#064E3B',
  alert: '#EF4444',
  alertSoft: '#450A0A',
  stamp: '#F59E0B',
};

export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
  monoRegular: 'IBMPlexMono_400Regular',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const spacing = (n) => n * 4;
