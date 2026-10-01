import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import {
  frontEndValidateEmail,
  frontendValidatePassword,
} from "@/authLogin/utils/registerBackend";

export interface StaffUser {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: "STAFF";
  createdAt?: string;
  updatedAt?: string;
}

interface StaffForm {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: StaffForm = {
  username: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseData: unknown = error.response?.data;

  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData &&
    typeof responseData.message === "string"
  ) {
    return responseData.message;
  }

  return fallback;
};

const AdminStaff = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get<{ status: boolean; data: StaffUser[] }>(
        `${backendUrl}/users/organization/staff`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStaff(response.data.data);
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "Failed to load staff"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingStaffId(null);
  };

  const updateForm = (field: keyof StaffForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      return "Username is required";
    }

    if (form.email && frontEndValidateEmail(form.email)) {
      return frontEndValidateEmail(form.email);
    }

    const changingPassword = Boolean(form.password || form.confirmPassword);

    if (!editingStaffId && !form.password) {
      return "Password is required when creating staff";
    }

    if (changingPassword) {
      const passwordError = frontendValidatePassword(form.password);

      if (passwordError) {
        return passwordError;
      }

      if (form.password !== form.confirmPassword) {
        return "Passwords do not match";
      }
    }

    return null;
  };

  const saveStaff = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        username: form.username.trim(),
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.password ? { password: form.password } : {}),
      };

      if (editingStaffId) {
        await api.put(`${backendUrl}/users/${editingStaffId}`, body, {
          headers,
        });
      } else {
        await api.post(`${backendUrl}/users/staff`, body, { headers });
      }

      resetForm();
      await loadStaff();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "Failed to save staff"));
    } finally {
      setSaving(false);
    }
  };

  const editStaff = (member: StaffUser) => {
    setEditingStaffId(member.id);
    setForm({
      username: member.username,
      name: member.name ?? "",
      email: member.email ?? "",
      password: "",
      confirmPassword: "",
    });
    setError(null);
  };

  const deleteStaff = (member: StaffUser) => {
    Alert.alert(
      "Delete staff",
      `Delete ${member.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                const token = await AsyncStorage.getItem("token");
                await api.delete(`${backendUrl}/users/${member.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                await loadStaff();
              } catch (requestError: unknown) {
                setError(getErrorMessage(requestError, "Failed to delete staff"));
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 12 }}>
      <Text style={globalStyles.title}>Staff</Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={globalStyles.error}>{error}</Text> : null}
      {!loading && staff.length === 0 ? (
        <Text style={globalStyles.dimText}>No staff members yet.</Text>
      ) : null}

      {staff.map((member) => (
        <View key={member.id} style={globalStyles.card}>
          <Text style={globalStyles.text}>{member.username}</Text>
          {member.name ? <Text style={globalStyles.dimText}>{member.name}</Text> : null}
          {member.email ? <Text style={globalStyles.dimText}>{member.email}</Text> : null}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
            <Pressable
              style={globalStyles.secondaryButton}
              onPress={() => editStaff(member)}
            >
              <Text style={globalStyles.secondaryButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={globalStyles.secondaryButton}
              onPress={() => deleteStaff(member)}
            >
              <Text style={globalStyles.secondaryButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={globalStyles.card}>
        <Text style={globalStyles.title}>
          {editingStaffId ? "Edit staff" : "Create staff"}
        </Text>
        <TextInput
          placeholder="Username"
          value={form.username}
          onChangeText={(value) => updateForm("username", value)}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Name (optional)"
          value={form.name}
          onChangeText={(value) => updateForm("name", value)}
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Email (optional)"
          value={form.email}
          onChangeText={(value) => updateForm("email", value)}
          autoCapitalize="none"
          style={globalStyles.input}
        />
        <TextInput
          placeholder={editingStaffId ? "New password (optional)" : "Password"}
          value={form.password}
          onChangeText={(value) => updateForm("password", value)}
          secureTextEntry
          style={globalStyles.input}
        />
        <TextInput
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChangeText={(value) => updateForm("confirmPassword", value)}
          secureTextEntry
          style={globalStyles.input}
        />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => void saveStaff()}
            disabled={saving}
          >
            <Text style={globalStyles.primaryButtonText}>
              {saving ? "Saving..." : editingStaffId ? "Save" : "Create"}
            </Text>
          </Pressable>
          {editingStaffId ? (
            <Pressable
              style={globalStyles.secondaryButton}
              onPress={resetForm}
            >
              <Text style={globalStyles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

export default AdminStaff;
