import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.brand}>ConnectPK</Text>
        <Text style={styles.heading}>Meaningful professional connections.</Text>
        <Text style={styles.description}>
          Trusted 1-to-1 professional meetings in Karachi, Lahore, and Islamabad.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to ConnectPK</Text>
          <Text style={styles.description}>
            Your space for professional introductions is coming soon.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  brand: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.title,
    fontWeight: '700',
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.subtitle,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.body,
    lineHeight: 24,
  },
  card: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: '600',
  },
});
