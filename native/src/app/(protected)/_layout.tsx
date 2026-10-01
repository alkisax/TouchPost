import { useContext } from "react";
import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { getEffectiveRole } from "@/authLogin/types/types";

const routeRoles = {
  user: "USER",
  admin: "ADMIN",
  staff: "STAFF",
  superadmin: "SUPERADMIN",
} as const;

export default function ProtectedLayout() {
  const { user, isLoading } = useContext(UserAuthContext);
  const segments = useSegments();
  const routeName = segments[segments.length - 1];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const requiredRole = routeRoles[routeName as keyof typeof routeRoles];

  // ADMIN/STAFF προκύπτουν από το organization και SUPERADMIN από
  // globalRoles. Δεν χρησιμοποιούμε JWT role claims για authorization.
  if (requiredRole && getEffectiveRole(user) !== requiredRole) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
