import { StyleSheet } from "react-native";

import type { AppColors } from "./global";

export const createAccountStyles = (colors: AppColors) =>
  StyleSheet.create({
    actions: {
      flexGrow: 1,
      justifyContent: "center",
      gap: 12,
      padding: 20,
    },
    actionButton: {
      width: "100%",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
    },
    modalCard: {
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
    },
  });
