import { View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '@/constants/constants';
import { useAdConsent } from '@/ads/AdConsentContext';

const AdsBanner = () => {
  const { canRequestAds } = useAdConsent();

  if (!canRequestAds) {
    return null;
  }

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.warn('[AdMob] Banner failed to load', error);
        }}
      />
    </View>
  );
};

export default AdsBanner;
