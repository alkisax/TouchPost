import NfcManager, {
  Ndef,
  NfcTech,
} from 'react-native-nfc-manager';

export const writeNfcUrl = async (url: string) => {
  try {
    // Debug: επιβεβαιώνουμε ότι ξεκίνησε το write flow.
    console.log('Starting NFC write...');
    console.log('URL:', url);

    await NfcManager.start();

    // Ζητάμε πρόσβαση στην NDEF τεχνολογία του tag.
    console.log('Requesting NDEF technology...');

    await NfcManager.requestTechnology(NfcTech.Ndef);

    console.log('NDEF technology acquired');

    // Μετατρέπουμε το URL σε πραγματικό NDEF URI record.
    // Αυτό το μήκος είναι πιο σημαντικό από το απλό URL string length.
    const bytes = Ndef.encodeMessage([
      Ndef.uriRecord(url),
    ]);

    if (!bytes) {
      throw new Error('Unable to encode NFC URL.');
    }

    // Πραγματικός αριθμός bytes που επιχειρούμε να γράψουμε στο NFC.
    console.log('NDEF encoded bytes:', bytes.length);

    await NfcManager.ndefHandler.writeNdefMessage(bytes);

    console.log('NFC URL written successfully:', url);
  } catch (error) {
    // Κρατάμε το πραγματικό native error για debugging.
    console.log('NFC write error:', error);

    throw error;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
};