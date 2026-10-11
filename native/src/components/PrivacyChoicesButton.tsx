import { Pressable, Text } from 'react-native'
import {
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads'

import { useAdConsent } from '@/ads/AdConsentContext'
import { createGlobalStyles } from '@/styles/global'
import { ThemeContext } from '@/context/ThemeContext'
import { useContext } from 'react'

const PrivacyChoicesButton = () => {
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)

  const {
    privacyOptionsRequirementStatus,
    showPrivacyOptionsForm,
  } = useAdConsent()

  if (
    privacyOptionsRequirementStatus !==
    AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
  ) {
    return null
  }

  return (
    <Pressable
      style={globalStyles.secondaryButton}
      onPress={() => void showPrivacyOptionsForm()}
    >
      <Text style={globalStyles.secondaryButtonText}>
        Privacy choices
      </Text>
    </Pressable>
  )
}

export default PrivacyChoicesButton