import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../constants/theme';
export function HomeFeedFilters({ groups }: { groups: { label: string; options: {value: string; label: string}[]; selected: string; onSelect: (value: string) => void }[] }) {
  const t = useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" accessibilityLabel="Feed filters" contentContainerStyle={{ gap: t.spacing.sm, paddingVertical: t.spacing.xs }}>
    {groups.map(group => <View key={group.label} style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm}}>{group.options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={`${group.label}: ${option.label}`} accessibilityState={{selected:group.selected===option.value}} onPress={()=>group.onSelect(option.value)} style={({pressed})=>({minHeight:t.layout.touch,justifyContent:'center',opacity:pressed?t.opacity.pressed:1})}>
      <View style={{minHeight:t.layout.chip,paddingHorizontal:t.spacing.compact,justifyContent:'center',borderRadius:t.radius.md,borderWidth:t.border.thin,borderColor:group.selected===option.value?t.colors.primary:t.colors.border,backgroundColor:group.selected===option.value?t.colors.primarySoft:t.colors.surface}}><Text style={[t.typography.small,{color:group.selected===option.value?t.colors.primary:t.colors.text}]}>{option.label}</Text></View>
    </Pressable>)}</View>)}
  </ScrollView>;
}
