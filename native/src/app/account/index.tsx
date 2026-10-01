import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import axios from "axios";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { ThemeContext } from "@/context/ThemeContext";
import { backendUrl } from "@/constants/constants";
import { createGlobalStyles, SPACING } from "@/styles/global";
import { createAccountStyles } from "@/styles/account.styles";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }
  }

  return "The account could not be deleted. Please try again.";
};

const AccountScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, setUser } = useContext(UserAuthContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createAccountStyles(colors);
  const router = useRouter();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const closePasswordModal = () => {
    if (isDeleting) return;

    setPasswordModalVisible(false);
    setPassword("");
    setErrorMessage("");
  };

  const openDeleteConfirmation = () => {
    Alert.alert(
      "Permanently delete account?",
      "This permanently deletes your account. If you are an ADMIN, your organization and its STAFF accounts will also be deleted. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            setErrorMessage("");
            setPasswordModalVisible(true);
          },
        },
      ],
    );
  };

  const deleteAccount = async () => {
    if (!password || isDeleting) return;

    setErrorMessage("");
    setIsDeleting(true);

    try {
      const token = await AsyncStorage.getItem("token");

      await api.delete(`${backendUrl}/users/self`, {
        data: { password },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPasswordModalVisible(false);
      setPassword("");
      setUser(null);
      router.replace("/login");
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView edges={["bottom"]} style={globalStyles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.actions}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/account/terms")}
          style={[globalStyles.primaryButton, styles.actionButton]}
        >
          <Text style={globalStyles.primaryButtonText}>Terms of Use</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={openDeleteConfirmation}
          style={[globalStyles.secondaryButton, styles.actionButton]}
        >
          <Text
            style={[globalStyles.secondaryButtonText, { color: colors.red }]}
          >
            Delete My Account
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={globalStyles.title}>Confirm account deletion</Text>
            <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
              Enter your current password to confirm this destructive action.
            </Text>
            {errorMessage ? (
              <Text style={[globalStyles.error, { marginTop: SPACING.md }]}>
                {errorMessage}
              </Text>
            ) : null}
            <TextInput
              autoFocus
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Current password"
              placeholderTextColor={colors.dimText}
              editable={!isDeleting}
              style={[globalStyles.input, { marginTop: SPACING.md }]}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={closePasswordModal}
                disabled={isDeleting}
                style={[globalStyles.secondaryButton, styles.modalButton]}
              >
                <Text style={globalStyles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void deleteAccount()}
                disabled={!password || isDeleting}
                style={[globalStyles.primaryButton, styles.modalButton]}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.primaryActive} />
                ) : (
                  <Text style={globalStyles.primaryButtonText}>
                    Permanently delete my account
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountScreen;
