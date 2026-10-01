import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "../../constants/constants";
import { normalizeAuthUser } from "../authUser";
import type {
  AuthUser,
  BackendLoginResponse,
  UserAuthContextType,
  UserProviderProps,
} from "../types/types";

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => undefined,
  isLoading: true,
  setIsLoading: () => undefined,
  refreshUser: async () => undefined,
});

interface StoredJwt {
  exp?: number;
}

const readStoredUser = async (): Promise<AuthUser | null> => {
  const value = await AsyncStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
};

const clearSession = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionGeneration = useRef(0);

  const setUser = (nextUser: AuthUser | null) => {
    sessionGeneration.current += 1;
    setUserState(nextUser);

    if (nextUser) {
      void AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      void clearSession();
    }
  };

  const restoreUser = useCallback(async () => {
    const restoreGeneration = sessionGeneration.current;
    const isCurrentRestore = () =>
      sessionGeneration.current === restoreGeneration;
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      if (isCurrentRestore()) {
        setUserState(null);
      }
      return;
    }

    try {
      const decodedToken = jwtDecode<StoredJwt>(token);

      if (
        typeof decodedToken.exp !== "number" ||
        decodedToken.exp * 1000 <= Date.now()
      ) {
        throw new Error("Invalid or expired token");
      }

      const persistedUser = await readStoredUser();
      const response = await api.post<BackendLoginResponse>(
        `${backendUrl}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const refreshedUser = response.data.data.user
        ? normalizeAuthUser(response.data.data.user)
        : persistedUser;

      if (!isCurrentRestore() || !refreshedUser) {
        if (!isCurrentRestore()) {
          return;
        }

        throw new Error("No normalized user in session");
      }

      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
      setUserState(refreshedUser);
    } catch {
      if (isCurrentRestore()) {
        await clearSession();
        setUserState(null);
      }
    }
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await restoreUser();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void restoreUser().finally(() => setIsLoading(false));
  }, [restoreUser]);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
