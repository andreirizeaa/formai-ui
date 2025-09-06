import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { CustomPurchaseControllerProvider, SuperwallProvider as ExpoSuperwallProvider, SuperwallLoaded, useUser } from 'expo-superwall';
import Purchases from 'react-native-purchases';
import { usePurchases } from './PurchasesContext';

interface SuperwallContextValue {
  // Add any Superwall-specific state or methods here if needed
}

const SuperwallContext = createContext<SuperwallContextValue | undefined>(undefined);

function SubscriptionSync() {
  const { setSubscriptionStatus, subscriptionStatus } = useUser();
  const { isInitializing, customerInfo } = usePurchases();
  
  useEffect(() => {
    // Don't run until SDK is initialized
    if (isInitializing) return;
    
    Purchases.addCustomerInfoUpdateListener((customerInfo: any) => {
      const entitlementIds = Object.keys(customerInfo.entitlements.active);      
      setSubscriptionStatus({
        status: entitlementIds.length === 0 ? "INACTIVE" : "ACTIVE",
        entitlements: entitlementIds.map(id => ({ 
          id, 
          type: "SERVICE_LEVEL" 
        }))
      });
    });
    
    // Get initial customer info only after initialization
    const syncInitialStatus = async () => {
      try {
        // Use the customerInfo from context if available, otherwise fetch it
        let info = customerInfo;
        if (!info) {
          info = await Purchases.getCustomerInfo();
        }
        
        const entitlementIds = Object.keys(info.entitlements.active);
        
        setSubscriptionStatus({
          status: entitlementIds.length === 0 ? "INACTIVE" : "ACTIVE",
          entitlements: entitlementIds.map(id => ({ 
            id, 
            type: "SERVICE_LEVEL" 
          }))
        });
      } catch (error) {
        console.error("Failed to sync initial subscription status:", error);
      }
    };
    
    syncInitialStatus();
  }, [setSubscriptionStatus, isInitializing, customerInfo]);
  
  return null; // This component just handles the sync
}

interface SuperwallProviderProps {
  children: ReactNode;
}

export function SuperwallProvider({ children }: SuperwallProviderProps) {
  const { purchasePackage, restorePurchases, offerings } = usePurchases();
  
  return (
    <CustomPurchaseControllerProvider
      controller={{
        onPurchase: async (params) => {
            try {
              const packageToPurchase = offerings?.current?.availablePackages.find(
                pkg => pkg.product.identifier === params.productId
              );
              
              if (!packageToPurchase) {
                throw new Error(`Package not found for product: ${params.productId}`);
              }
              
              await purchasePackage(packageToPurchase);
              return;
            } catch (error) {
              throw error;
            }
        },
        onPurchaseRestore: async () => {
            await restorePurchases()
            return;
        },
      }}
    >
      <ExpoSuperwallProvider 
        apiKeys={{ 
          ios: "pk_zkKfyLcFhibPvjADIBNgv", 
        }}
      >
        <SubscriptionSync />
        <SuperwallLoaded>
          {children}
        </SuperwallLoaded>
      </ExpoSuperwallProvider>
    </CustomPurchaseControllerProvider>
  );
}

export function useSuperwall() {
  const ctx = useContext(SuperwallContext);
  if (!ctx) throw new Error('useSuperwall must be used within a SuperwallProvider');
  return ctx;
}

// Export the useUser hook from expo-superwall for convenience
export { useUser };
