// native\src\app\create-card\index.tsx
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
     * - Όλες οι εικόνες πρέπει να βρίσκονται στον ίδιο Cloudinary folder.
     * - Ο folder πρέπει να έχει όνομα 1 ή 2 digits, π.χ. "1" ή "21".
     * - Τα αρχεία πρέπει να ονομάζονται 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg.
     * - Δεν χρησιμοποιούμε p=test123.
     * - Δεν χρησιμοποιούμε t=1.
     * - Κρατάμε μόνο country, cloud name, folder και πλήθος εικόνων.
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

      // Δεν μπορούμε να δημιουργήσουμε card χωρίς τουλάχιστον μία εικόνα.
      if (validUrls.length === 0) {
        const url = `${publicWebUrl}/n#${countryCode}`;
        const finalUrlBytes = getUrlBytes(url);

        console.log('Base NFC213 URL:', url);
        console.log('Base NFC213 URL bytes:', finalUrlBytes);

        setGeneratedUrl(url);
        setGeneratedUrlBytes(finalUrlBytes);

        return;
      }

      // Για το compact format αρκεί να αναλύσουμε το πρώτο URL,
      // αφού όλες οι εικόνες πρέπει να είναι στον ίδιο Cloudinary folder.
      const firstUrl = validUrls[0];

      const cloudinaryPrefix = 'https://res.cloudinary.com/';
      const uploadPart = '/image/upload/';

      // Ελέγχουμε ότι πρόκειται πράγματι για Cloudinary URL.
      if (!firstUrl.startsWith(cloudinaryPrefix)) {
        throw new Error('NFC213 requires Cloudinary image URLs.');
      }

      // Αφαιρούμε το σταθερό https://res.cloudinary.com/
      const withoutPrefix = firstUrl.slice(cloudinaryPrefix.length);

      // Χωρίζουμε το URL σε:
      // cloudName | υπόλοιπο path μετά το /image/upload/
      const uploadParts = withoutPrefix.split(uploadPart);

      if (uploadParts.length !== 2) {
        throw new Error('Invalid Cloudinary image URL.');
      }

      const cloudName = uploadParts[0];
      const imagePath = uploadParts[1];

      // Παίρνουμε τα path segments.
      // Παράδειγμα:
      // v123456/21/1.jpg
      // γίνεται:
      // ["v123456", "21", "1.jpg"]
      const pathParts = imagePath.split('/');

      if (pathParts.length < 3) {
        throw new Error('Cloudinary URL does not contain the expected folder.');
      }

      // Το τελευταίο segment είναι το filename.
      const fileName = pathParts[pathParts.length - 1];

      // Το αμέσως προηγούμενο segment είναι ο numeric folder.
      const folder = pathParts[pathParts.length - 2];

      // Ο folder πρέπει να είναι ακριβώς 1 ή 2 ψηφία.
      if (!/^\d{1,2}$/.test(folder)) {
        throw new Error('NFC213 folder must contain only 1 or 2 digits.');
      }

      // Το πρώτο αρχείο πρέπει να ακολουθεί το pattern 1.jpg - 5.jpg.
      if (!/^[1-5]\.jpg$/i.test(fileName)) {
        throw new Error('NFC213 images must be named 1.jpg to 5.jpg.');
      }

      // Κρατάμε και το Cloudinary version segment, π.χ. v123456,
      // γιατί είναι μέρος του πραγματικού URL των εικόνων.
      const version = pathParts[0];

      // Το πλήθος των εικόνων μάς αρκεί για να ξέρει αργότερα το web
      // ότι πρέπει να ζητήσει 1.jpg έως N.jpg.
      const imageCount = validUrls.length;

      // Compact NFC213 format:
      //
      // country | cloudName | version | folder | imageCount
      //
      // Παράδειγμα:
      // GR|be726cds|v1791019|21|5
      //
      // Δεν χρησιμοποιούμε URLSearchParams για να αποφύγουμε extra χαρακτήρες
      // όπως c=, i1= και URL encoding τύπου %2F.
      const payload =
        `${countryCode}` +
        `|${cloudName}` +
        `|${version}` +
        `|${folder}` +
        `|${imageCount}`;

      // Χρησιμοποιούμε διαφορετικό route ώστε το web να ξέρει ότι
      // πρόκειται για NFC213 compact payload και όχι για το κανονικό /v format.
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
