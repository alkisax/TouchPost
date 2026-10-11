import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type AdConsentContextValue = {
  isLoading: boolean;
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdConsentContext = createContext<AdConsentContextValue | undefined>(
  undefined,
);

export function AdConsentProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const mobileAdsInitialized = useRef(false);

  const applyConsentInfo = useCallback((consentInfo: Awaited<ReturnType<typeof AdsConsent.getConsentInfo>>) => {
    setCanRequestAds(consentInfo.canRequestAds);
    setPrivacyOptionsRequired(
      consentInfo.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeConsent = async () => {
      try {
        const consentInfo = await AdsConsent.gatherConsent();
        if (mounted) {
          applyConsentInfo(consentInfo);
        }
        if (consentInfo.canRequestAds && !mobileAdsInitialized.current) {
          mobileAdsInitialized.current = true;
          await mobileAds().initialize();
        }
      } catch (error) {
        console.warn('[AdMob] Consent gathering failed', error);
        if (mounted) {
          setCanRequestAds(false);
          setPrivacyOptionsRequired(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeConsent();

    return () => {
      mounted = false;
    };
  }, [applyConsentInfo]);

  const showPrivacyOptions = useCallback(async () => {
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      applyConsentInfo(consentInfo);
      if (consentInfo.canRequestAds && !mobileAdsInitialized.current) {
        mobileAdsInitialized.current = true;
        await mobileAds().initialize();
      }
    } catch (error) {
      console.warn('[AdMob] Privacy options form could not be opened', error);
    }
  }, [applyConsentInfo]);

  const value = useMemo(
    () => ({
      isLoading,
      canRequestAds,
      privacyOptionsRequired,
      showPrivacyOptions,
    }),
    [isLoading, canRequestAds, privacyOptionsRequired, showPrivacyOptions],
  );

  return (
    <AdConsentContext.Provider value={value}>
      {children}
    </AdConsentContext.Provider>
  );
}

export function useAdConsent() {
  const context = useContext(AdConsentContext);
  if (!context) {
    throw new Error('useAdConsent must be used within AdConsentProvider');
  }
  return context;
}
