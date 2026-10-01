import { useContext } from 'react';
import { Redirect } from 'expo-router';
import { UserAuthContext } from '@/authLogin/context/UserAuthContext';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

const termsSections = [
  {
    heading: '1. About This Project',
    paragraphs: [
      'This starter project is provided as a reusable example. Replace this placeholder text with application-specific Terms before production use.',
      'Users are currently permitted to use the application, but continued availability is not guaranteed. The owner or administrator may modify, suspend, reset, discontinue, or shut down the service at any time.',
    ],
  },
  {
    heading: '2. Use of the Service',
    paragraphs: [
      'Use this starter only for lawful and appropriate purposes. The final application owner must define the rules that apply to its service.',
    ],
  },
  {
    heading: '3. Administrative and Technical Access',
    paragraphs: [
      'The final application owner should document how operational access, support, maintenance, and security work for the finished service.',
      'This technical ability does not mean that information is routinely inspected manually. However, users should not treat MyPDA as a system for storing highly confidential, sensitive, or critical information.',
    ],
  },
  {
    heading: '4. Data Storage, Retention and Deletion',
    paragraphs: [
      'The final application owner should document retention, backup, recovery, and account-deletion practices here.',
      'If the project is discontinued, stored data may also be deleted. Users are responsible for keeping their own copies of important information and should not rely on MyPDA as the sole copy of any data.',
    ],
  },
  {
    heading: '5. Availability and Changes',
    paragraphs: [
      'The final application owner should replace this section with accurate availability and change information.',
    ],
  },
  {
    heading: '6. Acceptable Use',
    paragraphs: [
      'Users must not violate applicable law, attempt unauthorized access, disrupt the service, or abuse its infrastructure.',
    ],
  },
  {
    heading: '7. User Responsibilities',
    paragraphs: [
      'Users are responsible for their credentials and for the legality and accuracy of information they submit.',
    ],
  },
  {
    heading: '8. Disclaimer of Warranties',
    paragraphs: [
      'This placeholder is not production legal text. Obtain application-specific legal review before publishing final Terms.',
    ],
  },
  {
    heading: '9. Limitation of Liability',
    paragraphs: [
      'Replace this placeholder with application-specific liability language reviewed for the jurisdictions that apply.',
    ],
  },
  {
    heading: '10. Privacy',
    paragraphs: [
      'These placeholder Terms do not replace a Privacy Policy. Add accurate privacy documentation before production use.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    paragraphs: [
      'Replace these placeholder Terms with the versioning and update process used by the final application.',
    ],
  },
];

const TermsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(UserAuthContext);
  const globalStyles = createGlobalStyles(colors);

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.card}>
          <Text style={globalStyles.title}>Terms of Use</Text>
          <Text style={[globalStyles.dimText, { marginTop: SPACING.sm }]}>
            Last updated: September 7, 2026
          </Text>

          {termsSections.map((section) => (
            <View key={section.heading} style={{ marginTop: SPACING.lg }}>
              <Text style={globalStyles.text}>{section.heading}</Text>
              {section.paragraphs.map((paragraph) => (
                <Text
                  key={paragraph}
                  style={[globalStyles.text, { marginTop: SPACING.sm }]}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsScreen;
