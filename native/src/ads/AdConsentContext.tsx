import {
  AdsConsent,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AdConsentContextValue = {
  consentResolved: boolean;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus;
  showPrivacyOptionsForm: () => Promise<void>;
};

const AdConsentContext = createContext<AdConsentContextValue | undefined>(
  undefined,
);

type AdConsentProviderProps = {
  children: ReactNode;
};

export const AdConsentProvider = ({ children }: AdConsentProviderProps) => {
  const [consentResolved, setConsentResolved] = useState(false);
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [privacyOptionsRequirementStatus, setPrivacyOptionsRequirementStatus] =
    useState(AdsConsentPrivacyOptionsRequirementStatus.UNKNOWN);

  const applyConsentInfo = useCallback((consentInfo: AdsConsentInfo) => {
    setCanRequestAds(consentInfo.canRequestAds === true);
    setPrivacyOptionsRequirementStatus(
      consentInfo.privacyOptionsRequirementStatus,
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveConsent = async () => {
      try {
        await AdsConsent.requestInfoUpdate();
        await AdsConsent.loadAndShowConsentFormIfRequired();
        const consentInfo = await AdsConsent.getConsentInfo();

        if (!isMounted) return;

        applyConsentInfo(consentInfo);
        setConsentResolved(true);
      } catch {
        if (!isMounted) return;

        setCanRequestAds(false);
        setConsentResolved(false);
      }
    };

    void resolveConsent();

    return () => {
      isMounted = false;
    };
  }, [applyConsentInfo]);

  const showPrivacyOptionsForm = useCallback(async () => {
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      applyConsentInfo(consentInfo);
    } catch {
      setCanRequestAds(false);
    }
  }, [applyConsentInfo]);

  const value = useMemo(
    () => ({
      consentResolved,
      canRequestAds,
      privacyOptionsRequirementStatus,
      showPrivacyOptionsForm,
    }),
    [
      canRequestAds,
      consentResolved,
      privacyOptionsRequirementStatus,
      showPrivacyOptionsForm,
    ],
  );

  return (
    <AdConsentContext.Provider value={value}>
      {children}
    </AdConsentContext.Provider>
  );
};

export const useAdConsent = () => {
  const context = useContext(AdConsentContext);

  if (!context) {
    throw new Error('useAdConsent must be used within AdConsentProvider');
  }

  return context;
};
