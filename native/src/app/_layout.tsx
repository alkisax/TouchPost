// native/src/app/_layout.tsx

import { RoomProvider } from "@/context/RoomContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/authLogin/context/UserAuthContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalNavbar from "@/layout/GlobalNavbar";
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
        <UserProvider>
          <RoomProvider>
            <GlobalNavbar />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </RoomProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
