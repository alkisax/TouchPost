// native\src\app\index.tsx

import { useContext } from 'react';
import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdsBanner from '@/ads/AdsBanner';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';
import { useRewardedAd } from '@/ads/useRewardedAd';

export default function Index() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const { error, isLoaded, isShowing, showAd } = useRewardedAd();

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={globalStyles.centerContent}>
          <View style={styles.mainActions}>
          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => router.push('/create-card')}
          >
            <Text style={globalStyles.primaryButtonText}>Create Card</Text>
          </Pressable>

          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => router.push('/nfc213')}
          >
            <Text style={globalStyles.primaryButtonText}>Small NFC</Text>
          </Pressable>

          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => router.push('/create-postcard-back')}
          >
            <Text style={globalStyles.primaryButtonText}>
              Create Postcard Back
            </Text>
          </Pressable>
          </View>

          <Pressable
            disabled={!isLoaded || isShowing}
            onPress={showAd}
            style={[
              globalStyles.secondaryButton,
              styles.supportButton,
              (!isLoaded || isShowing) && globalStyles.disabledButton,
            ]}
          >
            <Text style={globalStyles.secondaryButtonText}>
              Watch an ad to support dev
            </Text>
          </Pressable>

          {!isLoaded && !error && !isShowing && (
            <Text style={globalStyles.dimText}>Loading ad...</Text>
          )}
          {isShowing && (
            <Text style={globalStyles.dimText}>Showing ad...</Text>
          )}
          {error && (
            <Text style={globalStyles.error}>
              The support ad is unavailable right now.
            </Text>
          )}

          <View style={styles.bannerContainer}>
            <AdsBanner />
          </View>

          <Pressable
            onPress={() => router.push('/terms' as Href)}
            style={styles.termsLink}
          >
            <Text style={[globalStyles.dimText, { color: colors.primary }]}>Terms</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  mainActions: {
    gap: SPACING.sm,
    width: 240,
  },
  supportButton: {
    marginTop: SPACING.lg,
  },
  bannerContainer: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  termsLink: {
    marginTop: SPACING.md,
    padding: SPACING.xs,
  },
});
