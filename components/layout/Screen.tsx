import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/theme';

type ScreenProps = ViewProps & { scroll?: boolean; keyboard?: boolean; edges?: Edge[]; contentStyle?: StyleProp<ViewStyle> };
export function Screen({ children, scroll = false, keyboard = true, edges = ['top', 'bottom', 'left', 'right'], style, contentStyle, ...props }: ScreenProps) {
  const t = useTheme();
  const content: ViewStyle = { flexGrow: 1, width: '100%', maxWidth: t.layout.content, alignSelf: 'center', padding: t.spacing.md };
  return <SafeAreaView {...props} edges={edges} style={[{ flex: 1, backgroundColor: t.colors.background }, style]}>
    <KeyboardAvoidingView enabled={keyboard} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} style={{ flex: 1 }}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[content, contentStyle]}>{children}</ScrollView> : <View style={[content, { flex: 1 }, contentStyle]}>{children}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
