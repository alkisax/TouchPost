// native\src\constants\constants.ts

export const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3020";

export const publicWebUrl =
  process.env.EXPO_PUBLIC_WEB_URL ?? "https://alkisax.github.io/TouchPost";

export const appName = "TouchPost";

// official ad ids
// export const bannerAdUnitId = 'ca-app-pub-4041382605494077/9737097595';
// export const rewardedAdUnitId = 'ca-app-pub-4041382605494077/2956156117';

// test ad ids
export const bannerAdUnitId =
  'ca-app-pub-3940256099942544/6300978111';
export const rewardedAdUnitId =
  'ca-app-pub-3940256099942544/5224354917';

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
  {
    code: "IT",
    name: "Italy",
  },
];
