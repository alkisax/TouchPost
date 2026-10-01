import { useContext, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStaff from "@/components/admin/AdminStaff";

type AdminSection = "overview" | "staff";

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("overview");
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>ADMIN AREA</Text>

        <View style={{ flexDirection: "row", gap: 12, marginVertical: 20 }}>
          <Pressable
            style={globalStyles.secondaryButton}
            onPress={() => setSection("overview")}
          >
            <Text style={globalStyles.secondaryButtonText}>Overview</Text>
          </Pressable>
          <Pressable
            style={globalStyles.secondaryButton}
            onPress={() => setSection("staff")}
          >
            <Text style={globalStyles.secondaryButtonText}>Staff</Text>
          </Pressable>
        </View>

        {section === "overview" ? <AdminOverview /> : <AdminStaff />}
      </View>
    </View>
  );
}
