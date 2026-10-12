import { Text as NativeText, type TextProps } from 'react-native';
import { useTheme, type TextVariant } from '../../constants/theme';
export function Text({ variant = 'body', secondary = false, style, ...props }: TextProps & { variant?: TextVariant; secondary?: boolean }) {
  const t = useTheme();
  return <NativeText {...props} style={[t.typography[variant], { color: secondary ? t.colors.textSecondary : t.colors.text, flexShrink: 1 }, style]} />;
}
