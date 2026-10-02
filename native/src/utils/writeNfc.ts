// native/src/utils/writeNfc.ts

import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

export const writeNfcUrl = async (url: string) => {
  try {
    await NfcManager.start();

    await NfcManager.requestTechnology(NfcTech.Ndef);

    const bytes = Ndef.encodeMessage([
      Ndef.uriRecord(url),
    ]);

    if (!bytes) {
      throw new Error('Unable to encode NFC URL.');
    }

    await NfcManager.ndefHandler.writeNdefMessage(bytes);

    console.log('NFC URL written successfully:', url);
  } catch (error) {
    console.log('NFC write error:', error);

    throw error;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
};