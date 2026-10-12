import { View, type ViewProps } from 'react-native';
import { useTheme, type Spacing } from '../../constants/theme';
export function Row({ gap = 'sm', wrap = false, style, ...props }: ViewProps & { gap?: Spacing; wrap?: boolean }) {
  const t = useTheme();
  return <View {...props} style={[{ flexDirection: 'row', alignItems: 'center', gap: t.spacing[gap], flexWrap: wrap ? 'wrap' : 'nowrap' }, style]} />;
}
