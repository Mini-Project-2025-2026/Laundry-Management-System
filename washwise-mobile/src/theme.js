// Same visual identity as the web console: a counter clerk's order ticket,
// stamped as it moves through the wash stages. Cool "launderette tile"
// palette rather than a generic app-template look.

export const colors = {
  ink: '#1C2430',
  inkSoft: '#5B6B7C',
  paper: '#EDEEE9',
  panel: '#FFFFFF',
  line: '#DCDCD4',
  steel: '#2B5876',
  steelDark: '#1D3F57',
  stamp: '#E2A63B',
  stampDark: '#B6822A',
  stampInk: '#2A1C04',
  good: '#3F7D5C',
  goodSoft: '#E5F0EA',
  alert: '#C1502E',
  alertSoft: '#F7E6E0',
  warnSoft: '#FAF0DD',
  warnInk: '#8A6A1F',
  // Vivid blue used for the splash + welcome gradient (per shared UI reference).
  gradientTop: '#12308C',
  gradientMid: '#1B54E8',
};

// Dark-navy palette for the laundry-owner dashboard screens (Business/Orders),
// per a separate shared UI reference — kept distinct from the light customer
// theme above rather than mixed in, since only the owner side uses it.
export const darkColors = {
  bg: '#0A1B32',
  card: '#132A4D',
  cardBorder: '#22385C',
  accent: '#1B54E8',
  accentSoft: '#1E3A6B',
  textPrimary: '#FFFFFF',
  textMuted: '#8CA3C4',
  good: '#2FBF71',
  goodSoft: '#12331F',
  alert: '#E2574C',
  alertSoft: '#3A1E1C',
  stamp: '#E2A63B',
};

// Font family keys — matched to what App.js loads via useFonts().
// Falls back to system fonts automatically if a font hasn't loaded yet,
// since RN silently ignores an unrecognized fontFamily.
export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
  monoRegular: 'IBMPlexMono_400Regular',
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const spacing = (n) => n * 4;
