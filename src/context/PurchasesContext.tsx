import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { saveOnboardingProgress } from '../services/onboardingService';
import { useOnboarding } from './OnboardingContext';

interface PurchasesContextValue {
  isInitializing: boolean;
  isPurchasing: boolean;
  isSyncing: boolean;
  initializeError: string | null;
  purchaseError: string | null;

  offerings: PurchasesOfferings | null;
  packages: PurchasesPackage[];
  defaultPackages: PurchasesPackage[];
  upgradePackages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;

  hasActiveSubscription: boolean;
  activeEntitlementIds: string[];
  allEntitlementIds: string[];
  hasHdVideos: boolean;
  refreshOfferings: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  syncPurchases: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<CustomerInfo | null>;
  restorePurchases: () => Promise<CustomerInfo | null>;
}

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);



interface PurchasesProviderProps {
  children: ReactNode;
  onSubscriptionUpdate?: (customerInfo: CustomerInfo) => void;
}

export function PurchasesProvider({ children, onSubscriptionUpdate }: PurchasesProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initializeError, setInitializeError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const packages = useMemo(() => {
    if (!offerings?.all) return [];
    // Get packages from all offerings (default + add-ons)
    const allPackages: PurchasesPackage[] = [];
    Object.values(offerings.all).forEach(offering => {
      allPackages.push(...offering.availablePackages);
    });
    return allPackages;
  }, [offerings]);

  const defaultPackages = useMemo(() => {
    if (!offerings?.all?.default) return [];
    return offerings.all.default.availablePackages;
  }, [offerings]);

  const upgradePackages = useMemo(() => {
    if (!offerings?.all?.upgrades) return [];
    return offerings.all.upgrades.availablePackages;
  }, [offerings]);

  const activeEntitlementIds = useMemo(() => {
    if (!customerInfo) return [];
    return Object.keys(customerInfo.entitlements.active ?? {});
  }, [customerInfo]);

  const allEntitlementIds = useMemo(() => {
    if (!customerInfo) return [];
    const activeIds = Object.keys(customerInfo.entitlements.active ?? {});
    const allIds = Object.keys(customerInfo.entitlements.all ?? {});
    // Combine active and all entitlements, removing duplicates
    return [...new Set([...activeIds, ...allIds])];
  }, [customerInfo]);

  const hasActiveSubscription = useMemo(() => activeEntitlementIds.length > 0, [activeEntitlementIds]);

  const hasHdVideos = useMemo(() => allEntitlementIds.includes('hd_videos'), [allEntitlementIds]);

  useEffect(() => {
    async function initialize() {
      setIsInitializing(true);
      setInitializeError(null);
      try {
        Purchases.setLogLevel(LOG_LEVEL.WARN);
        if (Platform.OS === 'ios') {
          Purchases.configure({ apiKey: 'appl_GUYEEZQfOpAHzaNTEHKrIuRLGuY'});
          
        }
        // else if (Platform.OS === 'android') {
        //   Purchases.configure({ apiKey: 'your_android_api_key' });
        // }
        await Promise.all([refreshOfferings(), refreshCustomerInfo(), syncPurchases()]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializeError(message);
      } finally {
        setIsInitializing(false);
      }
    }

    // Set up customer info update listener
    const customerInfoUpdateListener = (customerInfo: CustomerInfo) => {
      setCustomerInfo(customerInfo);
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(customerInfo);
      }
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    initialize();
  }, []);

  async function refreshOfferings() {
    try {
      const nextOfferings = await Purchases.getOfferings();
      setOfferings(nextOfferings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch offerings';
      setInitializeError(message);
    }
  }

  async function refreshCustomerInfo() {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer info';
      setInitializeError(message);
    }
  }

  async function syncPurchases() {
    setIsSyncing(true);
    try {
      // Sync purchases with RevenueCat servers
      await Purchases.syncPurchases();
      
      // Refresh customer info after sync to get the latest data
      await refreshCustomerInfo();
      
      // Also refresh offerings to ensure we have the latest data
      await refreshOfferings();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync purchases';
      console.warn('Purchase sync failed:', message);
      // Don't set this as an error since sync is not critical for app functionality
    } finally {
      setIsSyncing(false);
    }
  }

  async function purchasePackage(pkg: PurchasesPackage) {
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      return customerInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      setPurchaseError(message);
      return null;
    } finally {
      setIsPurchasing(false);
    }
  }

  async function restorePurchases() {
    try {
      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);
      return restoredInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed';
      setPurchaseError(message);
      return null;
    }
  }

  const value: PurchasesContextValue = {
    isInitializing,
    isPurchasing,
    isSyncing,
    initializeError,
    purchaseError,
    offerings,
    packages,
    defaultPackages,
    upgradePackages,
    customerInfo,
    hasActiveSubscription,
    activeEntitlementIds,
    allEntitlementIds,
    hasHdVideos,
    refreshOfferings,
    refreshCustomerInfo,
    syncPurchases,
    purchasePackage,
    restorePurchases,
  };

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within a PurchasesProvider');
  return ctx;
} 