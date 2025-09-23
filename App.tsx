import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import './app/notificationsBackground';
import { BACKGROUND_NOTIFICATION_TASK } from './app/notificationsBackground';
import { supabase } from './src/lib/supabase';
import { Asset } from 'expo-asset';
import { initBackgroundFetch } from './app/backgroundFetch';
import { Layout } from './layout';
import { PurchasesProvider } from './src/context/PurchasesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { SuperwallProvider } from './src/context/SuperwallContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initAnalytics } from './src/services/analytics';
import { handleLiftNotificationData } from './src/services/notificationNavigation';
import { removeUserId } from './src/services/storageService';

export default function App() {
  useEffect(() => {
    async function preloadAssets() {
      try {
        // Preload all assets using static require statements
        const assetsToLoad = [
          require('./assets/dumbel.svg'),
          require('./assets/formai-homescreen.mp4'),
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

    // Initialize background fetch
    void initBackgroundFetch();

    // Initialize analytics
    void initAnalytics();

    // Emit event when a push is received while app is foregrounded
    const recv = Notifications.addNotificationReceivedListener(async (notification) => {
      try {
        const data = notification.request.content.data as any;
        await handleLiftNotificationData(data);
      } catch (error) {
        console.warn('[App] Error handling foreground notification:', error);
      }
    });
    // Handle notification taps when app is in background/foreground
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const data = response.notification.request.content.data as any;
        // All notification types handled by centralized handler
        await handleLiftNotificationData(data);
      } catch (error) {
        console.warn('[App] Error handling notification response:', error);
      }
    });

    // Killed state handling is now done in NavigationContainer.onReady()

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
