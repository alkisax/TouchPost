import { useContext } from 'react';
import { Pressable, Text } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

type SupportDeveloperAdButtonProps = {
  onPress: () => void;
};

const SupportDeveloperAdButton = ({
  onPress,
}: SupportDeveloperAdButtonProps) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={globalStyles.secondaryButton}
    >
      <Text style={globalStyles.secondaryButtonText}>
        Watch Ad to Support Dev
      </Text>
    </Pressable>
  );
};

export default SupportDeveloperAdButton;
