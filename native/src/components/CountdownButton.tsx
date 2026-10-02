import { useState } from 'react';
import { Pressable, Text } from 'react-native';

type CountdownButtonProps = {
  label: string;
  seconds?: number;
  onPress: () => Promise<void>;
  buttonStyle?: object;
  textStyle?: object;
};

export default function CountdownButton({
  label,
  seconds = 10,
  onPress,
  buttonStyle,
  textStyle,
}: CountdownButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  const handlePress = async () => {
    if (countdown !== null) {
      return;
    }

    setCountdown(seconds);

    const interval = setInterval(() => {
      setCountdown((current) => {
        if (current === null || current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    try {
      await onPress();
    } finally {
      clearInterval(interval);
      setCountdown(null);
    }
  };

  return (
    <Pressable
      style={buttonStyle}
      onPress={() => void handlePress()}
      disabled={countdown !== null}
    >
      <Text style={textStyle}>
        {countdown !== null ? `${countdown}s` : label}
      </Text>
    </Pressable>
  );
}