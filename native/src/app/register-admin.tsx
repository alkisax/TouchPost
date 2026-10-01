import { useContext, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import axios from "axios";
import { backendUrl } from "../constants/constants";
import BgScreenWrapper from "../components/layout/BgScreenWrapper";
import {
  frontEndValidateEmail,
  frontendValidatePassword,
} from "../authLogin/utils/registerBackend";
import { api } from "../authLogin/services/api";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";

export default function RegisterAdmin() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleRegister = async () => {
    setError(null);
    const passwordError = frontendValidatePassword(password);
    const emailError = email ? frontEndValidateEmail(email) : null;

    if (passwordError || emailError) {
      setError(passwordError || emailError || "Invalid form");
      return;
    }

    if (!username || !password || !confirmPassword || !organizationName) {
      setError(
        "Username, password, confirmation, and organization are required",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`${backendUrl}/auth/register-admin`, {
        username,
        password,
        organizationName,
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
      });

      if (response.data.status) {
        Alert.alert("Success", "Admin account created successfully");
        router.replace("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        const responseData: unknown = requestError.response?.data;
        const message =
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof responseData.message === "string"
            ? responseData.message
            : undefined;
        setError(message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BgScreenWrapper>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={globalStyles.container}>
          <View style={globalStyles.centered}>
            <View style={[globalStyles.card, { width: "100%", maxWidth: 420 }]}>
              <Text
                style={[globalStyles.title, { marginBottom: 20 }]}
              >
                Register ADMIN
              </Text>
              <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={globalStyles.input}
              />
              <TextInput
                placeholder="Full Name (optional)"
                value={name}
                onChangeText={setName}
                style={globalStyles.input}
              />
              <TextInput
                placeholder="Email (optional)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={globalStyles.input}
              />
              <TextInput
                placeholder="Organization Name"
                value={organizationName}
                onChangeText={setOrganizationName}
                style={globalStyles.input}
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={globalStyles.input}
              />
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={globalStyles.input}
              />

              {error && <Text style={globalStyles.error}>{error}</Text>}
              <Pressable
                style={globalStyles.primaryButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={globalStyles.primaryButtonText}>
                  {loading ? "Loading..." : "Register ADMIN"}
                </Text>
              </Pressable>
              <Pressable onPress={() => router.replace("/register")}>
                <Text style={[globalStyles.link, { marginTop: 12 }]}> 
                  Register as USER
                </Text>
              </Pressable>
              <Pressable onPress={() => router.replace("/login")}>
                <Text style={[globalStyles.link, { marginTop: 12 }]}> 
                  Already have an account? Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BgScreenWrapper>
  );
}
