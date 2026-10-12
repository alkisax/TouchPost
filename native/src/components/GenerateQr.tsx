// native/src/components/GenerateQr.tsx

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

type GenerateQrProps = {
  url: string;
};

export default function GenerateQr({ url }: GenerateQrProps) {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const [showQr, setShowQr] = useState(false);

  return (
    <View style={[globalStyles.card, styles.container]}>
      <Text style={globalStyles.sectionTitle}>QR Code</Text>

      <Pressable
        style={globalStyles.primaryButton}
        onPress={() => setShowQr(true)}
      >
        <Text style={globalStyles.primaryButtonText}>
          Create QR
        </Text>
      </Pressable>

      {showQr && (
        <View style={styles.qrContainer}>
          <QRCode
            value={url}
            size={220}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
});