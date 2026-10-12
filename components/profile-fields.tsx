import { Pressable, Image, StyleSheet, Text, View, type TextInputProps } from 'react-native';
import { EmailInput, ErrorMessage, useUiStyles } from './onboarding-ui';
import { useTheme } from '../constants/theme';

export function ProfileField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const s = useUiStyles(); const t = useTheme();
  return <View style={s.field}><Text style={s.label}>{label}</Text>
    <EmailInput {...props} accessibilityLabel={label} style={{minHeight:props.multiline?t.layout.multiline:t.layout.control,paddingVertical:t.spacing.sm,borderRadius:t.radius.control,textAlignVertical:props.multiline?'top':'center'}} />
    <ErrorMessage message={error ?? null} /></View>;
}
export function ProfileChoices({ label, values, labels = values, value, onChange, error, disabled }: {
  label: string; values: readonly string[]; labels?: readonly string[]; value: string;
  onChange: (value: string) => void; error?: string; disabled?: boolean;
}) {
  const t = useTheme(); const s = useUiStyles();
  return <View style={s.field}><Text style={s.label}>{label}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
      {values.map((option, i) => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={labels[i]}
        accessibilityState={{ selected: option === value, disabled }} disabled={disabled} onPress={() => onChange(option)}
        style={({ pressed }) => [s.checkRow, option === value && s.checkSelected, pressed && s.pressed]}>
        <Text style={s.label}>{labels[i]}</Text>
      </Pressable>)}
    </View><ErrorMessage message={error ?? null} /></View>;
}
export function ProfileProgress({ step }: { step: number }) {
  const t = useTheme(); const s = useUiStyles();
  return <View style={s.field}>
    <Text style={s.overline}>{`YOUR PROFILE · STEP ${step} OF 5`}</Text>
    <View accessibilityRole="progressbar" accessibilityLabel="Profile setup progress"
      accessibilityValue={{ min: 0, max: 5, now: step, text: `Step ${step} of 5` }}
      style={{ height: t.spacing.sm, backgroundColor: t.colors.border, borderRadius: t.radius.pill, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${step * 20}%`, backgroundColor: t.colors.primary }} />
    </View>
  </View>;
}
export function ProfilePhoto({ uri }: { uri: string }) {
  const t = useTheme();
  return <Image accessibilityLabel="Your selected profile photo" source={{ uri }}
    style={{ width: t.avatar.hero, height: t.avatar.hero, borderRadius: t.radius.pill, borderColor: t.colors.border, borderWidth: StyleSheet.hairlineWidth }} />;
}
