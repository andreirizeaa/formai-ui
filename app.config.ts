import { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

// Replace these with your EAS project ID and project slug.
// You can find them at https://expo.dev/accounts/[account]/projects/[project].
const EAS_PROJECT_ID = "cbbfb6a7-e285-419f-af75-79337f5c77f9";
const PROJECT_SLUG = "formai";
const OWNER = "andreirizea";

// App production config
const APP_NAME = "Form AI";
const BUNDLE_IDENTIFIER = "com.useformai.formai";
const PACKAGE_NAME = "com.useformai.formai";
const ICON = "./assets/formai-ios-icon.png";
const ADAPTIVE_ICON = "./assets/formai-ios-icon.png";
const SCHEME = "formai";

export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, bundleIdentifier, icon, adaptiveIcon, packageName, scheme } =
    getDynamicAppConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "development"
    );

  return {
    ...config,
    name: name,
    version, // Automatically bump your project version with `npm version patch`, `npm version minor` or `npm version major`.
    slug: PROJECT_SLUG, // Must be consistent across all environments.
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    icon: icon,
    scheme: scheme,
    backgroundColor: "#ffffff",
    splash: {
      image: "./assets/formai-splash.png",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      buildNumber: "1",
      infoPlist: {
        UIBackgroundModes: [
          "remote-notification",
          "fetch",
          "processing"
        ],
        CFBundleURLTypes: [
          {
            CFBundleURLName: "Google Sign-In",
            CFBundleURLSchemes: [
              "com.googleusercontent.apps.338047674329-5dfpj06alfpfn0phi57c4bgdg6nihv87"
            ]
          }
        ],
        NSCameraUsageDescription: "This app uses the camera to record workout videos for lift analysis and form feedback.",
        NSMicrophoneUsageDescription: "This app uses the microphone while recording workout videos.",
        NSPhotoLibraryUsageDescription: "This app saves workout videos to your photo library for easy access.",
        NSPhotoLibraryAddUsageDescription: "This app saves workout videos to your photo library for easy access.",
        NSUserTrackingUsageDescription: "We use this to ensure the app works for you and others that download it by reviewing usage logs.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: adaptiveIcon,
        backgroundColor: "#ffffff",
      },
      package: packageName,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.RECORD_AUDIO"
      ]
    },
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
    web: {
      proxy: "https://formai-service.onrender.com"
    },
    plugins: [
      "expo-mail-composer",
      "expo-video",
      "expo-apple-authentication",
      "expo-notifications",
      "expo-task-manager",
      "react-native-vision-camera",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/formai-splash.png",
          imageWidth: 200
        }
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow Form AI to access your photo library to save videos recorded in the app.",
          savePhotosPermission: "Allow Form AI to save videos recorded in the app to your photo library.",
          isAccessMediaLocationEnabled: true
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.338047674329-5dfpj06alfpfn0phi57c4bgdg6nihv87"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photo library to allow you to select videos to upload for analysis."
        }
      ],
      "react-native-compressor",
      "expo-background-task",
      [
        "expo-quick-actions",
        {
          iosActions: [
            {
              id: "deletion_feedback",
              title: "Deleting? Tell us why.",
              subtitle: "Send us feedback before you delete.",
              icon: "compose"
            }
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    owner: OWNER,
  };
};

// Dynamically configure the app based on the environment.
// Update these placeholders with your actual values.
export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: SCHEME,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: BUNDLE_IDENTIFIER, // Keep same bundle ID for RevenueCat compatibility
      packageName: PACKAGE_NAME, // Keep same package name for RevenueCat compatibility
      icon: "./assets/formai-ios-icon.png", // You can create separate preview icons
      adaptiveIcon: "./assets/formai-ios-icon.png", // You can create separate preview icons
      scheme: `${SCHEME}`,
    };
  }

  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: BUNDLE_IDENTIFIER, // Keep same bundle ID for RevenueCat compatibility
    packageName: PACKAGE_NAME, // Keep same package name for RevenueCat compatibility
    icon: "./assets/formai-ios-icon.png", // You can create separate dev icons
    adaptiveIcon: "./assets/formai-ios-icon.png", // You can create separate dev icons
    scheme: `${SCHEME}`,
  };
};
