import { useContext } from "react";
import { Text, View } from "react-native";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";

export default function UserPage() {
  const { user } = useContext(UserAuthContext);
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.centerContent}>
      <Text style={globalStyles.title}>USER</Text>
      <Text style={globalStyles.text}>{user?.username}</Text>
    </View>
  );
}
