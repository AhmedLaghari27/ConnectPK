import {HomeFeedPreview} from '../components/home-feed-preview';
import {NavigationHeader, NavigationTabs, HeaderIcon} from '../components/navigation-shell';
import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeModeContext, useTheme } from '../constants/theme';
import { Screen, Stack, Row, Spacer, Text } from '../components/layout';
import { Avatar, Badge, Button, Card, Chip, Divider, EmptyState, ErrorState, Input, Skeleton, Toast } from '../components/ui';

function Samples({ mode }: { mode: 'light' | 'dark' }) {
  const t = useTheme();
  const [tab, setTab] = useState<'feed'|'search'|'create'|'notifications'|'profile'|'messages'>('feed');
  const [selected, setSelected] = useState(false);
  const [value, setValue] = useState('');
  const [toast, setToast] = useState(true);
  return <View style={{ backgroundColor: t.colors.background, marginHorizontal: -t.spacing.md, padding: t.spacing.md, borderRadius: t.radius.md }}>
    <Stack gap="lg">
      <HomeFeedPreview/>
      <View style={{marginHorizontal:-t.spacing.md}}>
        <NavigationHeader title="ConnectPK" actions={<HeaderIcon name="chatbubble-ellipses-outline" label="Preview messages" onPress={()=>setToast(true)}/>}/>
        <NavigationHeader title="A very long professional conversation title" onBack={()=>setToast(true)}/>
        <NavigationTabs active={tab} unread={120} onSelect={item=>setTab(item.key)}/>
      </View>
      <Text variant="heading">{mode === 'light' ? 'Light' : 'Dark'} palette</Text>
      <Card>
        <Text variant="title">Typography</Text><Text variant="subtitle">Professional connections</Text>
        <Text>Body text stays readable as your phone’s text size changes.</Text>
        <Text variant="small" secondary>Secondary supporting text</Text><Text variant="caption" secondary>Caption and metadata</Text>
      </Card>
      <Stack gap="sm">
        <Button label="Primary action" onPress={() => setToast(true)} />
        <Button label="Secondary action" variant="secondary" onPress={() => setToast(true)} />
        <Button label="Ghost action" variant="ghost" onPress={() => setToast(true)} />
        <Row wrap><Button label="Disabled" disabled /><Button label="Loading" loading /></Row>
      </Stack>
      <Input label="Name" value={value} onChangeText={setValue} hint="Tap to inspect the focus border." placeholder="Your name" />
      <Input label="Example error" value="" error="Enter a name to continue." />
      <Input label="Disabled input" value="Read only" editable={false} />
      <Input label="Long message" multiline style={{ minHeight: t.layout.multiline }} placeholder="Check keyboard handling here." />
      <Row wrap>{Object.values(t.avatar).map(size => <Avatar key={size} name="Ayesha Khan" size={size} verified />)}</Row>
      <Row wrap><Chip label="Selectable chip" selected={selected} onPress={() => setSelected(!selected)} /><Chip label="Disabled" disabled /></Row>
      <Row wrap>{(['neutral', 'success', 'warning', 'error'] as const).map(tone => <Badge key={tone} tone={tone} label={tone} />)}</Row>
      <Divider /><Card elevated><Text variant="subtitle">Elevated card</Text><Text>16px padding, subtle shadow and rounded corners.</Text></Card>
      <EmptyState title="Nothing here yet" description="Your professional conversations will appear here." icon={<Ionicons name="chatbubble-outline" size={t.layout.icon} color={t.colors.textSecondary} />} action={{ label: 'Example action', onPress: () => setToast(true) }} />
      <ErrorState description="This is a preview error, not a network request." onRetry={() => setToast(true)} />
      <Skeleton /><Spacer size="sm" />
      <Toast visible={toast} message="Preview action completed." tone="success" onDismiss={() => setToast(false)} />
    </Stack>
  </View>;
}

export default function UIPreview() {
  return <Screen scroll><Stack gap="lg"><Text variant="heading">UI foundation preview</Text><Text secondary>Temporary component gallery. Both palettes are shown below; all actions are local demonstrations.</Text>
    <ThemeModeContext.Provider value="light"><Samples mode="light" /></ThemeModeContext.Provider>
    <ThemeModeContext.Provider value="dark"><Samples mode="dark" /></ThemeModeContext.Provider>
  </Stack></Screen>;
}
