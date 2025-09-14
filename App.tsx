import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import './app/notificationsBackground';
import { BACKGROUND_NOTIFICATION_TASK } from './app/notificationsBackground';
import { initBackgroundFetch } from './app/backgroundFetch';
import { supabase } from './src/lib/supabase';
import { Asset } from 'expo-asset';
import { Layout } from './layout';
import { PurchasesProvider } from './src/context/PurchasesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { SuperwallProvider } from './src/context/SuperwallContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { removeUserId } from './src/services/storageService';
import { eventBus, AppEvents } from './src/services/event-bus';

export default function App() {
  useEffect(() => {
    async function preloadAssets() {
      try {
        // Preload all assets using static require statements
        const assetsToLoad = [
          require('./assets/recording-tip.jpg'),
          require('./assets/refer-friends.jpg'),
          require('./assets/refer-friends-group.png'),
          require('./assets/formai-ios-icon.png'),
          require('./assets/app-overview-photo.png'),
          require('./assets/homescreen-refer-image.png'),
          require('./assets/icons/instagram.png'),
          require('./assets/icons/tiktok.png'),
          require('./assets/icons/fasebook.png'),
          require('./assets/icons/google.png'),
          require('./assets/icons/apple.png'),
          require('./assets/icons/fire.png'),
          require('./assets/icons/appstore.png'),
          require('./assets/icons/playstore.png'),
          require('./assets/icons/x.png'),
          require('./assets/animations/confetti.json'),
          require('./assets/animations/star-rating.json'),
          require('./assets/animations/bell.json'),
          require('./assets/animations/loading.json'),
          require('./assets/tutorial/formai-example-feedback.png'),
          require('./assets/tutorial/formai-example-pose.mp4'),
          require('./assets/tutorial/formai-example-video-thumbnail.jpg'),
          require('./assets/tutorial/formai-example-video.mp4'),
        ];
        
        await Asset.loadAsync(assetsToLoad);
      } catch (error) {
        console.warn('Error preloading assets:', error);
      }
    }
    preloadAssets();

    // Configure notifications handler (show foreground notifications)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Ensure background task is registered
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});

    // Initialize BackgroundFetch safety net
    void initBackgroundFetch();

    // Emit event when a push is received while app is foregrounded
    const recv = Notifications.addNotificationReceivedListener((notification) => {
      try {
        const data = notification.request.content.data as any;
        if (data?.type === 'lift_ready' && data?.liftId) {
          eventBus.emit(AppEvents.LiftReady, { liftId: String(data.liftId) });
        }
        if (data?.type === 'lift_failed') {
          eventBus.emit(AppEvents.LiftFailed, {
            error: typeof data?.error === 'string' ? data.error : undefined,
            liftId: typeof data?.liftId === 'string' ? data.liftId : undefined,
            assetId: typeof data?.assetId === 'string' ? data.assetId : undefined,
          });
        }
      } catch {}
    });
    // Handle notification taps when app is in background/foreground
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data as any;
        if (data?.type === 'lift_ready' && data?.liftId) {
          eventBus.emit(AppEvents.LiftReady, { liftId: String(data.liftId) });
          if ((global as any).openLiftById) (global as any).openLiftById(String(data.liftId));
        }
        if (data?.type === 'lift_failed') {
          eventBus.emit(AppEvents.LiftFailed, {
            error: typeof data?.error === 'string' ? data.error : undefined,
            liftId: typeof data?.liftId === 'string' ? data.liftId : undefined,
            assetId: typeof data?.assetId === 'string' ? data.assetId : undefined,
          });
        }
      } catch {}
    });

    // Handle taps that launched the app from a killed state
    (async () => {
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last) {
          const data = last.notification.request.content.data as any;
          if (data?.type === 'lift_ready' && data?.liftId) {
            const id = String(data.liftId);
            eventBus.emit(AppEvents.LiftReady, { liftId: id });
            if ((global as any).openLiftById) (global as any).openLiftById(id);
            else (global as any).pendingLiftId = id;
          }
          if (data?.type === 'lift_failed') {
            eventBus.emit(AppEvents.LiftFailed, {
              error: typeof data?.error === 'string' ? data.error : undefined,
              liftId: typeof data?.liftId === 'string' ? data.liftId : undefined,
              assetId: typeof data?.assetId === 'string' ? data.assetId : undefined,
            });
          }
        }
      } catch {}
    })();

    return () => {
      try { sub.remove(); } catch {}
      try { recv.remove(); } catch {}
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <PurchasesProvider>
            <SuperwallProvider>
              <LanguageProvider>
                <Layout />
              </LanguageProvider>
            </SuperwallProvider>
          </PurchasesProvider>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
