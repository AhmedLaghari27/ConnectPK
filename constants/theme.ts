import { createContext, useContext } from 'react';
import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';

export const brand = '#00B7CD';
export const light = {
  scrim: '#00000066', background: '#FAFAFA', surface: '#FFFFFF', surfaceMuted: '#F0F1F2',
  primary: '#007383', primarySoft: '#E3F7FA', onPrimary: '#FFFFFF', action: brand, onAction: '#102A30',
  text: '#191C20', textSecondary: '#5D636B', border: '#D5D9DE',
  success: '#217044', successSurface: '#EAF6EF', warning: '#875500', warningSurface: '#FFF4D6',
  error: '#B32E39', errorSurface: '#FFF0F1', focus: '#007383',
  // Compatibility aliases for existing screens; new components use semantic tokens.
  accent: '#E3F7FA', panel: '#E3F7FA', onPanel: '#191C20', panelMuted: '#5D636B', orbit: '#007383', bubble: '#C5EDF2',
};
export const dark: typeof light = {
  scrim: '#00000099', background: '#111214', surface: '#1B1D20', surfaceMuted: '#282B30',
  primary: '#57D5E4', primarySoft: '#13353B', onPrimary: '#102A30', action: brand, onAction: '#102A30',
  text: '#F4F5F6', textSecondary: '#B2B8C1', border: '#464B53',
  success: '#8AD6A7', successSurface: '#183324', warning: '#F3CD78', warningSurface: '#382C15',
  error: '#FFA5AC', errorSurface: '#3D2026', focus: '#57D5E4',
  accent: '#13353B', panel: '#1B1D20', onPanel: '#F4F5F6', panelMuted: '#B2B8C1', orbit: '#57D5E4', bubble: '#23505A',
};
export const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 28, lineHeight: 35, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  subtitle: { fontSize: 18, lineHeight: 23, fontWeight: '600' },
  label: { fontSize: 16, lineHeight: 23, fontWeight: '600' },
} satisfies Record<string, TextStyle>;
const shadow: ViewStyle = { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 };
export const theme = {
  colors: light, typography,
  spacing: { xs: 4, sm: 8, compact: 12, md: 16, lg: 24, xl: 32, xxl: 48, section: 48 },
  fontSizes: { caption: 12, small: 14, body: 16, heading: 28, subtitle: 18, title: 22, display: 28 },
  radius: { sm: 8, control: 12, md: 16, lg: 16, pill: 999 },
  shadows: { subtle: shadow },
  fonts: { display: Platform.OS === 'ios' ? 'System' : 'sans-serif' },
  layout: { content: 600, wide: 600, page: 600, control: 48, touch: 44, chip: 32, icon: 24, badge: 20, multiline: 120, header: 56, tabBar: 72 },
  border: { thin: 1, focus: 2 },
  avatar: { small: 32, medium: 40, large: 56, hero: 80 },
  opacity: { disabled: 0.45, pressed: 0.75 },
  motion: { enter: 200, feedback: 160, pressScale: 0.98 },
} as const;
const darkTheme = { ...theme, colors: dark, shadows: { subtle: { ...shadow, shadowOpacity: 0.2 } }, isDark: true };
const lightTheme = { ...theme, isDark: false };
export const ThemeModeContext = createContext<'light' | 'dark' | undefined>(undefined);
export function useTheme() {
  const override = useContext(ThemeModeContext);
  const system = useColorScheme();
  return (override ?? system) === 'dark' ? darkTheme : lightTheme;
}
export type Spacing = keyof typeof theme.spacing;
export type TextVariant = keyof typeof typography;
