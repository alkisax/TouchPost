import { useContext } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

// type GuideScreenshotProps = {
//   source?: ImageSourcePropType;
//   label: string;
// };

// function GuideScreenshot({ source, label }: GuideScreenshotProps) {
//   const { colors } = useContext(ThemeContext);

//   if (source) {
//     return <Image accessibilityLabel={label} source={source} style={styles.screenshot} />;
//   }

//   return (
//     <View
//       style={[
//         styles.screenshotPlaceholder,
//         { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
//       ]}
//     >
//       <Text style={[styles.placeholderText, { color: colors.dimText }]}>
//         Screenshot to be added
//       </Text>
//     </View>
//   );
// }

export default function Info() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.title}>How to use TouchPost</Text>
        <Text style={[globalStyles.text, styles.intro]}>
          TouchPost creates postcard URLs and writes them to NFC tags for use
          with physical postcards.
        </Text>

        <View style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.sectionTitle}>1. Create Card</Text>
          {/* <GuideScreenshot
            label="Create Card screen"
            // TODO: Add native/assets/images/info-create-card.png and pass it here.
          /> */}
          <Text style={globalStyles.text}>
            Upload your photos to a public image host, then paste up to five
            public image URLs into the form. You can also add an optional
            postcard-back image URL.
          </Text>
          <Text style={globalStyles.text}>
            Generate the URL, check its NFC size, and write it to the NFC tag.
          </Text>
        </View>

        <View style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.sectionTitle}>2. Small NFC / NFC213</Text>
          {/* <GuideScreenshot
            label="Small NFC / NFC213 screen"
            // TODO: Add native/assets/images/info-nfc213.png and pass it here.
          /> */}
          <Text style={globalStyles.text}>
            Use this flow for smaller NFC tags. It requires public Cloudinary
            image URLs that follow the compact card naming convention.
          </Text>
          <Text style={globalStyles.text}>
            Only the compact card identity is written to the tag, so the app
            can generate a much shorter URL.
          </Text>
        </View>

        <View style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.sectionTitle}>3. Create Postcard Back</Text>
          {/* <GuideScreenshot
            label="Create Postcard Back screen"
            // TODO: Add native/assets/images/info-postcard-back.png and pass it here.
          /> */}
          <Text style={globalStyles.text}>
            Write the message and address to preview the back of the postcard.
            Save the result as a JPEG, upload it to an image host, and paste
            its public URL into the Postcard back field in Create Card.
          </Text>
        </View>

        <View style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.sectionTitle}>NFC writing reminder</Text>
          <Text style={globalStyles.text}>
            Press Write NFC, bring the tag close to the phone, and keep it
            there until the app confirms success. Then attach the tag to the
            physical postcard.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  intro: {
    textAlign: 'center',
  },
  section: {
    gap: SPACING.sm,
  },
  screenshot: {
    borderRadius: 8,
    height: 220,
    width: '100%',
  },
  screenshotPlaceholder: {
    alignItems: 'center',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 160,
    justifyContent: 'center',
    width: '100%',
  },
  placeholderText: {
    fontSize: 14,
  },
});
