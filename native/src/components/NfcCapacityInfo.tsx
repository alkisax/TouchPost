import { useContext } from 'react';
import { Text, View } from 'react-native';

import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/styles/global';

type NfcCapacityInfoProps = {
  usedBytes: number;
  maxBytes: number;
};

export default function NfcCapacityInfo({
  usedBytes,
  maxBytes,
}: NfcCapacityInfoProps) {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const remainingBytes = maxBytes - usedBytes;

  return (
    <View>
      <Text style={globalStyles.text}>
        URL size: {usedBytes} bytes
      </Text>

      <Text style={globalStyles.text}>
        {remainingBytes >= 0
          ? `Remaining: ${remainingBytes} bytes`
          : `Too large by: ${Math.abs(remainingBytes)} bytes`}
      </Text>
    </View>
  );
}