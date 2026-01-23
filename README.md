# Form AI

AI-powered fitness form analysis mobile application built with React Native and Expo.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Initial Setup Checklist](#initial-setup-checklist)
- [Third-Party Integrations](#third-party-integrations)
- [Third-Party Integration Setup Guides](#third-party-integration-setup-guides)
- [Environment Variables Reference](#environment-variables-reference)
- [App Features](#app-features)
- [Supabase Edge Functions](#supabase-edge-functions)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [EAS (Expo Application Services)](#eas-expo-application-services)
- [iOS Development & Deployment](#ios-development--deployment)
- [Supabase Setup](#supabase-setup)
- [GitHub Actions (CI/CD)](#automated-production-migrations-github-actions)
- [Development Workflow](#development-workflow)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

---

## Overview

Form AI is a mobile fitness platform that uses AI-powered video analysis to help users improve their exercise form and prevent injuries. Users record or upload workout videos, and the app provides detailed frame-by-frame feedback with accuracy scoring.

**Current Version:** 1.0.4
**Bundle ID:** `com.useformai.formai`
**Platforms:** iOS (iPhone)

### Core Capabilities

- AI-powered form analysis with frame-by-frame feedback
- Video recording and upload with compression
- Performance tracking with accuracy trends and charts
- Daily check-ins and streak tracking
- Multi-language support (8 languages)
- Push notifications for analysis completion and engagement
- Subscription management with free/premium tiers
- Referral system with discount codes

---

## Tech Stack

### Core Frameworks

| Technology | Version |
|------------|---------|
| Expo SDK | 53.0.22 |
| React | 19.0.0 |
| React Native | 0.79.5 |
| TypeScript | ~5.8.3 |

### Platform Requirements

| Platform | Minimum Version |
|----------|-----------------|
| iOS | 16.0 |
| Android | SDK 26 (Android 8.0) |
| Node.js | v18+ recommended |

### Key Dependencies

| Category | Package | Version |
|----------|---------|---------|
| Navigation | @react-navigation/native | ^7.1.16 |
| State Management | @tanstack/react-query | ^5.85.3 |
| Backend | @supabase/supabase-js | ^2.39.0 |
| Animations | react-native-reanimated | ~3.17.4 |
| Camera | react-native-vision-camera | ^4.7.1 |
| Video | expo-video | ~2.2.2 |
| Compression | react-native-compressor | ^1.12.0 |
| Purchases | react-native-purchases | ^9.2.0 |
| Analytics | mixpanel-react-native | ^3.1.2 |
| Paywall | expo-superwall | ^0.3.2 |
| Auth (Google) | @react-native-google-signin/google-signin | ^10.1.1 |
| Auth (Apple) | expo-apple-authentication | ~7.2.4 |
| Notifications | expo-notifications | ~0.31.4 |
| i18n | i18n-js | ^4.5.1 |

### Build Tools

| Tool | Version |
|------|---------|
| EAS CLI | >= 14.4.1 |
| Biome (Linter/Formatter) | ^2.3.1 |
| Husky (Git Hooks) | ^9.1.7 |

---

## Initial Setup Checklist

Before running the app, you must configure the following. This checklist covers all files and values that need to be updated for your own deployment.

> **Note:** The app identity (bundle ID, app name, package name) and domain (useformai.com) are transferred with the sale. You only need to update account-specific values like API keys and your Expo account.

### 1. Update app.config.ts

Open `app.config.ts` and update your Expo account details:

```typescript
// Find these near the top of the file and replace with your values:
const EAS_PROJECT_ID = "your-eas-project-id";      // From expo.dev (create new project)
const OWNER = "your-expo-username";                // Your Expo account username

// These stay the same (transferred with App Store listing):
// const APP_NAME = "Form AI";
// const BUNDLE_IDENTIFIER = "com.useformai.formai";
// const PACKAGE_NAME = "com.useformai.formai";
```

### 2. src/constants/appConfig.ts (No changes needed)

All values are pre-configured and transferred with the sale:
- Legal URLs: `https://useformai.com/legal/...`
- Support email: `support@useformai.com`
- Canny board: `https://form-ai.canny.io/feature-requests`

Only update `CANNY_FEATURE_REQUESTS_URL` if you want to use your own Canny board.

### 3. Set Up EAS Environment Variables

Environment variables are stored securely in Expo Application Services (EAS), not in a local `.env` file. You'll set them in EAS and then pull them locally.

#### Step 1: Log in to EAS

```bash
eas login
```

#### Step 2: Access Environment Variables

Go to your project on [expo.dev](https://expo.dev):
1. Select your project
2. Go to **Project Settings** → **Environment variables**

Or use the CLI:
```bash
# List current variables
eas env:list

# Create environments if they don't exist
eas env:create --environment development
eas env:create --environment preview
eas env:create --environment production
```

#### Step 3: Add Required Variables

Add these variables for each environment (development, preview, production):

**Supabase:**
```
EXPO_PUBLIC_SUPABASE_URL = https://[your-project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
```

**API Backend:**
```
EXPO_PUBLIC_API_URL = https://formai-service.onrender.com
```

**Google Sign-In** (create OAuth credentials in your Google Cloud Console):
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID = [your-client-id].apps.googleusercontent.com
GOOGLE_URL_SCHEME = com.googleusercontent.apps.[your-client-id]
```

**Analytics:**
```
EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN = [your-mixpanel-token]
```

**Monetization:**
```
EXPO_PUBLIC_SUPERWALL_IOS_KEY = pk_[your-superwall-key]
EXPO_PUBLIC_REVENUECAT_IOS_KEY = appl_[your-revenuecat-key]
```

**Environment:**
```
APP_ENV = development  (or preview/production)
```

#### Step 4: Pull Variables Locally

After setting variables in EAS, pull them to create your local `.env` file:

```bash
npx eas env:pull
# Select "development" when prompted
```

This creates a `.env` file in your project root. The file is gitignored and should never be committed.

#### Step 5: Verify Setup

```bash
# Check that .env was created
cat .env

# Start the app
npm start
```

### 4. Set Supabase Edge Function Secrets

After linking your Supabase project, set these secrets:

```bash
npx supabase link --project-ref your-project-ref

npx supabase secrets set EXPO_ACCESS_TOKEN=your-expo-access-token
npx supabase secrets set RESEND_API_KEY=re_your-resend-key
npx supabase secrets set SUPERWALL_WEBHOOK_SECRET=your-webhook-secret
npx supabase secrets set SUPPORT_EMAIL=support@useformai.com
npx supabase secrets set APP_NAME="Form AI"
```

### 5. Verify EAS Environment Variables

After adding all variables in Step 3, verify they're set for each environment:

```bash
# List variables for each environment
eas env:list --environment development
eas env:list --environment preview
eas env:list --environment production
```

Make sure all required variables are set before building.

### 6. Configure GitHub Secrets (for CI/CD)

The repository uses GitHub Actions to automatically apply database migrations to production. Set up these secrets in your GitHub repository:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret | Value |
|--------|-------|
| `PROD_SUPABASE_ACCESS_TOKEN` | Generate at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `PROD_PROJECT_REF` | Your project ref from Supabase dashboard URL |

3. Create a GitHub environment named `prod`:
   - Go to **Settings** → **Environments** → **New environment**
   - Name: `prod`

See [Automated Production Migrations](#automated-production-migrations-github-actions) for more details.

### 7. Verify Third-Party Service Accounts

Ensure you have accounts and access to:

- [ ] **Expo** - [expo.dev](https://expo.dev) - Create project, get EAS project ID
- [ ] **Supabase** - [supabase.com](https://supabase.com) - Create project, run migrations
- [ ] **Google Cloud** - [console.cloud.google.com](https://console.cloud.google.com) - OAuth credentials
- [ ] **Apple Developer** - [developer.apple.com](https://developer.apple.com) - Sign in with Apple
- [ ] **RevenueCat** - [revenuecat.com](https://revenuecat.com) - In-app purchases
- [ ] **Superwall** - [superwall.com](https://superwall.com) - Paywalls
- [ ] **Mixpanel** - [mixpanel.com](https://mixpanel.com) - Analytics
- [ ] **Resend** - [resend.com](https://resend.com) - Emails (verify domain)
- [ ] **Canny** - [canny.io](https://canny.io) - Feature requests

### Quick Verification

After configuration, run these to verify setup:

```bash
# Install dependencies
npm install

# Start development server
npm start

# If you see errors about missing env variables, check your .env file
```

---

## Third-Party Integrations

### Quick Reference

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Supabase** | Database, Auth, Storage, Edge Functions | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **RevenueCat** | In-app purchases & subscriptions | [app.revenuecat.com](https://app.revenuecat.com) |
| **Superwall** | Paywall management & A/B testing | [superwall.com/dashboard](https://superwall.com/dashboard) |
| **Mixpanel** | Analytics & event tracking | [mixpanel.com](https://mixpanel.com) |
| **Google Cloud** | Google Sign-In OAuth | [console.cloud.google.com](https://console.cloud.google.com) |
| **Apple Developer** | Apple Sign-In, App Store | [developer.apple.com](https://developer.apple.com) |
| **Resend** | Transactional emails | [resend.com](https://resend.com) |
| **Canny** | Feature requests & feedback | [canny.io](https://canny.io) |
| **Expo/EAS** | Builds, OTA updates, push notifications | [expo.dev](https://expo.dev) |

---

### Backend & Database

#### Supabase
- **Purpose:** Backend-as-a-Service (PostgreSQL database, authentication, file storage, edge functions)
- **URL:** https://supabase.com
- **Docs:** https://supabase.com/docs
- **Used For:**
  - User authentication (Google, Apple Sign-In)
  - PostgreSQL database for lifts, users, check-ins
  - File storage for videos and thumbnails
  - Edge functions for webhooks and scheduled jobs
- **Config:** `src/lib/supabase.ts`

#### Custom AI Analysis API (Render)
- **Purpose:** AI-powered lift form analysis
- **URL:** Your API backend URL (set in `EXPO_PUBLIC_API_URL`)
- **Docs:** Internal API
- **Endpoints:**
  - `POST /lifts/analyse` - Submit lift for analysis
  - `GET /lifts/jobs/{jobId}` - Check job status
  - `DELETE /lifts/jobs/{jobId}` - Cancel job
- **Config:** `EXPO_PUBLIC_API_URL` environment variable

---

### Analytics

#### Mixpanel
- **Purpose:** User analytics, event tracking, conversion funnels
- **URL:** https://mixpanel.com
- **Docs:** https://developer.mixpanel.com/docs
- **Server:** EU endpoint (`https://api-eu.mixpanel.com`)
- **Events Tracked:** Paywall displays, purchases, sign-ins, lift submissions
- **Config:** `src/services/analytics.ts`
- **Env Variable:** `EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN`

---

### Monetization & Payments

#### RevenueCat
- **Purpose:** In-app purchase and subscription management
- **URL:** https://www.revenuecat.com
- **Docs:** https://docs.revenuecat.com
- **Used For:**
  - Subscription handling (trial, renewal, cancellation)
  - Entitlement management
  - Purchase restoration
  - Non-renewing purchases (HD videos)
- **Config:** `src/context/PurchasesContext.tsx`
- **Webhook:** `supabase/functions/revenuecat-webhook/`

#### Superwall
- **Purpose:** Paywall management and A/B testing
- **URL:** https://superwall.com
- **Docs:** https://docs.superwall.com
- **Used For:**
  - Dynamic paywall presentation
  - Placement-based triggers
  - Transaction tracking
  - Discount campaigns
- **Config:** `src/context/SuperwallContext.tsx`
- **Webhook:** `supabase/functions/superwall-webhook/`
- **Env Variable:** `EXPO_PUBLIC_SUPERWALL_IOS_KEY`

---

### Authentication

#### Google Sign-In
- **Purpose:** OAuth authentication via Google
- **URL:** https://developers.google.com/identity
- **Docs:** https://developers.google.com/identity/sign-in/ios
- **Package:** `@react-native-google-signin/google-signin`
- **Config:** `src/screens/auth/CreateAccountScreen.tsx`
- **Env Variables:** `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_URL_SCHEME`

#### Apple Sign-In
- **Purpose:** OAuth authentication via Apple (iOS only)
- **URL:** https://developer.apple.com/sign-in-with-apple/
- **Docs:** https://developer.apple.com/documentation/sign_in_with_apple
- **Package:** `expo-apple-authentication`
- **Config:** `src/screens/auth/CreateAccountScreen.tsx`

---

### Notifications

#### Expo Push Notifications
- **Purpose:** Push notification delivery
- **URL:** https://expo.dev
- **Docs:** https://docs.expo.dev/push-notifications/overview/
- **Endpoint:** `https://exp.host/--/api/v2/push/send`
- **Used For:**
  - Lift analysis completion alerts
  - Subscription event notifications
  - Daily engagement reminders
  - Streak maintenance alerts
- **Config:** `src/services/push.ts`
- **Env Variable:** `EXPO_ACCESS_TOKEN` (for edge functions)

---

### Email

#### Resend
- **Purpose:** Transactional email delivery for subscription notifications
- **URL:** https://resend.com
- **Docs:** https://resend.com/docs
- **From Address:** Configured via `SUPPORT_EMAIL` Supabase secret
- **Used For:**
  - Trial ending reminders (1 day before trial ends)
  - Subscription renewal confirmations
  - Cancellation acknowledgments
  - Initial purchase welcome emails
  - Non-renewing purchase confirmations (HD videos)
- **Config:** `supabase/functions/send-due-notifications/`
- **Webhook:** `supabase/functions/resend-webhook/` (handles email bounces)
- **Env Variables:**
  - `RESEND_API_KEY` - API key from Resend dashboard
  - `SUPPORT_EMAIL` - From/reply-to email address
  - `APP_NAME` - App name shown in emails

**Email Templates Included:**
| Event | Subject | Trigger |
|-------|---------|---------|
| Trial Reminder | "Your [App] free trial is ending tomorrow" | 1 day before trial ends |
| Renewal | "Thanks for renewing your subscription!" | Subscription renewed |
| Cancellation | "We are sad to see you leave!" | Subscription cancelled |
| Initial Purchase | "Welcome to [App]!" | First subscription |
| HD Videos Purchase | "HD videos are activated!" | Non-renewing purchase |

**Note:** The useformai.com domain is transferred with the sale. DNS records for email (SPF, DKIM) should already be configured. You'll need to add the domain to your own Resend account and verify it.

---

### Feature Requests

#### Canny
- **Purpose:** User feedback and feature request management
- **URL:** https://canny.io
- **Docs:** https://developers.canny.io/
- **Used For:**
  - Collecting user feature requests
  - Roadmap visibility
  - User voting on features
  - Changelog management
- **Config:** `src/constants/appConfig.ts` (`CANNY_FEATURE_REQUESTS_URL`)
- **Env Variable:** `EXPO_PUBLIC_CANNY_URL`

---

### Build & Deployment

#### Expo Application Services (EAS)
- **Purpose:** Cloud builds, OTA updates, app submission
- **URL:** https://expo.dev/eas
- **Docs:** https://docs.expo.dev/eas/
- **Project ID:** Configured in `app.config.ts` (`EAS_PROJECT_ID`)
- **Features:**
  - Development, preview, and production builds
  - Over-the-air updates
  - Environment variable management
  - App Store submission

---

### Supported Languages

| Language | Code |
|----------|------|
| English | en |
| Spanish | es |
| French | fr |
| German | de |
| Italian | it |
| Portuguese | pt |
| Romanian | ro |
| Arabic | ar |
| Chinese | zh |

---

## Third-Party Integration Setup Guides

This section provides step-by-step instructions for setting up each third-party service from scratch.

### Google Sign-In Setup

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "Form AI") and click **Create**
4. Select your new project from the dropdown

#### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type and click **Create**
3. Fill in required fields:
   - App name: `Form AI`
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Add scopes: `email`, `profile`, `openid`
6. Click **Save and Continue** through remaining steps

#### Step 3: Create OAuth Client ID (iOS)

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **iOS** as application type
4. Enter:
   - Name: `Form AI iOS`
   - Bundle ID: `com.useformai.formai`
5. Click **Create**
6. Copy the **Client ID** (format: `xxxx.apps.googleusercontent.com`)

#### Step 4: Configure Supabase for Google Auth

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google**
5. Enter:
   - **Client ID**: Your iOS Client ID from Step 3
   - **Client Secret**: Your Client Secret from Google Cloud
6. Set **Authorized Client IDs**: Add your iOS Client ID
7. Click **Save**

#### Step 5: Configure App Environment Variables

Add to your `.env` file:
```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_URL_SCHEME=com.googleusercontent.apps.your-client-id
```

The `GOOGLE_URL_SCHEME` is your Client ID reversed (e.g., if Client ID is `123456.apps.googleusercontent.com`, the scheme is `com.googleusercontent.apps.123456`).

#### Step 6: Verify Configuration

The app automatically configures the Google Sign-In plugin in `app.config.ts`. After setup:
1. Run `npx eas build --platform ios --profile development`
2. Test sign-in on a physical device or simulator

---

### Apple Sign-In Setup

#### Step 1: Enable Sign in with Apple in App Store Connect

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Select your App ID (`com.useformai.formai`)
4. Enable **Sign in with Apple** capability
5. Click **Save**

#### Step 2: Configure Supabase for Apple Auth

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **Providers**
3. Find **Apple** and click to expand
4. Toggle **Enable Sign in with Apple**
5. For native iOS apps, you typically don't need to configure additional secrets (the app handles it natively)
6. Click **Save**

#### Step 3: Verify Xcode Configuration

The `expo-apple-authentication` plugin automatically adds the capability. Verify in Xcode:
1. Open `ios/FormAI.xcworkspace`
2. Select target → **Signing & Capabilities**
3. Confirm **Sign in with Apple** is listed

No environment variables needed for Apple Sign-In (handled by the native SDK).

---

### Supabase Project Setup

#### Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter:
   - Organization: Select or create
   - Project name: Your project name (e.g., `myapp-production`)
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your users
4. Click **Create new project**
5. Wait for project to provision

#### Step 2: Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`
3. Add to `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

#### Step 3: Run Database Migrations

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

#### Step 4: Configure Storage

1. Go to **Storage** in Supabase Dashboard
2. Create bucket named `lifts`
3. Set bucket to **Private** (authenticated access only)
4. Configure RLS policies for user-specific access

#### Step 5: Deploy Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy

# Or deploy individually
npx supabase functions deploy push-notifications
npx supabase functions deploy revenuecat-webhook
npx supabase functions deploy superwall-webhook
npx supabase functions deploy send-due-notifications
npx supabase functions deploy check-daily-video-submissions
npx supabase functions deploy delete-auth-user
npx supabase functions deploy delete-user-storage
npx supabase functions deploy resend-webhook
```

#### Step 6: Set Edge Function Secrets

```bash
# Set required secrets
npx supabase secrets set EXPO_ACCESS_TOKEN=your-expo-token
npx supabase secrets set RESEND_API_KEY=re_xxxxx
npx supabase secrets set SUPERWALL_WEBHOOK_SECRET=your-secret
```

---

### RevenueCat Setup

#### Step 1: Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Sign up or log in
3. Create a new project: `Form AI`

#### Step 2: Configure iOS App

1. In RevenueCat, go to **Project Settings** → **Apps**
2. Click **+ New App** → Select **App Store**
3. Enter:
   - App name: `Form AI`
   - Bundle ID: `com.useformai.formai`
4. Add your App Store Connect credentials:
   - App-Specific Shared Secret (from App Store Connect → App → App Information)
   - App Store Connect API Key (recommended for server notifications)

#### Step 3: Create Products & Entitlements

1. **Products**: Go to **Products** → Add your App Store product IDs
2. **Entitlements**: Go to **Entitlements** → Create:
   - `premium` - For subscription access
   - `hd_videos` - For HD video purchases
3. **Offerings**: Go to **Offerings** → Create default offering with your packages

#### Step 4: Get API Keys

1. Go to **Project Settings** → **API Keys**
2. Copy the **Public iOS API Key**
3. The app uses this key in `src/context/PurchasesContext.tsx`

#### Step 5: Configure Webhook (for Supabase)

1. Go to **Project Settings** → **Integrations** → **Webhooks**
2. Add webhook:
   - URL: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization: Bearer token (set matching secret in Supabase)
3. Select events: All subscription events

#### Step 6: Test Integration

```bash
# In development, use sandbox testing
# Create a Sandbox Apple ID in App Store Connect
# Test purchases on a physical device
```

---

### Superwall Setup

#### Step 1: Create Superwall Account

1. Go to [Superwall Dashboard](https://superwall.com/dashboard)
2. Sign up or log in
3. Create a new app: `Form AI`

#### Step 2: Configure iOS App

1. In Superwall, go to **Settings** → **Apps**
2. Add iOS app with Bundle ID: `com.useformai.formai`
3. Copy the **iOS API Key**

#### Step 3: Set Environment Variable

Add to `.env`:
```bash
EXPO_PUBLIC_SUPERWALL_IOS_KEY=pk_xxxxxxxxxxxxx
```

#### Step 4: Create Paywalls

1. Go to **Paywalls** in Superwall Dashboard
2. Create paywalls using the visual editor
3. Configure product mappings to your RevenueCat products

#### Step 5: Configure Placements

1. Go to **Placements** in dashboard
2. Create placements used in the app:
   - `default_trigger` - Main paywall trigger
   - `transaction_abandons` - Shown after abandoned purchase
   - `discount_30` - 30% discount placement
   - `discount_40` - 40% discount placement

#### Step 6: Configure Webhook (for Supabase)

1. Go to **Settings** → **Webhooks**
2. Add webhook:
   - URL: `https://your-project.supabase.co/functions/v1/superwall-webhook`
   - Secret: Generate and save (set as `SUPERWALL_WEBHOOK_SECRET` in Supabase)
3. Select subscription events

---

### Mixpanel Setup

#### Step 1: Create Mixpanel Account

1. Go to [Mixpanel](https://mixpanel.com/)
2. Sign up or log in
3. Create a new project: `Form AI`

#### Step 2: Configure Project Settings

1. Go to **Project Settings**
2. Note: This app uses the **EU data residency** endpoint
3. Copy your **Project Token**

#### Step 3: Set Environment Variable

Add to `.env`:
```bash
EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN=your-project-token
```

#### Step 4: Verify Data Residency

The app is configured to use EU servers in `src/services/analytics.ts`:
```typescript
serverURL: 'https://api-eu.mixpanel.com'
```

If you need US servers, update this to `https://api.mixpanel.com`.

#### Step 5: Configure Events (Optional)

In Mixpanel Dashboard, you can:
1. Create custom events for tracking
2. Set up funnels for conversion analysis
3. Create cohorts for user segmentation

Events tracked by the app include:
- Paywall displays and conversions
- Sign-in methods
- Lift submissions
- Feature usage

---

### Resend Email Setup

> **Note:** The useformai.com domain is transferred with the sale. DNS records (SPF, DKIM) should already be configured on the domain.

#### Step 1: Create Resend Account

1. Go to [Resend](https://resend.com/)
2. Sign up or log in

#### Step 2: Add and Verify Domain

1. Go to **Domains** → **Add Domain**
2. Add: `useformai.com`
3. The DNS records should already exist from the previous setup
4. Click **Verify** - it should verify immediately if DNS is configured

#### Step 3: Create API Key

1. Go to **API Keys** → **Create API Key**
2. Name: `Form AI Production`
3. Permission: **Sending access**
4. Domain: Select `useformai.com`
5. Copy the API key (starts with `re_`)

#### Step 4: Set Supabase Secret

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Step 5: Configure Webhook for Bounces

1. Go to **Webhooks** in Resend Dashboard
2. Add webhook:
   - URL: `https://your-project.supabase.co/functions/v1/resend-webhook`
   - Events: `email.bounced`
3. The app marks emails as invalid on bounce to prevent future sends

#### Step 6: Set Email Configuration

```bash
npx supabase secrets set SUPPORT_EMAIL=support@useformai.com
npx supabase secrets set APP_NAME="Form AI"
```

---

### Expo Push Notifications Setup

#### Step 1: Create Expo Account

1. Go to [Expo](https://expo.dev/)
2. Sign up or log in
3. Create a new project or link to existing one (update `EAS_PROJECT_ID` in `app.config.ts`)

#### Step 2: Generate Access Token

1. Go to [Expo Access Tokens](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. Click **Create Token**
3. Name: `Form AI Push Notifications`
4. Type: **Robot** (for server-side use)
5. Copy the token

#### Step 3: Set Supabase Secret

```bash
npx supabase secrets set EXPO_ACCESS_TOKEN=your-expo-access-token
```

#### Step 4: Configure APNs (iOS)

1. In Apple Developer Portal, create an **APNs Key**:
   - Go to **Keys** → **Create a Key**
   - Enable **Apple Push Notifications service (APNs)**
   - Download the `.p8` file
2. In EAS:
   ```bash
   eas credentials
   # Select iOS → Push Notifications → Upload APNs Key
   ```

#### Step 5: Test Push Notifications

Push notifications only work on physical devices, not simulators.

```bash
# Build a development client
eas build --platform ios --profile development

# Install on device and test
```

---

### Canny Setup (Feature Requests)

#### Step 1: Create Canny Account

1. Go to [Canny](https://canny.io/)
2. Sign up for an account
3. Create a new company/workspace

#### Step 2: Create a Feature Requests Board

1. In Canny dashboard, go to **Boards**
2. Click **Create Board**
3. Name: `Feature Requests` (or your preference)
4. Configure board settings:
   - Public/Private visibility
   - Allow anonymous posts (optional)
   - Require email for posts

#### Step 3: Get Your Board URL

Your board URL format: `https://your-company.canny.io/feature-requests`

#### Step 4: Set Environment Variable

Add to your `.env` file:
```bash
EXPO_PUBLIC_CANNY_URL=https://your-company.canny.io/feature-requests
```

Or update the fallback in `src/constants/appConfig.ts`:
```typescript
export const CANNY_FEATURE_REQUESTS_URL = process.env.EXPO_PUBLIC_CANNY_URL || 'https://your-company.canny.io/feature-requests';
```

#### Step 5: Customize Canny (Optional)

1. **Branding**: Add your logo and colors in Settings → Branding
2. **Changelog**: Enable changelog to announce new features
3. **Roadmap**: Make your roadmap public for transparency
4. **SSO**: Set up single sign-on for seamless user authentication

---

### EAS Environment Variables Summary

See [Initial Setup Checklist → Step 3](#3-set-up-eas-environment-variables) for detailed setup instructions.

Required variables to set in EAS for each environment:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | AI analysis backend URL |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_URL_SCHEME` | Google URL scheme (reversed client ID) |
| `EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN` | Mixpanel project token |
| `EXPO_PUBLIC_SUPERWALL_IOS_KEY` | Superwall iOS API key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS API key |
| `APP_ENV` | `development`, `preview`, or `production` |

---

## Environment Variables Reference

Quick reference for all configurable values. See [Initial Setup Checklist](#initial-setup-checklist) for detailed setup instructions.

### App Configuration Files

| File | Variables to Update |
|------|---------------------|
| `app.config.ts` | `EAS_PROJECT_ID`, `OWNER` only (app identity stays the same) |
| `src/constants/appConfig.ts` | None required (all values transferred including Canny) |

### EAS Environment Variables

These are set in EAS and pulled locally via `eas env:pull`:

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | Yes | AI analysis backend URL |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_URL_SCHEME` | Yes | Google URL scheme (reversed client ID) |
| `EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN` | Yes | Mixpanel project token |
| `EXPO_PUBLIC_SUPERWALL_IOS_KEY` | Yes | Superwall iOS API key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | Yes | RevenueCat iOS API key |
| `APP_ENV` | Yes | `development`, `preview`, or `production` |

### Supabase Secrets

Set via `npx supabase secrets set`:

| Secret | Required | Value |
|--------|----------|-------|
| `EXPO_ACCESS_TOKEN` | Yes | Your Expo push notification access token |
| `RESEND_API_KEY` | Yes | Your Resend API key |
| `SUPERWALL_WEBHOOK_SECRET` | Yes | Your Superwall webhook secret |
| `SUPPORT_EMAIL` | Yes | `support@useformai.com` (domain transferred) |
| `APP_NAME` | Yes | `Form AI` |

---

## App Features

### User Flows

1. **Onboarding:** Welcome → Sign-in (Google/Apple/Email) → User details → Notifications → Payment
2. **Lift Submission:** Record/Upload → Movement selection → Weight/Reps → Upload → AI Analysis → Feedback
3. **Performance:** View accuracy trends, daily check-ins, streaks, year-wrapped stats
4. **Settings:** Personal details, units (metric/imperial), language, app icon, account management

### Key Screens

| Screen | Purpose |
|--------|---------|
| HomeScreen | Dashboard with today's lifts, calendar, streak tracking |
| PerformanceScreen | Analytics, accuracy charts, year-wrapped summaries |
| LibraryScreen | Search/filter all lifts by date, movement, favorites |
| LiftDetails | View lift with videos, accuracy score, frame feedback |
| FeedbackSlideshow | Interactive frame-by-frame form corrections |
| SettingsScreen | Personal details, preferences, account management |

---

## Supabase Edge Functions

The app uses Supabase Edge Functions (Deno serverless functions) for backend logic. Located in `supabase/functions/`.

### push-notifications

**Trigger:** Database webhook on `lifts`, `jobs`, `lift_failures` table changes
**Purpose:** Send real-time push notifications when lift analysis completes or fails

- Listens for new lift analysis results
- Extracts accuracy score and movement name
- Sends personalized push notification: "Your [exercise] analysis is ready! You achieved [score]%"
- Handles failure notifications with appropriate error messages

### check-daily-video-submissions

**Trigger:** Scheduled cron job (daily)
**Purpose:** Send engagement notifications to encourage daily usage

Notification types:
- **New User Reminder:** Users who haven't submitted any lifts yet
- **Streak Reminder:** Users with active streaks who haven't submitted today
- **Regular Reminder:** Returning users without active streaks

Includes random delay (3-31 minutes) to avoid notification thundering.

### send-due-notifications

**Trigger:** Called by other functions or scheduled
**Purpose:** Process notification queue and send via Expo Push + Resend Email

- Fetches pending notifications from `subscription_notifications_queue`
- Sends push notification via Expo Push API
- Sends corresponding email via Resend API
- Uses email templates based on notification type

### revenuecat-webhook

**Trigger:** HTTP webhook from RevenueCat
**Purpose:** Handle subscription lifecycle events

Events handled:
- `INITIAL_PURCHASE` - New subscription
- `RENEWAL` - Subscription renewed
- `CANCELLATION` - Subscription cancelled
- `TRIAL_STARTED` - Free trial began
- `TRIAL_CONVERTED` - Trial converted to paid
- `NON_RENEWING_PURCHASE` - One-time purchase (HD videos)

Queues notifications for processing by `send-due-notifications`.

### superwall-webhook

**Trigger:** HTTP webhook from Superwall
**Purpose:** Handle paywall-related subscription events

Similar to RevenueCat webhook, handles subscription state changes from Superwall's paywall system.

### resend-webhook

**Trigger:** HTTP webhook from Resend
**Purpose:** Handle email delivery events

- Listens for `email.bounced` events
- Marks user's email as invalid in database
- Prevents future email sends to bounced addresses

### delete-auth-user

**Trigger:** Called when user requests account deletion
**Purpose:** Delete user from Supabase Auth

- Removes authentication record
- Part of GDPR-compliant account deletion flow

### delete-user-storage

**Trigger:** Called during account deletion
**Purpose:** Clean up user's stored files

- Recursively deletes all files in user's storage directory
- Handles large file counts with chunked deletion (1000 files/batch)
- Removes videos, thumbnails, and other user uploads

### Deploying Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy push-notifications

# Set function secrets
npx supabase secrets set EXPO_ACCESS_TOKEN=xxx
npx supabase secrets set RESEND_API_KEY=xxx
npx supabase secrets set SUPPORT_EMAIL=support@yourdomain.com
npx supabase secrets set APP_NAME="Your App"

# View function logs
npx supabase functions logs push-notifications
```

---

## Project Structure

```
formai-ui/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # Business logic and API services
│   ├── context/        # React Context providers
│   ├── lib/            # Utilities and configurations
│   ├── constants/      # App constants
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
├── assets/             # Images, videos, icons
├── app/                # App configuration and background tasks
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── migrations/     # Database migrations
├── ios/                # iOS native code
├── android/            # Android native code
├── app.config.ts       # Expo configuration
├── eas.json            # EAS build configuration
└── package.json        # Dependencies and scripts
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Supabase CLI** (`npm install -g supabase`)
- **Xcode** (for iOS development - macOS only)
- **iOS Simulator** (via Xcode)
- **Git**

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd formai-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # Note: The project uses legacy peer deps
   ```

3. **Set up environment variables**
   ```bash
   # Pull environment variables from EAS
   npx eas env:pull
   # Select "development" environment when prompted
   ```

4. **Start local development**
   ```bash
   npm start
   ```

---

## Environment Variables

### Pulling Environment Variables from EAS

EAS stores environment variables securely. To pull them locally:

```bash
# Pull environment variables for the selected environment
npx eas env:pull

# You'll be prompted to select an environment:
# - development (for local development)
# - preview (for testing builds)
# - production (requires proper permissions)
```

This will create a `.env` file in your project root.

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | AI analysis backend URL |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_URL_SCHEME` | Google URL scheme for iOS |
| `EXPO_PUBLIC_MIXPANEL_PROJECT_TOKEN` | Mixpanel project token |
| `EXPO_PUBLIC_SUPERWALL_IOS_KEY` | Superwall iOS API key |
| `APP_ENV` | Environment (development/preview/production) |

### Edge Function Secrets

| Variable | Description |
|----------|-------------|
| `EXPO_ACCESS_TOKEN` | Expo push notification access token |
| `RESEND_API_KEY` | Resend email API key |
| `SUPERWALL_WEBHOOK_SECRET` | Superwall webhook authentication |

---

## EAS (Expo Application Services)

### EAS Setup

1. **Login to EAS**
   ```bash
   eas login
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

### Build Profiles

| Profile | Purpose |
|---------|---------|
| `development` | Development builds with dev client |
| `preview` | Internal testing builds |
| `production` | App Store release builds |

### EAS Build Commands

```bash
# iOS Development Build
eas build --platform ios --profile development

# iOS Preview Build
eas build --platform ios --profile preview

# iOS Production Build
eas build --platform ios --profile production

# List all builds
eas build:list
```

### OTA Updates

```bash
# Development channel
eas update --branch development --message "Update message"

# Preview channel
eas update --branch preview --message "Preview update"

# Production channel
eas update --branch production --message "Production update"
```

---

## iOS Development & Deployment

### Local Development

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on a specific simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

### Building for iOS

```bash
# Build with EAS (Recommended)
eas build --platform ios --profile development

# Local build (requires Xcode)
eas build --platform ios --profile development --local
```

### App Store Submission

```bash
# Submit latest production build
eas submit --platform ios --profile production

# Submit specific build
eas submit --platform ios --profile production --id [build-id]
```

---

## Supabase Setup

### Two Supabase Projects

1. **Production** - Live production database and services
2. **Local** - For local development and testing

### Local Supabase Development

```bash
# Start local Supabase
npx supabase start

# This starts:
# - Local Postgres database
# - Supabase Studio (http://localhost:54323)
# - API Gateway (http://localhost:54321)
# - Edge Functions
```

### Local Configuration

After starting Supabase locally, update your `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
```

### Edge Functions

```bash
# Serve all functions locally
npx supabase functions serve

# Serve specific function
npx supabase functions serve push-notifications
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations locally
npx supabase db reset

# Push to production (manual)
npx supabase db push
```

### Automated Production Migrations (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically applies database migrations to production when code is pushed to `main`.

**File:** `.github/workflows/db-migrations.yml`

**How it works:**
1. Triggered on push to `main` branch (or manual dispatch)
2. Sets up Supabase CLI
3. Authenticates with production Supabase
4. Links to the production project
5. Runs `supabase db push` to apply any new migrations

**Required GitHub Secrets:**

You must configure these secrets in your GitHub repository settings (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `PROD_SUPABASE_ACCESS_TOKEN` | Supabase access token (from supabase.com/dashboard/account/tokens) |
| `PROD_PROJECT_REF` | Your Supabase project reference ID |

**Setting up the secrets:**

1. Go to [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Generate a new access token
3. Copy your project ref from your Supabase project URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`
4. Add both as secrets in GitHub repository settings

**Workflow file:**

```yaml
name: DB Migrations (Prod only)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  migrate_prod:
    runs-on: ubuntu-latest
    environment: prod
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Login to Supabase
        run: supabase login --token "${{ secrets.PROD_SUPABASE_ACCESS_TOKEN }}"

      - name: Link to Prod
        run: supabase link --project-ref "${{ secrets.PROD_PROJECT_REF }}"

      - name: Apply migrations to PROD
        run: supabase db push
```

**Usage:**
- Migrations run automatically when you push to `main`
- You can also trigger manually from GitHub Actions tab → "DB Migrations" → "Run workflow"

---

## Development Workflow

### Daily Development

```bash
# Start Supabase locally
npx supabase start

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios
```

### Working on Edge Functions

```bash
# Start Supabase and functions
npx supabase start
npx supabase functions serve

# Functions hot-reload automatically
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Check for issues (without auto-fix)
npm run check:no-write
```

---

## Common Commands

### Development

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android
npm run web            # Run web version
```

### Code Quality

```bash
npm run format         # Format code with Biome
npm run lint           # Lint and auto-fix issues
npm run check          # Run all checks and auto-fix
npm run check:no-write # Run checks without auto-fix
```

### Supabase

```bash
npx supabase start                    # Start local Supabase
npx supabase stop                     # Stop local Supabase
npx supabase status                   # Check status
npx supabase functions serve          # Serve Edge Functions
npx supabase migration new <name>     # Create migration
npx supabase db reset                 # Reset local database
npx supabase db push                  # Push to production
```

### EAS

```bash
eas login                             # Login to EAS
eas env:pull                          # Pull environment variables
eas build:list                        # List all builds
eas build --platform ios              # Build for iOS
eas update --branch development       # Push OTA update
eas submit --platform ios             # Submit to App Store
```

---

## Troubleshooting

### Metro bundler cache issues

```bash
npm start -- --clear
```

### iOS build issues

```bash
cd ios && xcodebuild clean && cd ..
cd ios && pod install && cd ..
npm run ios
```

### Supabase connection issues

```bash
npx supabase stop
npx supabase start
npx supabase status
```

### Environment variables not loading

- Ensure `.env` file exists in project root
- Check variable names match exactly (case-sensitive)
- Restart Metro bundler after changing `.env`

### Legacy peer deps issues

```bash
npm install --legacy-peer-deps
```

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [RevenueCat Docs](https://docs.revenuecat.com)
- [Superwall Docs](https://docs.superwall.com)
- [Mixpanel Docs](https://developer.mixpanel.com/docs)
