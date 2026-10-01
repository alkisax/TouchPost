import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { bannerAdUnitId } from '@/constants/constants';

const AdsBanner = () => (
  <View style={{ alignItems: 'center' }}>
    <BannerAd
      unitId={bannerAdUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      onAdFailedToLoad={(error) => {
        console.warn('[AdMob] Banner failed to load', error);
      }}
    />
  </View>
);

export default AdsBanner;
