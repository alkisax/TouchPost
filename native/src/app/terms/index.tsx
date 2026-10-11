import { useContext } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';
import PrivacyChoicesButton from '@/components/PrivacyChoicesButton';

export default function Terms() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Text style={globalStyles.title}>TouchPost Terms &amp; Disclaimer</Text>

        <View style={globalStyles.card}>
          <Text style={globalStyles.text}>
            TouchPost was created as part of an educational and experimental
            software project.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            The application and its related web pages are provided as-is.
            Features, behavior, availability, hosting, and online services may
            change, become unavailable, or be discontinued at any time without
            prior notice.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            TouchPost does not guarantee continuous availability, permanent
            hosting, or long-term storage of any content or links.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            TouchPost does not host or directly access the photos that users
            choose to include in their cards. Users provide public image URLs
            hosted by third-party image providers such as Cloudinary,
            Postimages, or other services. TouchPost only uses those public
            URLs to display the images in the generated card experience.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            Users are responsible for ensuring that they have the right to use
            and share the images and content they include.
          </Text>

          <Text style={[globalStyles.sectionTitle, { marginTop: SPACING.md }]}>
            TouchPost is not responsible for:
          </Text>
          <Text style={globalStyles.text}>
            • third-party image hosting services;{`\n`}
            • unavailable or expired image URLs;{`\n`}
            • content removed by external providers;{`\n`}
            • NFC tag damage or incompatibility;{`\n`}
            • loss of access caused by changes to hosting, external services,
            or the project itself.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            The application may display personalized advertisements through
            third-party advertising services such as Google AdMob.
          </Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            Advertising providers may process information according to their
            own privacy policies and consent requirements.
          </Text>

          <PrivacyChoicesButton />

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            TouchPost does not sell uploaded photos and does not provide the
            developer with direct access to the image files hosted by users on
            external services.
          </Text>

          <Text style={[globalStyles.sectionTitle, { marginTop: SPACING.md }]}>
            For questions or contact:
          </Text>
          <Text style={globalStyles.text}>alkisax@gmail.com</Text>

          <Text style={[globalStyles.text, { marginTop: SPACING.md }]}>
            By using TouchPost, you acknowledge that this is an experimental
            educational project and that the service may change or stop
            operating without notice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
