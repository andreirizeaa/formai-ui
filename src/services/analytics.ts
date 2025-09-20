import { Mixpanel } from 'mixpanel-react-native';

let mixpanel: Mixpanel | null = null;

export async function initAnalytics() {
  try {
    const projectToken = process.env.EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN!;
    
    if (!projectToken) {
      console.error('EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN not found in environment variables');
      return;
    }
    const trackAutomaticEvents = false;
    mixpanel = new Mixpanel(projectToken, trackAutomaticEvents);
    await mixpanel.init();
    mixpanel.setServerURL('https://api-eu.mixpanel.com');
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}

export function track(event: string, props: Record<string, any> = {}) {
  try {
    if (mixpanel) {
      console.log('Tracking event:', event, props);
      mixpanel.track(event, {
        ...props,
        platform: require('react-native').Platform.OS,
        timestamp: new Date().toISOString(),
      });
    }
    mixpanel?.flush();
  } catch (error) {
    console.error('Failed to track event:', event, error);
  }
}

export function identify(userId: string) {
  try {
    if (mixpanel) {
      mixpanel.identify(userId);
      mixpanel.alias(userId, userId); // Links anonymous history to this user
    }
  } catch (error) {
    console.error('Failed to identify user:', userId, error);
  }
}

export function setUserProperties(properties: Record<string, any>) {
  try {
    if (mixpanel) {
      mixpanel.getPeople().set(properties);
    }
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}

export function flush() {
  try {
    if (mixpanel) {
      mixpanel.flush();
    }
  } catch (error) {
    console.error('Failed to flush analytics:', error);
  }
}