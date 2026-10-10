// native/src/components/Nfc213Instructions.tsx

import { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

export default function Nfc213Instructions() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={[globalStyles.card, globalStyles.section]}>
      <Pressable
        style={globalStyles.secondaryButton}
        onPress={() => setIsExpanded((current) => !current)}
      >
        <Text style={globalStyles.secondaryButtonText}>
          {isExpanded ? 'Hide instructions' : 'How to prepare the images'}
        </Text>
      </Pressable>

      {isExpanded && (
        <View style={globalStyles.section}>
          <Text style={globalStyles.text}>
            Small NFC cards work only with Cloudinary images.
          </Text>

          <Text style={globalStyles.dimText}>
            1. Create one card number, for example 1, 2 or 3.
          </Text>

          <Text style={globalStyles.dimText}>
            2. Keep the images for that card together in the corresponding
            Cloudinary folder, for example folder 1 for card 1.
          </Text>

          <Text style={globalStyles.dimText}>
            3. Image public IDs must follow the card number:
          </Text>

          <Text style={globalStyles.resultText}>
            1.1.jpg{'\n'}
            1.2.jpg{'\n'}
            1.3.jpg{'\n'}
            1.4.jpg{'\n'}
            1.5.jpg
          </Text>

          <Text style={globalStyles.dimText}>
            For card 2 use:
          </Text>

          <Text style={globalStyles.resultText}>
            2.1.jpg{'\n'}
            2.2.jpg{'\n'}
            2.3.jpg{'\n'}
            2.4.jpg{'\n'}
            2.5.jpg
          </Text>

          <Text style={globalStyles.dimText}>
            4. The optional postcard back must use the same card number followed
            by .b:
          </Text>

          <Text style={globalStyles.resultText}>
            1.b.jpg{'\n'}
            2.b.jpg{'\n'}
            3.b.jpg
          </Text>

          <Text style={globalStyles.dimText}>
            5. You only need to paste one valid image URL from the card below.
            The app extracts the Cloudinary account and card number automatically.
          </Text>
        </View>
      )}
    </View>
  );
}