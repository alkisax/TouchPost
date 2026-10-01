import { useEffect, useRef, useState } from 'react';
import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads';

import { interstitialAdUnitId } from '@/constants/constants';

type InterstitialClosedHandler = () => void;

export const useInterstitialAd = (onClosed?: InterstitialClosedHandler) => {
  const adRef = useRef<InterstitialAd | null>(null);
  const onClosedRef = useRef(onClosed);
  const [loaded, setLoaded] = useState(false);

  onClosedRef.current = onClosed;

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    adRef.current = ad;

    const unsubscribeLoaded = ad.addAdEventListener(
      AdEventType.LOADED,
      () => setLoaded(true),
    );
    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        onClosedRef.current?.();
        ad.load();
      },
    );
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        setLoaded(false);
        console.warn('[AdMob] Interstitial failed', error);
      },
    );

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      adRef.current = null;
    };
  }, []);

  const showAd = () => {
    if (!loaded || !adRef.current) return false;

    setLoaded(false);
    void adRef.current.show();
    return true;
  };

  const loadAd = () => {
    adRef.current?.load();
  };

  return { loadAd, showAd, loaded };
};
