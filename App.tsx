import React, { useEffect } from 'react';
import { Asset } from 'expo-asset';
import { removeUserId } from './src/services/storageService';
import { Layout } from './layout';
import { PurchasesProvider } from './src/context/PurchasesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/context/LanguageContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import Purchases from 'react-native-purchases';
import { SuperwallProvider } from './src/context/SuperwallContext';

export default function App() {
  useEffect(() => {
    async function preloadAssets() {
      try {
        // Preload all assets using static require statements
        const assetsToLoad = [
          require('./assets/recording-tip.jpg'),
          require('./assets/refer-friends.jpg'),
          require('./assets/refer-friends-group.png'),
          require('./assets/formai-light-icon.png'),
          require('./assets/formai-dark-icon.png'),
          require('./assets/formai-ios-icon.png'),
          require('./assets/app-overview-photo.png'),
          require('./assets/feedback.png'),
          require('./assets/placeholder-thumbnail.png'),
          require('./assets/homescreen-refer-image.png'),
          require('./assets/favicon.png'),
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
          require('./assets/tutorial/formai-example-feedback.png'),
          require('./assets/tutorial/formai-example-pose.mp4'),
          require('./assets/tutorial/formai-example-video-thumbnail.jpg'),
          require('./assets/tutorial/formai-example-video.mp4'),
        ];
        
        await Asset.loadAsync(assetsToLoad);
      } catch (error) {
        console.warn('Error preloading assets:', error);
      } finally {
        // removeUserId();
      }
    }
    preloadAssets();
  }, []);

  return (
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
  );
}
