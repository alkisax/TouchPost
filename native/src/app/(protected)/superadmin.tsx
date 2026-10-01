import { useContext } from "react";
import { Text, View } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";

export default function SuperAdminPage() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.centerContent}>
      <Text style={globalStyles.title}>SUPERADMIN</Text>
    </View>
  );
}
