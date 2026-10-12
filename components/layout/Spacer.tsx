import { View } from 'react-native';
import { useTheme, type Spacing } from '../../constants/theme';
export function Spacer({ size = 'md', horizontal = false }: { size?: Spacing; horizontal?: boolean }) {
  const t = useTheme();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={horizontal ? { width: t.spacing[size] } : { height: t.spacing[size] }} />;
}
