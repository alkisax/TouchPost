// native/src/components/CreateCardInstructions.tsx

import { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';


export default function CreateCardInstructions() {
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
          {isExpanded ? 'Hide instructions' : 'How to create your TouchPost card'}
        </Text>
      </Pressable>

      {isExpanded && (
        <View style={globalStyles.section}>
          <Text style={globalStyles.text}>
            Upload your photos to any image hosting provider you prefer, such as
            Cloudinary or Postimages.
          </Text>

          <Text style={globalStyles.dimText}>
            1. Make sure every image URL is publicly accessible without login or
            authentication.
          </Text>

          <Text style={globalStyles.dimText}>
            2. Prefer short file names and reasonably short URLs so the final
            URL can fit on the NFC tag.
          </Text>

          <Text style={globalStyles.dimText}>
            3. Copy and paste up to 5 image URLs into the corresponding image
            fields.
          </Text>

          <Text style={globalStyles.dimText}>
            4. If you have a written postcard message, paste its public image
            URL into the Postcard back field.
          </Text>

          <Text style={globalStyles.dimText}>
            TouchPost also includes a tool for creating an image of the back of
            the postcard if you want to use it.
          </Text>

          <Text style={globalStyles.dimText}>
            5. Press Create URL.
          </Text>

          <Text style={globalStyles.dimText}>
            6. Check the NFC size information and make sure the generated URL
            fits on the tag.
          </Text>

          <Text style={globalStyles.dimText}>
            7. Press Write NFC.
          </Text>

          <Text style={globalStyles.dimText}>
            8. Bring the NFC tag close to your phone and keep it there until the
            app confirms that the write was successful.
          </Text>

          <Text style={globalStyles.dimText}>
            9. Once the write is complete, attach the NFC tag to your physical
            postcard.
          </Text>

          <Text style={globalStyles.text}>
            That&apos;s it — your TouchPost card is ready.
          </Text>
        </View>
      )}
    </View>
  );
}
