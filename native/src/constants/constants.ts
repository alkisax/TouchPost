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
export const bannerAdUnitId = "ca-app-pub-3940256099942544/6300978111";
export const rewardedAdUnitId = "ca-app-pub-3940256099942544/5224354917";

export const countries = [
  { code: "GE", name: "Georgia" },
  { code: "AM", name: "Armenia" },
  { code: "GR", name: "Greece" },
  { code: "RS", name: "Serbia" },
  { code: "TR", name: "Turkiye" },
  { code: "IT", name: "Italy" },
  { code: "TH", name: "Thailand" },
  { code: "KH", name: "Cambodia" },
  { code: "VN", name: "Vietnam" },
  { code: "EG", name: "Egypt" },
  { code: "BG", name: "Bulgaria" },
  { code: "MK", name: "North Macedonia" },
  { code: "AL", name: "Albania" },
  { code: "ME", name: "Montenegro" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "HU", name: "Hungary" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "CZ", name: "Czechia" },
  { code: "MT", name: "Malta" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "HR", name: "Croatia" },
  { code: "RO", name: "Romania" },
  { code: "CY", name: "Cyprus" },
  { code: "MA", name: "Morocco" },
  { code: "MY", name: "Malaysia" },
  { code: "JP", name: "Japan" },
  { code: "ID", name: "Indonesia" },
  { code: "AU", name: "Australia" },
  { code: "LK", name: "Sri Lanka" },
  { code: "CU", name: "Cuba" },
  { code: "PE", name: "Peru" },
  { code: "BR", name: "Brazil" },
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "CA", name: "Canada" },
  { code: "KR", name: "South Korea" },
  { code: "IS", name: "Iceland" },
  { code: "NO", name: "Norway" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "AR", name: "Argentina" },
  { code: "ZA", name: "South Africa" },
  { code: "SG", name: "Singapore" },
  { code: "YU", name: "Yugoslavia" },
  { code: "SU", name: "USSR" },
];
