// native/src/services/nfcService.ts

import { Platform } from 'react-native';

export const isNfcPlatformSupported = () => {
  const isSupported = Platform.OS === 'android';

  console.log(
    `NFC platform supported: ${isSupported ? 'Yes' : 'No'} (${Platform.OS})`,
  );

  return isSupported;
};