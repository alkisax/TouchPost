import { useContext } from 'react';
import { Pressable, Text } from 'react-native';

import { useAdConsent } from '@/ads/AdConsentContext';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

export default function PrivacyChoicesButton() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const { privacyOptionsRequired, showPrivacyOptions } = useAdConsent();

  if (!privacyOptionsRequired) {
    return null;
  }

  return (
    <Pressable
      style={globalStyles.secondaryButton}
      onPress={() => void showPrivacyOptions()}
    >
      <Text style={globalStyles.secondaryButtonText}>Privacy choices</Text>
    </Pressable>
  );
}
