// native/src/utils/readNfc.ts

import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export const readNfc = async () => {
  try {
    await NfcManager.start();

    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();

    console.log('NFC tag:', tag);

    return tag;
  } catch (error) {
    console.log('NFC read error:', error);

    throw error;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
};