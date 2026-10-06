import { useContext } from 'react';
import { Picker } from '@react-native-picker/picker';

import { countries } from '@/constants/constants';
import { ThemeContext } from '@/context/ThemeContext';

type CountryCodePickerProps = {
  countryCode: string;
  onChange: (countryCode: string) => void;
};

export default function CountryCodePicker({
  countryCode,
  onChange,
}: CountryCodePickerProps) {
  const { colors } = useContext(ThemeContext);

  return (
    <Picker
      selectedValue={countryCode}
      onValueChange={(value) => onChange(value)}
      style={{ color: colors.text }}
      dropdownIconColor={colors.text}
    >
      {countries.map((country) => (
        <Picker.Item
          key={country.code}
          label={country.name}
          value={country.code}
          color="#ffffff"
        />
      ))}
    </Picker>
  );
}