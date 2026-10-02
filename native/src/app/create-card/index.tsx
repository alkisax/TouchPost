import { useContext, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';
import { publicWebUrl } from '@/constants/constants';
import { compactImageUrls, shortenImageUrls } from '@/utils/compactImageUrls';
import axios from 'axios';
import CountdownButton from '@/components/CountdownButton';

export default function CreateCard() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generatedUrlBytes, setGeneratedUrlBytes] = useState(0);

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
    const validUrls = imageUrls
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const compactImages = compactImageUrls(validUrls);

    const params = new URLSearchParams();

    params.set('p', 'test123');
    params.set('t', '1');
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

      shortenedUrls.forEach((shortUrl, index) => {
        shortParams.set(`i${index + 1}`, shortUrl);
      });

      url = `${publicWebUrl}/v?${shortParams.toString()}`;
    }

    console.log(url)
    setGeneratedUrl(url);
    setGeneratedUrlBytes(getUrlBytes(url));
  };

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <View
        style={{
          padding: SPACING.md,
          gap: SPACING.md,
        }}
      >
        <Text style={globalStyles.title}>Create Card</Text>

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
      />

      {generatedUrl !== '' && (
        <>
          <Text style={globalStyles.text}>{generatedUrl}</Text>

          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => void handleCopyUrl()}
          >
            <Text style={globalStyles.primaryButtonText}>Copy URL</Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}