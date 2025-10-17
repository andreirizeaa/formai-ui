import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { CustomPurchaseControllerProvider, SuperwallProvider as ExpoSuperwallProvider, SuperwallLoaded, useUser, SuperwallExpoModule } from 'expo-superwall';
import Purchases from 'react-native-purchases';
import { usePurchases } from './PurchasesContext';
import { showAlert } from '../services/alertService';

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
        showAlert(
          'Error', 
          'Unable to sync subscription status. Please check your connection.',
          undefined,
          'SUPERWALL_CONTEXT_SYNC_ERROR',
          error
        );
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
  const { purchasePackage, restorePurchases, packages, hasSubscription} = usePurchases();
  return (
    <CustomPurchaseControllerProvider
      controller={{
        onPurchase: async (params) => {
           try {
              const packageToPurchase = packages.find(pkg => pkg.product.identifier === params.productId);
              if (!packageToPurchase) {
                  return {type: "failed" as const, error: `Package not found for product: ${params.productId}`};
              }
              const result = await purchasePackage(packageToPurchase);
              if (result.type === "cancelled") {
                SuperwallExpoModule.didPurchase({
                  type: "cancelled",
                });
              }
              return result as {type: "purchased" | "cancelled" | "failed" | "pending", error?: string};
           } catch (error) {
             return {type: "failed" as const, error: error instanceof Error ? error.message : "Unknown error"};
           }
        },
        onPurchaseRestore: async () => {
          try {
            const restoredInfo = await restorePurchases();
            if (restoredInfo) {
              if (hasSubscription) {
                return {type: "restored"};
              }
              return {type: "failed", error: "No active subscription found to restore"};
            } else {
              return {type: "failed", error: "No purchases found to restore"};
            }
          } catch (error) {
            const restoreError = error as { message?: string };
            return {
              type: "failed",
              error: restoreError?.message ?? "Unknown restore error",
            };
          }
        },
      }}
    >
      <ExpoSuperwallProvider 
        apiKeys={{ 
          ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY, 
        }}
      >
        <SuperwallLoaded>
          <SubscriptionSync />
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