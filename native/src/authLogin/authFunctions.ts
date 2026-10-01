// native\src\authLogin\authFunctions.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "./types/types";

type SetUser = (user: AuthUser | null) => void;

export const handleLogout = async (setUser: SetUser) => {
  try {
    // Updating context first invalidates any in-flight session restoration.
    setUser(null);

    // remove token
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("authUser");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
