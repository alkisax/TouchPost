// frontend/src/constants/constants.ts

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3020";

export const appName = "TouchPost";

export const colors = {
  bg: "#0f0f1a",
  panel: "rgba(20, 20, 30, 0.7)",
  primary: "#f5a623", // πορτοκαλοκίτρινο
  secondary: "#6c63ff", // μωβ/astro vibe
  text: "#ffffff",
  dim: "#aaaaaa",
};

export const PRIMARY_COLOR = colors.primary;
export const PRIMARY_WHITE = "#ffffff";