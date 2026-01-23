// =============================================================================
// APP CONFIGURATION
// These values are transferred with the app sale (useformai.com domain included)
// Only update CANNY_FEATURE_REQUESTS_URL if using your own Canny board
// =============================================================================

// Legal URLs (useformai.com domain transferred with app)
export const LEGAL_URLS = {
  termsOfService: 'https://useformai.com/legal/tos',
  privacyPolicy: 'https://useformai.com/legal/privacy',
};

// Support email - Also set SUPPORT_EMAIL in Supabase secrets for edge functions
export const SUPPORT_EMAIL = 'support@useformai.com';

// App name (stays as Form AI - transferred with App Store listing)
export const APP_DISPLAY_NAME = 'Form AI';

// Canny Feature Request Board URL - Update if using your own Canny board
export const CANNY_FEATURE_REQUESTS_URL = process.env.EXPO_PUBLIC_CANNY_URL || 'https://form-ai.canny.io/feature-requests';
