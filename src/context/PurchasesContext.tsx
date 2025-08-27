import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { saveOnboardingProgress } from '../services/onboardingService';
import { CustomPurchaseControllerProvider, SuperwallProvider, SuperwallLoaded, SuperwallLoading } from 'expo-superwall';
import { useOnboarding } from './OnboardingContext';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { getUserId, removeUserId } from '../services/storageService';

interface PurchasesContextValue {
  isInitializing: boolean;
  isPurchasing: boolean;
  initializeError: string | null;
  purchaseError: string | null;

  offerings: PurchasesOfferings | null;
  packages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;

  hasActiveSubscription: boolean;
  activeEntitlementIds: string[];
  storePaymentInfo: (customerInfo: CustomerInfo) => Promise<void>;
  refreshOfferings: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
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
  const [initializeError, setInitializeError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const { onboardingData, updateOnboardingData } = useOnboarding();

  const packages = useMemo(() => {
    if (!offerings?.current) return [];
    return offerings.current.availablePackages;
  }, [offerings]);

  const activeEntitlementIds = useMemo(() => {
    if (!customerInfo) return [];
    return Object.keys(customerInfo.entitlements.active ?? {});
  }, [customerInfo]);

  const hasActiveSubscription = useMemo(() => activeEntitlementIds.length > 0, [activeEntitlementIds]);

  useEffect(() => {
    async function initialize() {
      setIsInitializing(true);
      setInitializeError(null);
      try {
        Purchases.setLogLevel(LOG_LEVEL.WARN);
        if (Platform.OS === 'ios') {
          Purchases.configure({ apiKey: 'appl_GUYEEZQfOpAHzaNTEHKrIuRLGuY' });
        }
        // else if (Platform.OS === 'android') {3
        //   Purchases.configure({ apiKey: 'your_android_api_key' });
        // }
        await Promise.all([refreshOfferings(), refreshCustomerInfo()]);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializeError(message);
      } finally {
        setIsInitializing(false);
      }
    }

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

  async function purchasePackage(pkg: PurchasesPackage) {
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      await storePaymentInfo(customerInfo);
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

  async function storePaymentInfo(customerInfo: CustomerInfo) {
    const activeSubscription = customerInfo.activeSubscriptions[0];
    const rcAppId = customerInfo.originalAppUserId;

    // Keep the context updates for state consistency
    updateOnboardingData('activeSubscription', activeSubscription);
    updateOnboardingData('revenueCatAppUserId', rcAppId);
    
    if (onboardingData.signInMethod !== null) {
      // Build the updated onboarding data with the new payment values
      const updatedData = {
        ...onboardingData,
        activeSubscription: activeSubscription,
        revenueCatAppUserId: rcAppId
      };

      try {
        await saveOnboardingProgress(updatedData);
      } catch (persistError) {
        console.log('Error persisting payment data:', persistError);
      }
    }
  }

  async function restorePurchases() {
    try {
      const restoredInfo = await Purchases.restorePurchases();
      
      // If there are active subscriptions, store the payment info
      if (restoredInfo.activeSubscriptions.length > 0) {
        await storePaymentInfo(restoredInfo);
      }
      
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
    initializeError,
    purchaseError,
    offerings,
    packages,
    customerInfo,
    hasActiveSubscription,
    activeEntitlementIds,
    storePaymentInfo,
    refreshOfferings,
    refreshCustomerInfo,
    purchasePackage,
    restorePurchases,
  };

  return (
    <CustomPurchaseControllerProvider
      controller={{
        onPurchase: async (params) => {
          try {
            // Get products from RevenueCat
            const products = await Purchases.getProducts([params.productId])
            const product = products[0]
            
            // Convert PurchasesStoreProduct to PurchasesPackage
            // We need to find the package that contains this product
            const packageWithProduct = packages.find(pkg => pkg.product.identifier === product.identifier)
            
            if (!packageWithProduct) {
              throw new Error(`No package found for product: ${product.identifier}`)
            }
            
            await purchasePackage(packageWithProduct)
          } catch (error) {
            console.log("Purchase failed:", error)
            throw error
          }
        },
        onPurchaseRestore: async () => {
          try {
            await restorePurchases()
          } catch (error) {
            throw error
          }
        },
      }}
    >
        <SuperwallProvider 
          apiKeys={{ 
            ios: "pk_zkKfyLcFhibPvjADIBNgv", 
          }}
        >
          <SuperwallLoading>
            <LoadingScreen onLoadComplete={() => {}} />
          </SuperwallLoading>
          <SuperwallLoaded>
            <PurchasesContext.Provider value={value}>
              {children}
            </PurchasesContext.Provider>
          </SuperwallLoaded>
        </SuperwallProvider>
    </CustomPurchaseControllerProvider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within a PurchasesProvider');
  return ctx;
} 