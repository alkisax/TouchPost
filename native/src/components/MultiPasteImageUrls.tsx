import { useContext, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

type MultiPasteImageUrlsProps = {
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function MultiPasteImageUrls({
  imageUrls,
  setImageUrls,
}: MultiPasteImageUrlsProps) {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [bulkImageUrls, setBulkImageUrls] = useState('');

  const parsedUrlCount = bulkImageUrls
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter(Boolean).length;

  const handlePopulateFields = () => {
    if (bulkImageUrls.trim() === '') {
      return;
    }

    const parsedUrls = bulkImageUrls
      .split(/[\s,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    const firstFive = parsedUrls.slice(0, 5);

    setImageUrls([
      ...firstFive,
      ...Array(5 - firstFive.length).fill(''),
    ]);
  };

  return (
    <View style={globalStyles.section}>
      <Text style={globalStyles.sectionTitle}>Paste multiple image URLs</Text>
      <TextInput
        multiline
        numberOfLines={4}
        onChangeText={setBulkImageUrls}
        placeholder="Paste one URL per line, or separate URLs with spaces or commas"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={globalStyles.input}
        value={bulkImageUrls}
      />
      <Pressable
        onPress={handlePopulateFields}
        style={globalStyles.secondaryButton}
      >
        <Text style={globalStyles.secondaryButtonText}>
          Populate image fields
        </Text>
      </Pressable>
      {parsedUrlCount > 5 && (
        <Text style={globalStyles.dimText}>
          Only the first 5 URLs were added.
        </Text>
      )}
      {imageUrls.length !== 5 && (
        <Text style={globalStyles.error}>
          Image fields are not configured for 5 URLs.
        </Text>
      )}
    </View>
  );
}
