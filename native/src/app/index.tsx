// native\src\app\index.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AxiosError } from 'axios';

import MockAdBanner from '@/ads/MockAdBanner';
import MockInterstitialAd from '@/ads/MockInterstitialAd';
import SupportDeveloperAdButton from '@/ads/SupportDeveloperAdButton';
import { UserAuthContext } from '@/authLogin/context/UserAuthContext';
import { getEffectiveRole } from '@/authLogin/types/types';
import { api } from '@/authLogin/services/api';
import { backendUrl } from '@/constants/constants';
import { ThemeContext } from '@/context/ThemeContext';
import { createGlobalStyles, SPACING } from '@/styles/global';

type MonetizationStatus = {
  hasPaid: boolean;
  adFreeUntil: string | null;
};

type MonetizationResponse = {
  status: boolean;
  data: MonetizationStatus;
};

export default function Index() {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(UserAuthContext);
  const globalStyles = createGlobalStyles(colors);
  const [isMockInterstitialVisible, setMockInterstitialVisible] = useState(
    false,
  );
  const [monetizationStatus, setMonetizationStatus] =
    useState<MonetizationStatus | null>(null);
  const [monetizationLoading, setMonetizationLoading] = useState(false);
  const [monetizationError, setMonetizationError] = useState<string | null>(
    null,
  );
  const [adGranting, setAdGranting] = useState(false);

  const isTenantRole =
    user && ['ADMIN', 'STAFF'].includes(getEffectiveRole(user));

  useEffect(() => {
    if (!isTenantRole) {
      setMonetizationStatus(null);
      setMonetizationError(null);
      setMonetizationLoading(false);
      return;
    }

    let active = true;

    const loadMonetizationStatus = async () => {
      setMonetizationLoading(true);
      setMonetizationError(null);

      try {
        const token = await AsyncStorage.getItem('token');
        const response = await api.get<MonetizationResponse>(
          `${backendUrl}/company-users/mine/ad-status`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (active) {
          setMonetizationStatus(response.data.data);
        }
      } catch (error: unknown) {
        if (active) {
          setMonetizationError(getRequestError(error));
          setMonetizationStatus(null);
        }
      } finally {
        if (active) {
          setMonetizationLoading(false);
        }
      }
    };

    void loadMonetizationStatus();

    return () => {
      active = false;
    };
  }, [isTenantRole]);

  const hasActiveAdFreePeriod = Boolean(
    monetizationStatus?.adFreeUntil &&
    new Date(monetizationStatus.adFreeUntil).getTime() > Date.now(),
  );
  const shouldShowAds = Boolean(
    isTenantRole &&
    monetizationStatus &&
    !monetizationStatus.hasPaid &&
    !hasActiveAdFreePeriod,
  );

  const handleMockAdCompleted = async () => {
    if (!user || !isTenantRole) {
      setMockInterstitialVisible(false);
      return;
    }

    setAdGranting(true);
    setMonetizationError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.post<MonetizationResponse>(
        `${backendUrl}/company-users/mine/ad-free`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMonetizationStatus(response.data.data);
      setMockInterstitialVisible(false);
    } catch (error: unknown) {
      setMonetizationError(getRequestError(error));
      setMockInterstitialVisible(false);
    } finally {
      setAdGranting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={globalStyles.screen}>
      <View style={globalStyles.centerContent}>
<View style={{ width: 240, gap: 12 }}>
  <Pressable
    style={globalStyles.primaryButton}
    onPress={() => router.push('/create-card')}
  >
    <Text style={globalStyles.primaryButtonText}>Create Card</Text>
  </Pressable>

  <Pressable
    style={globalStyles.primaryButton}
    onPress={() => router.push('/nfc213')}
  >
    <Text style={globalStyles.primaryButtonText}>Small NFC</Text>
  </Pressable>

  <Pressable
    style={globalStyles.primaryButton}
    onPress={() => router.push('/create-postcard-back')}
  >
    <Text style={globalStyles.primaryButtonText}>
      Create Postcard Back
    </Text>
  </Pressable>
</View>
      </View>

      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
        }}
      >
        {shouldShowAds && !adGranting && (
          <SupportDeveloperAdButton
            onPress={() => setMockInterstitialVisible(true)}
          />
        )}
        <Text
          style={[
            globalStyles.dimText,
            {
              marginBottom: SPACING.xs,
              marginTop: SPACING.xs,
              textAlign: 'center',
            },
          ]}
        >
          {monetizationLoading
            ? 'Monetization status: loading...'
            : monetizationStatus
              ? `Has paid: ${monetizationStatus.hasPaid ? 'Y' : 'N'} | Ad free until: ${formatDateTime(
                monetizationStatus.adFreeUntil,
              )}`
              : 'Has paid: - | Ad free until: -'}
        </Text>
        {monetizationError && (
          <Text style={globalStyles.error}>{monetizationError}</Text>
        )}
        {shouldShowAds && !adGranting && <MockAdBanner />}
      </View>

      <MockInterstitialAd
        onCompleted={() => void handleMockAdCompleted()}
        visible={isMockInterstitialVisible}
      />
    </SafeAreaView>
  );
}

const formatDateTime = (value: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return '-';
  }

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const getRequestError = (error: unknown) => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    return error.response.data.message;
  }

  return 'Unable to load monetization status.';
};
