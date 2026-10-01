import { View, Text, TextInput, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "expo-router";
import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "../constants/constants";
import BgScreenWrapper from "../components/layout/BgScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { normalizeAuthUser } from "../authLogin/authUser";
import {
  getEffectiveRole,
  type BackendLoginResponse,
} from "../authLogin/types/types";

const Login = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const { user, setUser } = useContext(UserAuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const role = getEffectiveRole(user);
      const destinationByRole = {
        SUPERADMIN: "/(protected)/superadmin",
        ADMIN: "/(protected)/admin",
        STAFF: "/(protected)/staff",
        USER: "/(protected)/user",
      } as const;

      router.replace(destinationByRole[role]);
    }
  }, [router, user]);

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await api.post<BackendLoginResponse>(
        `${backendUrl}/auth/login`,
        { username, password },
      );

      if (response.data.status) {
        const { token, user: backendUser } = response.data.data;

        if (!backendUser) {
          setError("Login failed");
          return;
        }

        await AsyncStorage.setItem("token", token);
        const normalizedUser = normalizeAuthUser(backendUser);
        setUser(normalizedUser);

        // Όλοι οι ρόλοι κάνουν login από το ίδιο endpoint. Ο ρόλος προκύπτει
        // από το normalized response και όχι από backend-specific JWT claims.
        const role = getEffectiveRole(normalizedUser);
        const destinationByRole = {
          SUPERADMIN: "/(protected)/superadmin",
          ADMIN: "/(protected)/admin",
          STAFF: "/(protected)/staff",
          USER: "/(protected)/user",
        } as const;

        router.replace(destinationByRole[role]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 400) {
          setError("Wrong username or password");
          return;
        }
      }

      setError("Login failed");
    }
  };

  return (
    <BgScreenWrapper>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[globalStyles.container, globalStyles.centered]}>
          <View style={[globalStyles.card, { width: "100%", maxWidth: 420 }]}>
            <Text
              style={[
                globalStyles.title,
                { marginBottom: 20, textAlign: "center" },
              ]}
            >
              Login
            </Text>

            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            <View style={{ position: "relative" }}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[globalStyles.input, { marginBottom: 12 }]}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "20%" }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.secondary}
                />
              </Pressable>
            </View>

            {error && (
              <Text style={[globalStyles.error, { marginBottom: 10 }]}>
                {error}
              </Text>
            )}

            <Pressable style={globalStyles.primaryButton} onPress={handleLogin}>
              <Text style={globalStyles.primaryButtonText}>Login</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={[globalStyles.link, { marginTop: 12 }]}>
                Don't have an account? Register
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push("/register-admin")}>
              <Text style={[globalStyles.link, { marginTop: 12 }]}>
                Register as ADMIN
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BgScreenWrapper>
  );
};

export default Login;
