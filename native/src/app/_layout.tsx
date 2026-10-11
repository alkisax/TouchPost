// native/src/app/_layout.tsx

import { ThemeProvider } from "@/context/ThemeContext";
import { AdConsentProvider } from "@/ads/AdConsentContext";
import Navbar from "@/layout/Navbar";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Caveat_400Regular,
  Caveat_600SemiBold,
  useFonts,
} from '@expo-google-fonts/caveat';

import {
  NotoSans_400Regular,
} from '@expo-google-fonts/noto-sans';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_400Regular,
    Caveat_600SemiBold,
    NotoSans_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AdConsentProvider>
          <Navbar />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AdConsentProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
