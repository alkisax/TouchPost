// native\src\constants\constants.ts

export const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3020";

export const publicWebUrl =
  process.env.EXPO_PUBLIC_WEB_URL ?? "https://alkisax.github.io/TouchPost";

export const appName = "touchPost";

export const bannerAdUnitId = "ca-app-pub-change later";
export const interstitialAdUnitId = "ca-app-pub-change later";

export const countries = [
  {
    code: "GE",
    name: "Georgia",
  },
  {
    code: "AM",
    name: "Armenia",
  },
  {
    code: "GR",
    name: "Greece",
  },
  {
    code: "RS",
    name: "Serbia",
  },
  {
    code: "TR",
    name: "Turkiye",
  },
];
