import { useEffect, useRef, useState } from 'react';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { rewardedAdUnitId } from '@/constants/constants';
import { useAdConsent } from '@/ads/AdConsentContext';

export function useRewardedAd() {
  const adRef = useRef<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState(false);
  const { canRequestAds } = useAdConsent();

  useEffect(() => {
    if (!canRequestAds) {
      adRef.current = null;
      setIsLoaded(false);
      setIsShowing(false);
      return;
    }

    const ad = RewardedAd.createForAdRequest(rewardedAdUnitId);
    adRef.current = ad;

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setError(false);
        setIsLoaded(true);
      },
    );
    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsShowing(false);
        setIsLoaded(false);
        ad.load();
      },
    );
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (adError) => {
        setIsLoaded(false);
        setIsShowing(false);
        setError(true);
        console.warn('[AdMob] Rewarded ad failed', adError);
      },
    );

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      adRef.current = null;
    };
  }, [canRequestAds]);

  const showAd = () => {
    if (!canRequestAds || !isLoaded || !adRef.current) {
      return;
    }

    setIsShowing(true);
    setIsLoaded(false);
    void adRef.current.show().catch((adError) => {
      setIsShowing(false);
      setError(true);
      console.warn('[AdMob] Rewarded ad could not be shown', adError);
    });
  };

  return {
    error,
    canRequestAds,
    isLoaded,
    isShowing,
    showAd,
  };
}
