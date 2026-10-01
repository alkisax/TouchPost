import { useContext } from "react";
import { Text, View } from "react-native";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";

export default function AdminOverview() {
  const { user } = useContext(UserAuthContext);
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>Overview</Text>
      <Text style={globalStyles.text}>Username: {user?.username}</Text>
      <Text style={globalStyles.text}>
        Organization: {user?.organization?.organizationName ?? "-"}
      </Text>
      <Text style={globalStyles.dimText}>
        Manage your organization and staff from this area.
      </Text>
    </View>
  );
}
