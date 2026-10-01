// frontend\src\authLogin\authFunctions.ts
import type { AuthUser } from "./types/types"

type SetUser = (user: AuthUser | null) => void;


export const handleLogout = async (
  setUser: SetUser,
  navigate: (path: string) => void
) => {

  try {
    // Updating context first invalidates any in-flight session restoration.
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authUser");

    navigate("/");
  } catch (error) {
    console.error("Error during universal logout:", error);
  }
};

