import { Linking, Pressable, Text } from 'react-native';

import { createGlobalStyles } from '@/styles/global';
import { ThemeContext } from '@/context/ThemeContext';
import { useContext } from 'react';

type PreviewCardButtonProps = {
  url: string;
};

export default function PreviewCardButton({
  url,
}: PreviewCardButtonProps) {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const handlePreview = async () => {
    if (!url) {
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        globalStyles.primaryButton,
        pressed && globalStyles.pressedButton,
      ]}
      onPress={() => void handlePreview()}
    >
      <Text style={globalStyles.primaryButtonText}>
        Preview Card
      </Text>
    </Pressable>
  );
}