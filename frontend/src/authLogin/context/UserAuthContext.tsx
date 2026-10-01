import { createContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import type {
  AuthUser,
  BackendLoginResponse,
  UserAuthContextType,
  UserProviderProps,
} from "../types/types";
import { normalizeAuthUser } from "../authUser";
import { backendUrl } from "../../constants/constants";

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
  refreshUser: async () => {},
});

interface StoredJwt {
  exp?: number;
}

const readStoredUser = (): AuthUser | null => {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const storeSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionGeneration = useRef(0);

  const setUser = (nextUser: AuthUser | null) => {
    sessionGeneration.current += 1;
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      clearSession();
    }
  };

  const fetchUser = async () => {
    const restoreGeneration = sessionGeneration.current;
    const isCurrentRestore = () =>
      sessionGeneration.current === restoreGeneration;
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      if (isCurrentRestore()) {
        setUserState(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      const decodedToken = jwtDecode<StoredJwt>(token);

      if (
        typeof decodedToken.exp !== "number" ||
        decodedToken.exp * 1000 < Date.now()
      ) {
        if (isCurrentRestore()) {
          clearSession();
          setUserState(null);
        }
        return;
      }

      // Ο .NET refresh επιστρέφει μόνο token, ενώ ο Node επιστρέφει και user.
      // Χρησιμοποιούμε το αποθηκευμένο normalized user ώστε το restore να
      // δουλεύει και στα δύο backends χωρίς να εφευρίσκουμε ρόλους από JWT.
      const storedUser = readStoredUser();
      const response = await axios.post<BackendLoginResponse>(
        `${backendUrl}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const refreshedUser = response.data.data.user
        ? normalizeAuthUser(response.data.data.user)
        : storedUser;

      if (!isCurrentRestore() || !refreshedUser) {
        if (!isCurrentRestore()) {
          return;
        }

        setUserState(null);
        return;
      }

      storeSession(response.data.data.token, refreshedUser);
      setUserState(refreshedUser);
    } catch {
      if (isCurrentRestore()) {
        clearSession();
        setUserState(null);
      }
    } finally {
      if (isCurrentRestore()) {
        setIsLoading(false);
      }
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
