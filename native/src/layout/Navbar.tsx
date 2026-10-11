import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appName } from '@/constants/constants';
import { ThemeContext } from '@/context/ThemeContext';

export default function Navbar() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.topBar,
          borderBottomColor: colors.topBarBorder,
        },
      ]}
    >
      <View style={styles.navbar}>
        <Pressable onPress={() => router.push('/')}>
          <Text style={[styles.appName, { color: colors.text }]}>
            {appName}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Info"
          accessibilityRole="button"
          onPress={() => router.push('/info')}
          style={styles.infoButton}
        >
          <Ionicons
            name="information-circle-outline"
            size={26}
            color={colors.text}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderBottomWidth: 1,
    elevation: 999,
    zIndex: 999,
  },
  navbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
