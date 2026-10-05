// native\src\app\create-card\index.tsx
import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Picker } from '@react-native-picker/picker';

import { countries, publicWebUrl } from '@/constants/constants';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';
import { compactImageUrls, shortenImageUrls } from '@/utils/compactImageUrls';
import CountdownButton from '@/components/CountdownButton';
import { readNfc } from '@/utils/readNfc';
import { writeNfcUrl } from '@/utils/writeNfc';

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
    if (isCreatingUrl) {
      return;
    }

    setIsCreatingUrl(true);
    try {
      const validUrls = imageUrls
      .map((url) => url.trim())
      .filter((url) => url !== '');

      const compactImages = compactImageUrls(validUrls);

      const params = new URLSearchParams();

      params.set('p', 'test123');
      params.set('t', '1');
      params.set('c', countryCode);
      params.set('b', compactImages.prefix);

      compactImages.paths.forEach((path, index) => {
      params.set(`i${index + 1}`, path);
      });

      let url = `${publicWebUrl}/v?${params.toString()}`;

      const urlBytes = new TextEncoder().encode(url).length;

      if (urlBytes > 480) {
      const shortenedUrls = await shortenImageUrls(validUrls);

        const shortParams = new URLSearchParams();

        shortParams.set('p', 'test123');
        shortParams.set('t', '1');
        shortParams.set('c', countryCode);

        shortenedUrls.forEach((shortUrl, index) => {
        shortParams.set(`i${index + 1}`, shortUrl);
        });

        url = `${publicWebUrl}/v?${shortParams.toString()}`;
      }

      console.log(url)
      setGeneratedUrl(url);
      setGeneratedUrlBytes(getUrlBytes(url));
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
        <Text style={globalStyles.title}>Create Card!</Text>

        <View style={[globalStyles.card, globalStyles.section]}>
          <Text style={globalStyles.sectionTitle}>Card details</Text>
          <Picker selectedValue={countryCode} onValueChange={(value) => setCountryCode(value)}>
            {countries.map((country) => (
              <Picker.Item key={country.code} label={country.name} value={country.code} />
            ))}
          </Picker>
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
