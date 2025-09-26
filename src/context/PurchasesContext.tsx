import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Platform, View, AppState, AppStateStatus } from 'react-native';
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

  hasSubscription: boolean;
  hasHdVideos: boolean;
  logIn: (appUserId: string) => Promise<CustomerInfo | null>;
  logOut: () => Promise<void>;
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

  // Check for any active subscription entitlements
  const hasSubscription = useMemo(() => {
    if (!customerInfo || !offerings) return false;

    const defaultOffering = offerings?.all?.default;

    if (defaultOffering) {
      // Collect all product identifiers (monthly, annual, etc.)
      const productIds = [];

      if (defaultOffering.monthly?.product?.identifier) {
        productIds.push(defaultOffering.monthly.product.identifier);
      }

      if (defaultOffering.annual?.product?.identifier) {
        productIds.push(defaultOffering.annual.product.identifier);
      }

      if (Array.isArray(defaultOffering.availablePackages)) {
        defaultOffering.availablePackages.forEach(pkg => {
          if (pkg.product?.identifier) {
            productIds.push(pkg.product.identifier);
          }
        });
      }

      // Create mapping from product ID to entitlement ID
      const productEntitlementMap: Record<string, string> = {};
      if (customerInfo.entitlements?.all) {
        Object.entries(customerInfo.entitlements.all).forEach(([entitlementId, entitlement]) => {
          if (entitlement.productIdentifier) {
            productEntitlementMap[entitlement.productIdentifier] = entitlementId;
          }
        });
      }

      // Get entitlement IDs for products in default offering
      const entitlementIds = productIds.map(productId => productEntitlementMap[productId]).filter(Boolean);

      // Check if any of these entitlement IDs are active
      const activeEntitlements = Object.keys(customerInfo.entitlements.active || {});
      return entitlementIds.some(entitlementId => activeEntitlements.includes(entitlementId));
    }

    return false;
  }, [customerInfo, offerings]);

  // Check specifically for HD videos entitlement
  const hasHdVideos = useMemo(() => {
    if (!customerInfo) return false;
    return 'hd_videos' in (customerInfo.entitlements.active || {});
  }, [customerInfo]);

  useEffect(() => {
    setIsInitializing(true);
    setInitializeError(null);

    const customerInfoUpdateListener = (customerInfo: CustomerInfo) => {
      setCustomerInfo(customerInfo);
      onSubscriptionUpdate?.(customerInfo);
      // Keep packages/offerings in sync with entitlement changes
      refreshOfferings().catch(() => {});
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    const init = async () => {
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
    };

    // Refresh when app returns to foreground (catch outside purchases)
    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        refreshCustomerInfo().catch(() => {});
        // Offerings rarely change, but cheap to refresh
        refreshOfferings().catch(() => {});
      }
    };
    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    init();

    return () => {
      // Note: RevenueCat listeners are automatically cleaned up when the app is destroyed
      // We only need to clean up the AppState listener
      appStateSub?.remove();
    };
  }, [onSubscriptionUpdate]);

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
      // Keep packages fresh post-purchase
      await refreshOfferings();
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
      // Keep packages fresh post-restore
      await refreshOfferings();
      return restoredInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed';
      setPurchaseError(message);
      return null;
    }
  }

  async function logIn(appUserId: string) {
    try {
      const { customerInfo: ci } = await Purchases.logIn(appUserId);
      // Critical for non-consumables on new accounts on the SAME device:
      const restored = await Purchases.restorePurchases();
      setCustomerInfo(restored ?? ci);
      return restored ?? ci;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setPurchaseError(message);
      return null;
    }
  }

  async function logOut() {
    try {
      await Purchases.logOut();
      await refreshCustomerInfo();
    } catch (error) {
      // Ignore logout errors
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
    hasSubscription,
    hasHdVideos,
    logIn,
    logOut,
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