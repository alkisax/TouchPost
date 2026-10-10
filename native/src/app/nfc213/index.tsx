// native\src\app\nfc213\index.tsx
import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { publicWebUrl } from '@/constants/constants';
import CountryCodePicker from '@/components/CountryCodePicker';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';
import CountdownButton from '@/components/CountdownButton';
import { readNfc } from '@/utils/readNfc';
import { writeNfcUrl } from '@/utils/writeNfc';
import NfcCapacityInfo from '@/components/NfcCapacityInfo';
// import BackOfPostcardSvg from '@/components/BackOfPostcardSvg';

export default function CreateCard() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);
  const [countryCode, setCountryCode] = useState('GR');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generatedUrlBytes, setGeneratedUrlBytes] = useState(0);
  const [nfcResult, setNfcResult] = useState('');
  const [isCreatingUrl, setIsCreatingUrl] = useState(false);
  const [isNfcBusy, setIsNfcBusy] = useState(false);

  const getUrlBytes = (url: string) => {
    return new TextEncoder().encode(url).length;
  };

  const handleCopyUrl = async () => {
    if (!generatedUrl) {
      return;
    }

    await Clipboard.setStringAsync(generatedUrl);
  };

  // ενημερώνει ένα συγκεκριμένο URL μέσα στο array
  const handleUrlChange = (value: string, index: number) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
  };

  const handleCreateUrl = async () => {
    /*
     * NFC213 constraints:
     * - Όλες οι εικόνες πρέπει να είναι Cloudinary URLs.
     * - Όλες οι εικόνες μιας κάρτας ανήκουν στο ίδιο card id.
     * - Το card id πρέπει να είναι 1 ή 2 digits, π.χ. "1" ή "21".
     * - Τα public IDs των εικόνων πρέπει να έχουν μορφή:
     *   cardId.1, cardId.2, cardId.3, cardId.4, cardId.5 ή cardId.b
     * - Παράδειγμα για card id "2":
     *   2.1.jpg, 2.2.jpg, 2.3.jpg, 2.4.jpg, 2.5.jpg, 2.b.jpg
     * - Δεν χρησιμοποιούμε p=test123.
     * - Δεν χρησιμοποιούμε t=1.
     * - Δεν αποθηκεύουμε Cloudinary version.
     * - Δεν αποθηκεύουμε imageCount.
     * - Το web viewer θα ελέγχει μόνος του ποια από τα
     *   1, 2, 3, 4, 5, b υπάρχουν για το συγκεκριμένο card id.
     * - Στο NFC κρατάμε μόνο:
     *   country | cloudName | cardId
     * - Το web viewer για το compact NFC213 format θα υλοποιηθεί αργότερα.
     */

    if (isCreatingUrl) {
      return;
    }

    setIsCreatingUrl(true);

    try {
      // Κρατάμε μόνο τα URLs που έχει συμπληρώσει πραγματικά ο user.
      const validUrls = imageUrls
        .map((url) => url.trim())
        .filter((url) => url !== '');

      // Προσωρινά επιτρέπουμε δημιουργία URL χωρίς εικόνα
      // ώστε να μπορούμε να μετράμε το base NFC213 URL.
      if (validUrls.length === 0) {
        const url = `${publicWebUrl}/n#${countryCode}`;
        const finalUrlBytes = getUrlBytes(url);

        console.log('Base NFC213 URL:', url);
        console.log('Base NFC213 URL bytes:', finalUrlBytes);

        setGeneratedUrl(url);
        setGeneratedUrlBytes(finalUrlBytes);

        return;
      }

      // Αρκεί να αναλύσουμε το πρώτο URL.
      // Τα υπόλοιπα πρέπει να ακολουθούν το ίδιο cloudName και cardId convention.
      const firstUrl = validUrls[0];

      const cloudinaryPrefix = 'https://res.cloudinary.com/';
      const uploadPart = '/image/upload/';

      // Βασικός έλεγχος ότι το URL είναι Cloudinary delivery URL.
      if (!firstUrl.startsWith(cloudinaryPrefix)) {
        throw new Error('NFC213 requires Cloudinary image URLs.');
      }

      // Αφαιρούμε το σταθερό Cloudinary prefix.
      // Παράδειγμα:
      // https://res.cloudinary.com/be726cds/image/upload/v123/2.2.jpg
      // ->
      // be726cds/image/upload/v123/2.2.jpg
      const withoutPrefix = firstUrl.slice(cloudinaryPrefix.length);

      // Χωρίζουμε το cloud name από το image path.
      const uploadParts = withoutPrefix.split(uploadPart);

      if (uploadParts.length !== 2) {
        throw new Error('Invalid Cloudinary image URL.');
      }

      const cloudName = uploadParts[0];
      const imagePath = uploadParts[1];

      // Το τελευταίο path segment είναι το filename.
      // Παράδειγμα:
      // v1791370199/2.2.jpg
      // ->
      // 2.2.jpg
      const pathParts = imagePath.split('/');
      const fileName = pathParts[pathParts.length - 1];

      // Περιμένουμε filename τύπου:
      // 2.1.jpg
      // 2.5.jpg
      // 2.b.jpg
      //
      // Το πρώτο group είναι το cardId.
      // Το δεύτερο group είναι image number 1-5 ή "b".
      const fileNameMatch = fileName.match(/^(\d{1,2})\.([1-5]|b)\.jpg$/i);

      if (!fileNameMatch) {
        throw new Error(
          'NFC213 image names must follow cardId.1.jpg to cardId.5.jpg or cardId.b.jpg.',
        );
      }

      const cardId = fileNameMatch[1];

      // Compact NFC213 payload:
      //
      // country | cloudName | cardId
      //
      // Παράδειγμα:
      // GR|be726cds|2
      //
      // Δεν κρατάμε:
      // - Cloudinary version
      // - imageCount
      // - filenames
      // - full image URLs
      const payload =
        `${countryCode}` +
        `|${cloudName}` +
        `|${cardId}`;

      // Χρησιμοποιούμε διαφορετικό route (/n) ώστε αργότερα
      // το web να ξέρει ότι πρόκειται για NFC213 compact payload.
      const url = `${publicWebUrl}/n#${payload}`;

      const finalUrlBytes = getUrlBytes(url);

      console.log('Generated NFC213 URL:', url);
      console.log('Generated NFC213 URL bytes:', finalUrlBytes);

      setGeneratedUrl(url);
      setGeneratedUrlBytes(finalUrlBytes);
    } finally {
      setIsCreatingUrl(false);
    }
  };

  const handleReadNfc = async () => {
    if (isNfcBusy) {
      return;
    }

    setIsNfcBusy(true);
    try {
      const tag = await readNfc();
      setNfcResult(JSON.stringify(tag, null, 2));
    } catch (error) {
      setNfcResult(String(error));
    } finally {
      setIsNfcBusy(false);
    }
  };

  const handleWriteNfc = async () => {
    if (isNfcBusy || !generatedUrl) {
      return;
    }

    setIsNfcBusy(true);
    try {
      await writeNfcUrl(generatedUrl);
      setNfcResult('NFC written successfully');
    } catch (error) {
      setNfcResult(String(error));
    } finally {
      setIsNfcBusy(false);
    }
  };

  const buttonStyle = ({ pressed }: { pressed: boolean }) => [
    globalStyles.primaryButton,
    pressed && globalStyles.pressedButton,
  ];

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Text style={globalStyles.title}>Create Small Card!</Text>

        <View style={[globalStyles.card, globalStyles.section]}>
          <Text style={globalStyles.sectionTitle}>Card details</Text>
          <CountryCodePicker
            countryCode={countryCode}
            onChange={setCountryCode}
          />
          {imageUrls.map((url, index) => (
            <TextInput
              key={index}
              value={url}
              onChangeText={(value) => handleUrlChange(value, index)}
              placeholder={`Image URL ${index + 1}`}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={globalStyles.input}
            />
          ))}
        </View>

        <CountdownButton
          label="Create URL"
          seconds={10}
          onPress={handleCreateUrl}
          buttonStyle={globalStyles.primaryButton}
          textStyle={globalStyles.primaryButtonText}
          pressedStyle={globalStyles.pressedButton}
          disabledStyle={globalStyles.disabledButton}
        />

        {generatedUrl !== '' && (
          <>
            <View style={globalStyles.resultContainer}>
              <Text style={globalStyles.sectionTitle}>Generated URL ({generatedUrlBytes} bytes)</Text>
              <Text style={globalStyles.resultText}>{generatedUrl}</Text>
            </View>

            {generatedUrl !== '' && (
              <NfcCapacityInfo
                usedBytes={generatedUrlBytes}
                maxBytes={137}
              />
            )}

            <Pressable
              style={buttonStyle}
              onPress={() => void handleCopyUrl()}
            >
              <Text style={globalStyles.primaryButtonText}>Copy URL</Text>
            </Pressable>
          </>
        )}

        <View style={[globalStyles.card, globalStyles.buttonGroup]}>
          <Text style={globalStyles.sectionTitle}>NFC</Text>
          <Pressable
            style={({ pressed }) => [
              ...buttonStyle({ pressed }),
              isNfcBusy && globalStyles.disabledButton,
            ]}
            onPress={() => void handleReadNfc()}
            disabled={isNfcBusy}
          >
            {isNfcBusy && <ActivityIndicator size="small" color={colors.primary} />}
            <Text style={globalStyles.primaryButtonText}>Read NFC</Text>
          </Pressable>

          {generatedUrl !== '' && (
            <Pressable
              style={({ pressed }) => [
                ...buttonStyle({ pressed }),
                isNfcBusy && globalStyles.disabledButton,
              ]}
              onPress={() => void handleWriteNfc()}
              disabled={isNfcBusy}
            >
              {isNfcBusy && <ActivityIndicator size="small" color={colors.primary} />}
              <Text style={globalStyles.primaryButtonText}>Write NFC</Text>
            </Pressable>
          )}
        </View>

        {nfcResult !== '' && (
          <View style={globalStyles.resultContainer}>
            <Text style={globalStyles.sectionTitle}>NFC result</Text>
            <Text style={globalStyles.resultText}>{nfcResult}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
