// native/src/app/create-postcard-back/index.tsx

import { useContext, useRef, useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import BackOfPostcardSvg from '@/components/BackOfPostcardSvg';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

export default function CreatePostcardBack() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  // Ref του preview που θα γίνει export σε JPEG.
  const postcardRef = useRef<View>(null);

  // Message details.
  const [text, setText] = useState('');
  const [from, setFrom] = useState('');
  const [sentFrom, setSentFrom] = useState('');

  // Recipient details.
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Κάνει capture το postcard preview και το αποθηκεύει
  // στο photo library του κινητού ως JPEG.
  const handleDownloadJpeg = async () => {
    console.log('Download JPEG pressed');

    if (!postcardRef.current) {
      console.log('postcardRef is null');
      Alert.alert('Error', 'Postcard preview is not available.');
      return;
    }

    try {
      console.log('Requesting media permission...');

      const permission = await MediaLibrary.requestPermissionsAsync();

      console.log('Permission:', permission);

      if (!permission.granted) {
        console.log('Media permission denied');
        Alert.alert('Permission required', 'Please allow access to your photos.');
        return;
      }

      console.log('Starting capture...');

      const uri = await captureRef(postcardRef.current, {
        format: 'jpg',
        quality: 1,
      });

      console.log('Captured JPEG:', uri);

      await MediaLibrary.saveToLibraryAsync(uri);

      console.log('JPEG saved successfully');

      Alert.alert('Saved', 'Postcard saved to your photos.');
    } catch (error) {
      console.log('JPEG export error:', error);

      Alert.alert(
        'Error',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={globalStyles.screen}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={globalStyles.screenContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={globalStyles.title}>
            Create Postcard Back
          </Text>

          {/* Live preview της πίσω πλευράς της postcard */}
          <View style={globalStyles.centerContent}>
            <View
              ref={postcardRef}
              collapsable={false}
            >
              <BackOfPostcardSvg
                address={address}
                city={city}
                country={country}
                postalCode={postalCode}
                from={from}
                sentFrom={sentFrom}
                text={text}
                width={350}
              />
            </View>
          </View>

          {/* Fields για το μήνυμα */}
          <View style={[globalStyles.card, globalStyles.section]}>
            <Text style={globalStyles.sectionTitle}>
              Message
            </Text>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write your message"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={globalStyles.input}
            />

            <TextInput
              value={from}
              onChangeText={setFrom}
              placeholder="From"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />

            <TextInput
              value={sentFrom}
              onChangeText={setSentFrom}
              placeholder="Sent from"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />
          </View>

          {/* Fields για τον παραλήπτη */}
          <View style={[globalStyles.card, globalStyles.section]}>
            <Text style={globalStyles.sectionTitle}>
              Recipient
            </Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />

            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />

            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />

            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal code"
              placeholderTextColor={colors.textSecondary}
              style={globalStyles.input}
            />
          </View>

          {/* Αποθήκευση της postcard ως JPEG */}
          <Pressable
            style={globalStyles.primaryButton}
            onPress={() => void handleDownloadJpeg()}
          >
            <Text style={globalStyles.primaryButtonText}>
              Download JPEG
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}