import { View, type ViewProps } from 'react-native';
import { useTheme, type Spacing } from '../../constants/theme';
export function Stack({ gap = 'md', style, ...props }: ViewProps & { gap?: Spacing }) {
  const t = useTheme();
  return <View {...props} style={[{ gap: t.spacing[gap] }, style]} />;
}
