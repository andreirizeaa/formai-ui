import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { getSelectedLanguage } from '../services/storageService';

const i18n = new I18n({
  en: {
    loading: 'Loading...',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    dontHaveAccount: 'Don\'t have an account?',
    startToday: 'Start today',
    alreadyHaveAccount: 'Already have an account?',
    perfectFormAlways: 'Perfect form, always!',
    getStartedButton: 'Get started!',
    signInButton: 'Sign in',
    next: 'Continue',
    back: 'Back',
    tabs: {
      home: 'Home',
      progress: 'Progress',
      settings: 'Settings',
    },
    settings: {
      personalDetails: 'Personal Details',
      language: 'Language',
      selectLanguage: 'Select language',
      units: 'Change Units',
      appTheme: 'App theme',
      whyLowQualityVideos: 'Why are my videos low quality?',
      referFriends: 'Refer Friends',
      growStrongerTogether: 'Grow stronger together!',
      currentBalance: 'Current Balance',
      shareNow: 'Share Now',
      sharePageTitle: 'Share FormAI',
      termsAndConditions: 'Terms of Use',
      privacyPolicy: 'Privacy Policy',
      supportEmail: 'Support Email',
      replayTutorial: 'Replay Tutorial',
      leaveRating: 'Leave a Rating',
      deleteAccount: 'Delete Account',
      logout: 'Logout',
      save: 'Save',
      deleteAccountTitle: 'Delete Account?',
      deleteAccountMessage: 'Are you sure you want to permanently delete your account? This action cannot be undone and all data will be deleted.',
      deleteAccountSubscriptionWarning: 'Deleting your Form AI account through the app does not cancel your subscription. Please remember to cancel your subscription separately in your device\'s subscription settings so you aren\'t charged again.',
      iAcknowledge: 'I acknowledge',
      deleteAccountButton: 'Delete account',
      logoutTitle: 'Logout?',
      logoutMessage: 'Are you sure you want to logout? You will need to sign in again to access your account.',
      no: 'No',
      yes: 'Yes',
      editFailed: {
        gender: 'Gender edit failed',
        height: 'Height edit failed',
        dateOfBirth: 'Birth date edit failed',
        currentWeight: 'Weight edit failed',
        unitSystem: 'Unit system update failed',
        language: 'Language update failed',
        message: 'Please try again later',
      },
    },
    share: {
      referYourFriends: 'Refer your friends',
      empowerYourFriends: 'Empower your friends',
      yourPersonalPromoCode: 'Your personal promo code',
      share: 'Share',
      howItWorks: 'How it works',
      step1: 'Share the code with friends',
      step2: 'Earn $5 per friend that signs up to an annual plan with your code',
      copied: 'Copied!',
      promoCodeCopied: 'Promo code copied to clipboard',
      error: 'Error',
      failedToCopy: 'Failed to copy promo code to clipboard',
      failedToShare: 'Failed to open share dialog',
      shareMessage: 'Hey! Download this app and use this promo code:',
      shareTitle: 'Download FormAI!',
    },
    personalDetails: {
      currentWeight: 'Current weight',
      weight: 'Weight',
      height: 'Height',
      dateOfBirth: 'Date of birth',
      gender: 'Gender',
      videoQuality: 'Video Quality',
      editCurrentWeight: 'Edit Current Weight',
      editHeight: 'Edit Height',
      editDateOfBirth: 'Edit Date of Birth',
      editGender: 'Edit Gender',
      male: 'Male',
      female: 'Female',
    },
    add: {
      uploadVideo: 'Upload Video',
      recordVideo: 'Record Video',
      uploadVideoDescription: 'Select a video from your gallery to analyze your form.',
      recordVideoDescription: 'Record a new video to analyze your exercise form.',
      whatExercise: 'What exercise were you doing?',
      back: 'Back',
      noVideoAvailable: 'No video available',
      selectNewVideo: 'New video',
      continue: 'Continue',
      generalTips: 'General tips',
      searchMovements: 'Search movements...',
      useCustomMovement: 'Use',
      bestRecordingPractices: 'Best recording practices',
      bodyParts: {
        all: 'All',
        chest: 'Chest',
        back: 'Back',
        shoulders: 'Shoulders',
        arms: 'Arms',
        legs: 'Legs',
      },
      movements: {
        'Flat Barbell Bench Press': 'Flat Barbell Bench Press',
        'Incline Barbell Bench Press': 'Incline Barbell Bench Press',
        'Decline Barbell Bench Press': 'Decline Barbell Bench Press',
        'Flat Dumbbell Chest Press': 'Flat Dumbbell Chest Press',
        'Incline Dumbbell Chest Press': 'Incline Dumbbell Chest Press',
        'Decline Dumbbell Chest Press': 'Decline Dumbbell Chest Press',
        'Dumbbell Chest Fly (Incline)': 'Dumbbell Chest Fly (Incline)',
        'Dumbbell Chest Fly (Flat)': 'Dumbbell Chest Fly (Flat)',
        'Dumbbell Chest Fly (Decline)': 'Dumbbell Chest Fly (Decline)',
        'Deadlift': 'Deadlift',
        'Barbell Row': 'Barbell Row',
        'Pendlay Row': 'Pendlay Row',
        'T-Bar Row': 'T-Bar Row',
        'Dumbbell Row': 'Dumbbell Row',
        'Single Arm Dumbbell Row': 'Single Arm Dumbbell Row',
        'Overhead Barbell Press': 'Overhead Barbell Press',
        'Seated Dumbbell Shoulder Press': 'Seated Dumbbell Shoulder Press',
        'Arnold Press': 'Arnold Press',
        'Lateral Raise (Dumbbell)': 'Lateral Raise (Dumbbell)',
        'Front Raise (Dumbbell)': 'Front Raise (Dumbbell)',
        'Upright Row': 'Upright Row',
        'Barbell Curl': 'Barbell Curl',
        'EZ-Bar Curl': 'EZ-Bar Curl',
        'Dumbbell Curl': 'Dumbbell Curl',
        'Hammer Curl': 'Hammer Curl',
        'Incline Dumbbell Curl': 'Incline Dumbbell Curl',
        'Cable Curl': 'Cable Curl',
        'Preacher Curl': 'Preacher Curl',
        'Skullcrusher (Barbell or EZ-Bar)': 'Skullcrusher (Barbell or EZ-Bar)',
        'Dumbbell Overhead Triceps Extension': 'Dumbbell Overhead Triceps Extension',
        'Barbell Back Squat': 'Barbell Back Squat',
        'Barbell Front Squat': 'Barbell Front Squat',
        'Goblet Squat': 'Goblet Squat',
        'Dumbbell Back Squat': 'Dumbbell Back Squat',
        'Romanian Deadlift (Barbell or Dumbbell)': 'Romanian Deadlift (Barbell or Dumbbell)',
        'Stiff-Leg Deadlift': 'Stiff-Leg Deadlift',
        'Good Morning': 'Good Morning',
        'Push Ups': 'Push Ups',
      },
      recordingTips: [
        'Ensure good lighting and a stable camera',
        'Try to record yourself from the side'
      ],
      countdown: {
        title: 'Countdown',
        off: 'Off',
        fiveSeconds: '5s',
        tenSeconds: '10s',
      },
    },
    welcome: {
      title: 'FormAI',
      subtitle: 'Perfect form, always',
      modal: {
        title: 'Welcome',
        message: 'Thank you for trusting Form AI. We\'re excited to help you achieve your goals.',
        ctaButton: 'Let\'s show you around',
      },
    },
    onboarding: {
      language: {
        title: 'Language',
        subtitle: 'You can always change this later',
        selectLanguage: 'Select a language',
      },
      units: {
        title: 'Units',
        subtitle: 'You can always change this later',
        metric: 'Metric',
        imperial: 'Imperial',
        metricDescription: 'Kilograms and centimeters',
        imperialDescription: 'Pounds, feet, inches',
      },
      gender: {
        title: 'Biological gender',
        subtitle: 'This will be used to help our systems find the optimum biomechanic form for you',
        male: 'Male',
        female: 'Female',
        other: 'Other',
      },
      goal: {
        title: 'What is your goal?',
        subtitle: 'This helps us generate a plan for your calorie intake.',
        loseWeight: 'Lose weight',
        maintain: 'Maintain',
        gainWeight: 'Gain weight',
      },
      workouts: {
        title: 'How many workouts do you do each week?',
        subtitle: 'Your training frequency shapes your progress.',
        zeroToTwo: '0–2',
        zeroToTwoDescription: 'Workouts here and there',
        threeToFive: '3–5',
        threeToFiveDescription: 'A few times a week',
        SixPlus: '6+',
        SixPlusDescription: 'Disciplined athlete',
      },
      discovery: {
        title: 'Where did you hear about us?',
        subtitle: 'Help us understand how you found FormAI',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        google: 'Google',
        appStore: 'App Store',
        playStore: 'Play Store',
        twitter: 'X (Twitter)',
        youtube: 'YouTube',
        friends: 'Friends & Family',
        other: 'Other',
      },
      personalTrainer: {
        title: 'Do you have a personal trainer?',
        subtitle: 'This helps us customize your experience',
        yes: 'Yes',
        no: 'No',
      },
      trainingReason: {
        title: 'What\'s the #1 reason you train?',
        subtitle: 'We\'ll tailor your form analysis to your goal.',
        buildStrength: 'Build strength',
        improvePhysique: 'Improve physique',
        preventInjury: 'Prevent injury',
        trainForSport: 'Train for a sport',
        stayActiveHealthy: 'Stay active & healthy',
      },
      gymChallenge: {
        title: 'What\'s your biggest challenge in the gym?',
        subtitle: 'Let\'s focus on what matters most to you.',
        unsureForm: 'Not sure if my form is correct',
        noResults: 'Not seeing results',
        worriedInjury: 'Worried about injury',
        strugglingMotivation: 'Struggling with motivation',
        other: 'Other',
      },
      lifterType: {
        title: 'How do you see yourself as a lifter?',
        subtitle: 'Your experience level shapes our guidance.',
        beginner: 'Beginner, learning the basics',
        intermediate: 'Intermediate, refining technique',
        advanced: 'Advanced, chasing elite performance',
        returningAfterBreak: 'Returning after a break',
        injuryRehab: 'Injury rehab',
      },
      perfectFormGoal: {
        title: 'If your form was always perfect, what would you achieve faster?',
        subtitle: 'Visualize your progress without setbacks.',
        liftHeavierSafely: 'Lift heavier safely',
        buildMuscleEfficiently: 'Build muscle efficiently',
        avoidInjuries: 'Avoid injuries',
        boostConfidence: 'Boost confidence',
        trainLongerWithoutSetbacks: 'Train longer without setbacks',
      },
      formConfidence: {
        title: 'How confident are you in your form right now?',
        subtitle: 'Be honest, we\'ll help you hit 100%.',
        zeroToTwentyFive: '0% - 25%',
        twentyFiveToFifty: '25% - 50%',
        fiftyToSeventyFive: '50% - 75%',
        seventyFiveToHundred: '75% - 100%',
      },
      threeMonthGoal: {
        title: 'In 3 months, where do you want to be?',
        subtitle: 'Your journey starts with today\'s form check.',
        liftingHeavier: 'Lifting heavier',
        lookingLeaner: 'Looking leaner',
        feelingStrongerInjuryFree: 'Feeling stronger & injury-free',
        moreConsistent: 'More consistent',
        moreConfident: 'More confident',
      },
      measurements: {
        title: 'Height & Weight',
        subtitle: 'This helps us provide personalized recommendations',
        height: 'Height',
        weight: 'Weight',
        metric: 'Metric',
        imperial: 'Imperial',
        cm: 'cm',
        ft: 'ft',
        in: 'in',
        kg: 'kg',
        lbs: 'lbs',
      },
      birthDate: {
        title: 'When were you born?',
        subtitle: 'This helps us provide age-appropriate recommendations',
        month: 'Month',
        day: 'Day',
        year: 'Year',
      },
      rating: {
        title: 'Give us a rating',
        subtitle: 'Help us improve by sharing your experience',
        skip: 'Skip',
        middleText: 'FormAI was made for gym lovers like you!',
      },
      referralCode: {
        title: 'Enter referral code (Optional)',
        subtitle: 'You can skip this step.',
        placeholder: 'Referral Code',
        skip: 'Skip',
        submit: 'Submit',
        success: 'Referral code has been successfully applied',
        error: 'Invalid referral code. Please try again.',
      },
      allDone: {
        title: 'All done!',
        allDone: 'All done!',
        thankYou: 'Thank you for trusting us',
        privacy: 'We promise to always keep your personal information private and secure.',
      },
      trainSafer: {
        title: 'Train with three times less of a chance of injury with Form AI vs on your own',
        withoutFormAI: 'Without Form AI',
        withFormAI: 'With Form AI',
        description: 'FormAI makes it easy to perfect your form and keep you accountable.',
      },
      notificationPermission: {
        title: 'Reach your goals with notifications',
        dialogText: 'FormAI would like to send you Notifications',
        allow: 'Allow',
        dontAllow: "Don't Allow",
      },
      setupLoading: {
        title: '',
        mainTitle: "We're setting everything up for you",
        step1: 'Setting up your profile...',
        step2: 'Almost ready...',
      },
      freeTrial: {
        title: 'We want you to try FormAI for free.',
        noPaymentDue: 'No Payment Due Now',
        tryForFree: 'Try for $0.00',
        pricing: 'Just $39.99 a year ($3.33/mo)',
      },
      notificationReminder: {
        title: "We'll send you\na reminder before your\nfree trial ends",
        noPaymentDue: 'No Payment Due Now',
        continueForFree: 'Continue for FREE',
        pricing: 'Just $39.99 a year ($3.33/mo)',
      },
      subscriptionSelection: {
        title: 'Start your 3-day FREE trial to continue.',
        titleMonthly: 'Unlock FormAI to reach your goals faster',
        today: 'Today',
        todayDescription: 'Unlock all the app\'s features like AI form analysis and more.',
        reminder: 'In 2 Days - Reminder',
        reminderDescription: 'We\'ll send you a reminder that your trial is ending soon.',
        billing: 'In 3 Days - Billing Starts',
        billingDescription: 'You\'ll be charged on {{billingDate}} unless you cancel anytime before.',
        monthly: 'Monthly',
        monthlyPrice: '$9.99/mo',
        yearly: 'Yearly',
        yearlyPrice: '$3.33/mo',
        freeTag: '3 DAYS FREE',
        noPaymentDue: 'No Payment Due Now',
        cancelAnytime: 'Cancel Anytime - No Commitment',
        startTrial: 'Start My 3-Day Free Trial',
        startToday: 'Start Today',
        yearlyPricing: '3 days free, then $39.99 per year ($3.33/mo)',
        monthlyPricing: 'Just $9.99/mo ($120/year)',
        monthlyFeature1: 'Simple form analysis',
        monthlyFeature1Description: 'Analyse your form for any movement with just a video',
        monthlyFeature2: 'Achieve your gym goals',
        monthlyFeature2Description: 'Getting in shape has never been easier',
        monthlyFeature3: 'Track your progress',
        monthlyFeature3Description: 'Stay on the right tracks with analytics and reminders',
      },
      createAccount: {
        title: 'Create an account',
        signInWithApple: 'Sign in with Apple',
        signInWithGoogle: 'Sign in with Google',
      },
      cameraPermission: {
        title: 'Allow camera access',
        subtitle: 'Camera access is required for FormAI.',
        dialogText: 'FormAI would like to access your Camera.',
        allow: 'Allow',
        dontAllow: "Don't Allow",
      },
      // New translations for hardcoded text
      perfectFormGoalMessage: {
        highlighted: {
          liftHeavierSafely: 'Lifting heavier safely',
          buildMuscleEfficiently: 'Building muscle',
          avoidInjuries: 'Avoiding injuries',
          boostConfidence: 'Your confidence will sky rocket',
          trainLongerWithoutSetbacks: 'Training without setbacks',
          default: 'Your goals',
        },
        rest: ' is a guaranteed target. It\'s not hard at all!',
        restRealistic: ' is a realistic target. It\'s not hard at all!',
        restFantastic: ' is a fantastic target. It\'s not hard at all!',
        restAfter: ' after. It\'s not hard at all!',
        restNormal: ' will be normal. It\'s not hard at all!',
        restAchievable: ' are achievable with Form AI. It\'s not hard at all!',
        subtitle: '95% of users say that change is clear after using Form AI.',
      },
      potentialGraph: {
        title: 'You have amazing potential to crush your goal',
        chartTitle: 'Your accuracy transition',
        subtitle: 'Based on Form AI\'s historical data, accuracy improvement is delayed at first, but after 14 days, you will become crazy consistent!',
      },
      costComparison: {
        title: 'Perfect form at a fraction of the cost using Form AI vs trainers',
        personalTrainer: 'Personal trainer',
        withFormAI: 'With Form AI',
        costLess: '99% Less',
        description: 'Having safe and perfect form in the gym shouldn\'t cost an arm and a leg.',
      },
      gymChallengeInfo: {
        noResults: {
          headline: 'Results take time, but you\'re closer than you think.',
          message: 'We\'ll guide you with the right feedback so your hard work pays off.',
          howWeGetYouThere: [
            'Form analysis to ensure every rep counts',
            'Video feedback to spot what\'s holding you back',
            'Accuracy tracking to measure real progress over time'
          ]
        },
        unsureForm: {
          headline: 'Form comes first.',
          message: 'We\'ll give you clear feedback so you can train safely and effectively, every time.',
          howWeGetYouThere: [
            'Instant form breakdown from your workout videos',
            'Actionable tips to fix mistakes quickly',
            'Accuracy scoring to track your improvement'
          ]
        },
        worriedInjury: {
          headline: 'Train safe. Train strong.',
          message: 'We\'ll help you lift with confidence by catching risky movements before they become injuries.',
          howWeGetYouThere: [
            'Video feedback to highlight unsafe positions',
            'Safer technique recommendations tailored to you',
            'Accuracy tracking to ensure long-term consistency'
          ]
        },
        strugglingMotivation: {
          headline: 'Motivation is easier when you don\'t do it alone.',
          message: 'We\'ll keep you engaged by showing your progress and celebrating every improvement in your form.',
          howWeGetYouThere: [
            'Easy-to-read accuracy scores after every workout',
            'Visible improvements with tracked progress trends',
            'Encouraging tips that help you stay consistent'
          ]
        },
        other: {
          headline: 'We\'re here for your journey.',
          message: 'Whatever your challenge is, we\'ll give you the guidance and support to overcome it.',
          howWeGetYouThere: [
            'Personalized feedback on your movement videos',
            'Accuracy tracking across different exercise types',
            'Continuous tips and insights to support your goals'
          ]
        },
        howWeGetYouThereTitle: 'Here\'s how we\'re going to get you there'
      },
      saveProgress: {
        title: 'Create an account',
      },

    },
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
      // Array format for easy access
      array: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const,
    },
    progress: {
      title: 'Your journey starts here',
      subtitle: 'See how users improve their form and performance with FormAI',
      chartTitle: 'Form Score Improvement Over Time',
      week: 'Week',
      score: 'Form Score',
      formImprovement: 'Form Improvement',
      weeksToExcellence: 'Weeks to Excellence',
    },
    liftingGoal: {
      title: 'What is your goal?',
      subtitle: 'This will be used to tailor our AI to understand your lifting style.',
      muscleBuilding: 'Muscle building',
      powerlifting: 'Powerlifting',
      toning: 'Toning',
      strength: 'Strength',
      weightLoss: 'Weight loss',
    },
    formBarrier: {
      title: 'What\'s stopping you from perfecting your exercise form?',
      subtitle: 'Help us understand your challenges',
      expensiveTrainers: 'Personal trainers are too expensive',
      gymAdviceScary: 'Asking for advice scares me',
      noTime: 'I don\'t have time to perfect my form',
      other: 'Other',
    },
    home: {
      addTestLift: 'Add Test Lift',
      dailyAccuracyLevel: 'Daily accuracy level',
      noLiftsToday: 'No lifts today',
      allTimeAccuracy: 'All time accuracy',
      earnByReferring: 'Earn by Referring!',
      yourVideoLibrary: 'Your video library',
      lifts: 'Recent lifts',
      seeAll: 'See all',
      noRecordedLifts: 'No recorded lifts for this date',
      startAnalyzingWorkout: 'Start analysing your workout by taking a quick video',
      dayStreak: '{{count}} Day streak',
      onFireMessage: 'You\'re on fire! Keep up the great work with your daily streaks.',
      zeroDayStreak: '0 day streak',
      noStreakMessage: 'No streak yet. Record on consecutive days to start your streak.',
      continue: 'Continue',
    },
    performance: {
      title: 'Progress',
      editDateRange: 'Edit date range',
      from: 'From',
      to: 'To',
      reset: 'Reset',
      accuracy: 'Accuracy',
      trend: 'Trend',
      apply: 'Apply',
      filterLifts: 'Filter lifts',
      timeRanges: {
        ninetyDays: '90 Days',
        sixMonths: '6 Months',
        oneYear: '1 Year',
        allTime: 'All time',
      },
      chartTitles: {
        accuracyPerWeight: 'Accuracy per weight',
        accuracyOverTime: 'Accuracy over time',
        loading: 'Loading...',
        noDataAvailable: 'No data available',
      },
      info: {
        accuracyPerWeight: {
          title: 'Accuracy per weight',
          message: 'Shows average form accuracy for each weight you lifted for a given movement. Higher weights may challenge form. Calculated by averaging accuracy scores for all lifts at each weight.'
        },
        accuracyOverTime: {
          title: 'Accuracy over time',
          message: 'Shows how your form accuracy changes over time for a movement. Calculated by averaging accuracy for each day and plotting across dates.'
        },
        accuracy: {
          title: 'Accuracy',
          message: 'Your average form accuracy across the selected date range and filters. Calculated as the mean of accuracy scores for all lifts.'
        },
        improvement: {
          title: 'Improvement',
          message: 'How your form changed over the selected range. We compare the first third of your lifts to the last third and show the difference in average accuracy.'
        }
      },
      metricsFeedback: {
        title: 'Want other metrics? Let us know!',
        subtitle: 'Help us improve your experience',
      }
    },
    library: {
      title: 'Library',
      editDateRange: 'Edit date range',
      from: 'From',
      to: 'To',
      reset: 'Reset',
      apply: 'Apply',
      all: 'All',
      favourites: 'Favourites',
      noLiftsAnalysed: 'No lifts analysed',
      noFavouriteLifts: 'No favourite lifts',
      noLiftsFound: 'No lifts found',
      startAnalysingWorkout: 'Start analysing today\'s workout by taking a quick video',
      markLiftsAsFavourites: 'Mark lifts as favourites to see them here',
      tryAdjustingFilters: 'Try adjusting your filters',
      lifts: 'lifts',
      lift: 'lift',
      noLifts: '0',
      selectDateRange: 'Select date range',
      allLifts: 'All lifts',
      oneLift: '1',
      search: 'Search',
      liftsCount: '{{count}} Lifts',
      filterByMovement: 'Filter by movement',
      searchMovements: 'Search movements...',
      allMovements: 'All Movements',
      searchAnalysis: {
        analysisFound: 'Analysis Found',
        analysisFoundNotFavourited: 'An analysis has been found but it wasn\'t favourited.',
        continueToLift: 'Continue to Lift',
        noAnalysisFound: 'No Analysis Found',
        noAnalysisFoundMessage: 'No analysis found for this video. Please make sure the video has been analyzed before.',
        analyse: 'Analyse',
        permissionRequired: 'Permission Required',
        permissionMessage: 'Please allow access to your photo library to search for videos.',
        error: 'Error',
        errorMessage: 'Failed to select video. Please try again.',
      },
    },
    liftCard: {
      accuracy: 'Accuracy',
    },
    loadingLift: {
      uploadingVideo: 'Uploading video...',
      checkingVideo: 'Checking video...',
      estimatingPose: 'Estimating pose...',
      analyzingVideo: 'Analyzing video...',
      analyzingForm: 'Analyzing form...',
      analysisFailed: 'Analysis failed',
      processing: 'Processing...',
      errorOccurred: 'An error occurred',
      pleaseTryAgain: 'Please try again',
      tapToRetry: 'Tap to retry',
      notifyWhenDone: 'We\'ll notify you when done!',
      noLiftFound: {
        title: 'No lift found',
        subtitle: 'We cannot detect a lift',
      },
      liftMismatch: {
        title: 'Lift mismatch',
        subtitle: 'The selected movement does not match the video',
        detectedMovement: 'We cannot detect you performing: {{movement}}',
      },
    },
    feedback: {
      liftDetails: 'Lift Details',
      rangeOfMotionAcrossReps: 'Range of motion across your reps',
      benchPress: 'Bench Press',
      formAccuracyAcrossReps: 'Form accuracy across your reps',
      weight: 'Weight',
      reps: 'Reps',
      reviewFeedback: 'Review Feedback',
      favourite: 'Favourite',
      manualDeleteLiftCardData: 'Delete Lift',
      deleteLiftTitle: 'Delete Lift',
      deleteLiftMessage: 'Are you sure you want to delete this lift? This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
      howItWorks: 'How it works',
      viewFeedback: 'View Feedback',
      step1: 'Our AI notices specific moments during your lift where your form can be improved.',
      step2: 'It will then explain what was not optimal.',
      step3: 'Tips on how to stay safe and improve will then be given!',
      step4: 'Then, it is up to you to improve on your form and then review in a week.',
      // Additional translations for liftDetails.tsx
      accuracy: 'Accuracy',
      accuracyScore: 'Accuracy score',
      improvements: 'improvements',
      noVideoAvailable: 'No video available',
      deleteLiftConfirmation: 'Are you sure you want to delete this lift? This action cannot be undone.',
      lbs: 'lbs',
      kg: 'kg',
      updateFailed: {
        weight: 'Weight update failed',
        message: 'Please try again later',
      },
    },
    common: {
      accuracy: 'Accuracy',
      averageAccuracy: 'Average accuracy',
      averageFormImprovement: 'Average form improvement',
      noData: 'No data',
      selectDateRange: 'Select date range',
      allLifts: 'All lifts',
      oneLift: '1 Lift',
      lifts: 'Lifts',
      noLiftsFound: 'No lifts found',
    },
    tutorial: {
      buttons: {
        previous: 'Previous',
        next: 'Continue',
        complete: 'Complete',
        skipGuide: 'Skip tutorial',
        close: 'Close',
      },
      addButton: {
        title: 'Add a lift',
        description: 'Use the add button to start a new lift analysis.',
      },
      addOptionsUpload: {
        title: 'Upload & Record a video',
        description: 'Here you can upload a video or record a new one via the app which will also save to your photo library. \n\nFor this walkthrough we will upload a demo video.',
      },
      uploadPracticesCta: {
        title: 'Tips & upload',
        description: 'Here, you can find some general guidance on video quality and how to get the best results. \n\nThe next step would open up your photo library but for the demo, we will skip this step.',
      },
      videoPreviewContinue: {
        title: 'Video preview',
        description: 'If the video looks good, continue to select the lift type.',
      },
      movementSelectionContinue: {
        title: 'Choose a lift type',
        description: 'Please select an accurate lift type which will help us analyze your form. \n\nIf you cannot find a lift, please email our support team and we will look to integrate it.',
      },
      weightRepsComplete: {
        title: 'Weight & reps',
        description: 'This will be used to track your progress and see how you are improving over time.',
      },
      homeFirstLiftCard: {
        title: 'Click into this to find your analysis',
        description: 'Your lift appears here with the your analysis. Tap on it to see detailed feedback and insights or swipe to delete.',
      },
      liftDetailsFormGraph: {
        title: 'Form accuracy across your reps',
        description: 'This chart shows how your form accuracy varies across each rep of the lift.',
      },
      liftDetailsDepthGraph: {
        title: 'Range of motion across your reps',
        description: 'This bar chart shows the depth of your lift across your reps.',
      },
      liftDetailsReviewFeedback: {
        title: 'Review your feedback',
        description: 'Tap the Review Feedback button to see detailed analysis and tips for improving your form.',
      },
      howItWorksModal: {
        title: 'How it works',
        description: 'This shows how our AI analysis works and how it can help you improve your form.',
      },
      feedbackSlideshow: {
        title: 'Your feedback',
        description: 'Our AI systems provide specific points during your lift that need improvement which will be surfaced here. Then, the relevant issues and tips will be provided for that exact moment. \n\nTap on the right chevron to see the next point.',
      },
      feedbackIssues: {
        title: 'Issues to address',
        description: 'Review the specific issues identified in your form that need attention. \n\nSwipe the overlay to see your video screenshot.',
      },
      feedbackTips: {
        title: 'Improvement tips',
        description: 'Here are specific tips to help improve your form and technique. \n\nRemember you can open and close this feedback panel to see the screenshot of the issue.',
      },
      homeSeeAllLifts: {
        title: 'View all your lifts',
        description: 'Tap here to see all your recorded lifts in the library, where you can filter, sort, and review your workout history.',
      },
      libraryScreen: {
        title: 'Library screen',
        description: 'This is your library where you can view all your recorded lifts. Use the tabs to switch between all lifts and favorites. Sort, filter abd searchtoo! \n\nTap on a lift to see more details and swipe to delete.',
      },
      homePerformanceIcon: {
        title: 'Your performance',
        description: 'Tap the Performance tab to view your progress and statistics over time.',
      },
      performanceMetrics: {
        title: 'Accuracy & Improvement',
        description: 'View your accuracy and improvement metrics to track your progress over time.',
      },
      performanceChartsOverWeight: {
        title: 'Accuracy per weight',
        description: 'This chart shows your accuracy over weight to help you understand your progress over time and at what weight limit you are performing at your best.',
      },
      performanceChartsOverTime: {
        title: 'Accuracy over time',
        description: 'This chart shows your accuracy over time to help you understand your progress. We expect you to have a positive rate of improvement over time within 14 days!',
      },
      settingsFirstCard: {
        title: 'Personal Details',
        description: 'If anything changes, edit your personal details, language and prefered units',
      },
      settingsSupportEmail: {
        title: 'Get Support',
        description: 'Need help? Tap here at any time to contact our support team via email.',
      },
      completionModal: {
        title: 'All done',
        message: 'You\'re ready to use FormAI. Check in every day to keep your streak alive and stay consistent. \n\nRemember you can always replay this tutorial at any time through the settings menu.',
      },
    },
    upload: {
      permissionRequired: 'Permission Required',
      permissionMessage: 'Please grant permission to access your photo library.',
      mediaPermissionTitle: 'Allow media library access',
      mediaPermissionDialogText: 'FormAI would like to access your Media Library.',
      allow: 'Allow',
      dontAllow: "Don't Allow",
      videoTooLong: 'Video Too Long',
      videoTooLongMessage: 'Please select a video that is under 90 seconds.',
      videoTooShort: 'Video Too Short',
      videoTooShortMessage: 'Please select a video that is at least 3 seconds long.',
      error: 'Error',
      failedToSelectVideo: 'Failed to select video. Please try again.',
      failedToGenerateThumbnail: 'Failed to generate video thumbnail. Please try again.',
      uploadVideo: 'Upload Video',
      selectNewVideo: 'New Video',
      duplicateVideo: 'Duplicate Video',
      duplicateVideoMessage: 'This video has already been analysed. Please select a different video.',
      selectDifferentVideo: 'Select Different Video',
      viewAnalysis: 'View Analysis',
      tips: {
        goodLighting: 'Ensure good lighting',
        stableVideo: 'Ensure a stable video',
        sideView: 'Have the video of yourself from the side',
      },
      ok: 'OK',
      recordingFailed: 'Recording failed. Please try again.',
      failedToStartRecording: 'Failed to start recording. Please try again.',
      failedToFinishRecording: 'Recording failed to finish. Please try again.',
      stopRecording: 'Stop Recording?',
      stopRecordingMessage: 'Are you sure you want to stop recording?',
      cancel: 'Cancel',
      stop: 'Stop',
      accessibility: {
        flipCamera: 'Flip camera',
        toggleTorch: 'Toggle torch',
        toggleMic: 'Toggle mic',
        countdown: 'Countdown',
      },
    },
  },
  es: {
    loading: 'Cargando...',
    getStarted: 'Comenzar',
    signIn: 'Iniciar Sesión',
    dontHaveAccount: '¿No tienes una cuenta?',
    startToday: 'Comienza hoy',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    perfectFormAlways: '¡Forma perfecta, siempre!',
    getStartedButton: '¡Comenzar!',
    signInButton: 'Iniciar sesión',
    next: 'Continuar',
    back: 'Atrás',
    tabs: {
      home: 'Inicio',
      progress: 'Progreso',
      settings: 'Configuración',
    },
    settings: {
      personalDetails: 'Detalles Personales',
      language: 'Idioma',
      selectLanguage: 'Seleccionar idioma',
      units: 'Cambiar Unidades',
      appTheme: 'Tema de la aplicación',
      whyLowQualityVideos: '¿Por qué mis videos tienen baja calidad?',
      referFriends: 'Referir Amigos',
      growStrongerTogether: '¡Crecer más fuertes juntos!',
      currentBalance: 'Saldo Actual',
      shareNow: 'Compartir Ahora',
      sharePageTitle: 'Compartir FormAI',
      termsAndConditions: 'Términos de Uso',
      privacyPolicy: 'Política de Privacidad',
      supportEmail: 'Email de Soporte',
      replayTutorial: 'Repetir Tutorial',
      leaveRating: 'Dejar una Calificación',
      deleteAccount: 'Eliminar Cuenta',
      logout: 'Cerrar Sesión',
      save: 'Guardar',
      deleteAccountTitle: '¿Eliminar Cuenta?',
      deleteAccountMessage: '¿Estás seguro de que quieres eliminar permanentemente tu cuenta? Esta acción no se puede deshacer y todos los datos serán eliminados.',
      deleteAccountSubscriptionWarning: 'Eliminar tu cuenta de Form AI a través de la aplicación no cancela tu suscripción. Por favor recuerda cancelar tu suscripción por separado en la configuración de suscripciones de tu dispositivo para que no te cobren nuevamente.',
      iAcknowledge: 'Entiendo',
      deleteAccountButton: 'Eliminar cuenta',
      logoutTitle: '¿Cerrar Sesión?',
      logoutMessage: '¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.',
      no: 'No',
      yes: 'Sí',
      editFailed: {
        gender: 'Error al editar el género',
        height: 'Error al editar la altura',
        dateOfBirth: 'Error al editar la fecha de nacimiento',
        currentWeight: 'Error al editar el peso',
        unitSystem: 'Error al actualizar el sistema de unidades',
        language: 'Error al actualizar el idioma',
        message: 'Por favor inténtalo de nuevo más tarde',
      },
    },
    share: {
      referYourFriends: 'Refiere a tus amigos',
      empowerYourFriends: 'Empodera a tus amigos',
      yourPersonalPromoCode: 'Tu código promocional personal',
      share: 'Compartir',
      howItWorks: 'Cómo funciona',
      step1: 'Comparte el código con amigos',
      step2: 'Gana $5 por cada amigo que se registre en un plan anual con tu código',
      copied: '¡Copiado!',
      promoCodeCopied: 'Código promocional copiado al portapapeles',
      error: 'Error',
      failedToCopy: 'Error al copiar el código promocional al portapapeles',
      failedToShare: 'Error al abrir el diálogo de compartir',
      shareMessage: '¡Hola! Descarga esta aplicación y usa este código promocional:',
      shareTitle: '¡Descarga FormAI!',
    },
    personalDetails: {
      currentWeight: 'Peso actual',
      weight: 'Peso',
      height: 'Altura',
      dateOfBirth: 'Fecha de nacimiento',
      gender: 'Género',
      videoQuality: 'Calidad de Video',
      editCurrentWeight: 'Editar Peso Actual',
      editHeight: 'Editar Altura',
      editDateOfBirth: 'Editar Fecha de Nacimiento',
      editGender: 'Editar Género',
      male: 'Masculino',
      female: 'Femenino',
    },
    add: {
      uploadVideo: 'Subir Video',
      recordVideo: 'Grabar Video',
      uploadVideoDescription: 'Selecciona un video de tu galería para analizar tu forma.',
      recordVideoDescription: 'Graba un nuevo video para analizar tu forma de ejercicio.',
      whatExercise: '¿Qué ejercicio estabas haciendo?',
      back: 'Atrás',
      noVideoAvailable: 'No hay video disponible',
      selectNewVideo: 'Nuevo video',
      continue: 'Continuar',
      generalTips: 'Consejos generales',
      searchMovements: 'Buscar movimientos...',
      useCustomMovement: 'Usar',
      bestRecordingPractices: 'Mejores prácticas de grabación',
      bodyParts: {
        all: 'Todos',
        chest: 'Pecho',
        back: 'Espalda',
        shoulders: 'Hombros',
        arms: 'Brazos',
        legs: 'Piernas',
      },
      movements: {
        'Flat Barbell Bench Press': 'Press de Banca con Barra Plano',
        'Incline Barbell Bench Press': 'Press de Banca con Barra Inclinado',
        'Decline Barbell Bench Press': 'Press de Banca con Barra Declinado',
        'Flat Dumbbell Chest Press': 'Press de Pecho con Mancuernas Plano',
        'Incline Dumbbell Chest Press': 'Press de Pecho con Mancuernas Inclinado',
        'Decline Dumbbell Chest Press': 'Press de Pecho con Mancuernas Declinado',
        'Dumbbell Chest Fly (Incline)': 'Aperturas con Mancuernas (Inclinado)',
        'Dumbbell Chest Fly (Flat)': 'Aperturas con Mancuernas (Plano)',
        'Dumbbell Chest Fly (Decline)': 'Aperturas con Mancuernas (Declinado)',
        'Deadlift': 'Peso Muerto',
        'Barbell Row': 'Remo con Barra',
        'Pendlay Row': 'Remo Pendlay',
        'T-Bar Row': 'Remo con Barra T',
        'Dumbbell Row': 'Remo con Mancuernas',
        'Single Arm Dumbbell Row': 'Remo con Mancuerna a Una Mano',
        'Overhead Barbell Press': 'Press Militar con Barra',
        'Seated Dumbbell Shoulder Press': 'Press de Hombros con Mancuernas Sentado',
        'Arnold Press': 'Press Arnold',
        'Lateral Raise (Dumbbell)': 'Elevaciones Laterales (Mancuernas)',
        'Front Raise (Dumbbell)': 'Elevaciones Frontales (Mancuernas)',
        'Upright Row': 'Remo al Mentón',
        'Barbell Curl': 'Curl con Barra',
        'EZ-Bar Curl': 'Curl con Barra EZ',
        'Dumbbell Curl': 'Curl con Mancuernas',
        'Hammer Curl': 'Curl Martillo',
        'Incline Dumbbell Curl': 'Curl con Mancuernas Inclinado',
        'Cable Curl': 'Curl con Cable',
        'Preacher Curl': 'Curl Predicador',
        'Skullcrusher (Barbell or EZ-Bar)': 'Rompecráneos (Barra o Barra EZ)',
        'Dumbbell Overhead Triceps Extension': 'Extensión de Tríceps con Mancuernas',
        'Barbell Back Squat': 'Sentadilla con Barra Trasera',
        'Barbell Front Squat': 'Sentadilla con Barra Frontal',
        'Goblet Squat': 'Sentadilla Goblet',
        'Dumbbell Back Squat': 'Sentadilla con Mancuernas Trasera',
        'Romanian Deadlift (Barbell or Dumbbell)': 'Peso Muerto Rumano (Barra o Mancuernas)',
        'Stiff-Leg Deadlift': 'Peso Muerto con Piernas Rígidas',
        'Good Morning': 'Buenos Días',
        'Push Ups': 'Flexiones',
      },
      recordingTips: [
        'Asegúrate de tener buena iluminación y una cámara estable',
        'Trata de grabarte desde el lado'
      ],
      countdown: {
        title: 'Cuenta regresiva',
        off: 'Apagado',
        fiveSeconds: '5s',
        tenSeconds: '10s',
      },
    },
    welcome: {
      title: 'FormAI',
      subtitle: 'Forma perfecta, siempre',
      modal: {
        title: 'Bienvenido',
        message: 'Gracias por confiar en Form AI. Estamos emocionados de ayudarte a alcanzar tus objetivos.',
        ctaButton: 'Vamos a enseñarte cómo funciona',
      },
    },
    onboarding: {
      language: {
        title: 'Idioma',
        subtitle: 'Siempre puedes cambiar esto más tarde',
        selectLanguage: 'Selecciona un idioma',
      },
      units: {
        title: 'Unidades',
        subtitle: 'Siempre puedes cambiar esto más tarde',
        metric: 'Métrico',
        imperial: 'Imperial',
        metricDescription: 'Kilogramos y centímetros',
        imperialDescription: 'Libras, pies, pulgadas',
      },
      gender: {
        title: 'Género biológico',
        subtitle: 'Esto se usará para ayudar a nuestros sistemas a encontrar la forma biomecánica óptima para ti',
        male: 'Masculino',
        female: 'Femenino',
        other: 'Otro',
      },
      goal: {
        title: '¿Cuál es tu objetivo?',
        subtitle: 'Esto nos ayuda a generar un plan para tu ingesta calórica.',
        loseWeight: 'Perder peso',
        maintain: 'Mantener',
        gainWeight: 'Ganar peso',
      },
      workouts: {
        title: '¿Cuántos entrenamientos haces cada semana?',
        subtitle: 'Tu frecuencia de entrenamiento moldea tu progreso.',
        zeroToTwo: '0–2',
        zeroToTwoDescription: 'Entrenamientos de vez en cuando',
        threeToFive: '3–5',
        threeToFiveDescription: 'Algunas veces por semana',
        SixPlus: '6+',
        SixPlusDescription: 'Atleta disciplinado',
      },
      discovery: {
        title: '¿Dónde escuchaste sobre nosotros?',
        subtitle: 'Ayúdanos a entender cómo encontraste FormAI',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        google: 'Google',
        appStore: 'App Store',
        playStore: 'Play Store',
        twitter: 'X (Twitter)',
        youtube: 'YouTube',
        friends: 'Amigos y Familia',
        other: 'Otro',
      },
      personalTrainer: {
        title: '¿Tienes un entrenador personal?',
        subtitle: 'Esto nos ayuda a personalizar tu experiencia',
        yes: 'Sí',
        no: 'No',
      },
      trainingReason: {
        title: '¿Cuál es la razón #1 por la que entrenas?',
        subtitle: 'Adaptaremos tu análisis de forma a tu objetivo.',
        buildStrength: 'Construir fuerza',
        improvePhysique: 'Mejorar físico',
        preventInjury: 'Prevenir lesiones',
        trainForSport: 'Entrenar para un deporte',
        stayActiveHealthy: 'Mantenerse activo y saludable',
      },
      gymChallenge: {
        title: '¿Cuál es tu mayor desafío en el gimnasio?',
        subtitle: 'Enfoquémonos en lo que más te importa.',
        unsureForm: 'No estoy seguro si mi forma es correcta',
        noResults: 'No veo resultados',
        worriedInjury: 'Preocupado por lesiones',
        strugglingMotivation: 'Luchando con la motivación',
        other: 'Otro',
      },
      lifterType: {
        title: '¿Cómo te ves como levantador?',
        subtitle: 'Tu nivel de experiencia moldea nuestra orientación.',
        beginner: 'Principiante, aprendiendo lo básico',
        intermediate: 'Intermedio, refinando técnica',
        advanced: 'Avanzado, persiguiendo rendimiento élite',
        returningAfterBreak: 'Regresando después de un descanso',
        injuryRehab: 'Rehabilitación de lesiones',
      },
      perfectFormGoal: {
        title: 'Si tu forma fuera siempre perfecta, ¿qué lograrías más rápido?',
        subtitle: 'Visualiza tu progreso sin contratiempos.',
        liftHeavierSafely: 'Levantar más peso de forma segura',
        buildMuscleEfficiently: 'Construir músculo eficientemente',
        avoidInjuries: 'Evitar lesiones',
        boostConfidence: 'Aumentar confianza',
        trainLongerWithoutSetbacks: 'Entrenar más tiempo sin contratiempos',
      },
      formConfidence: {
        title: '¿Qué tan confiado estás en tu forma ahora mismo?',
        subtitle: 'Sé honesto, te ayudaremos a llegar al 100%.',
        zeroToTwentyFive: '0% - 25%',
        twentyFiveToFifty: '25% - 50%',
        fiftyToSeventyFive: '50% - 75%',
        seventyFiveToHundred: '75% - 100%',
      },
      threeMonthGoal: {
        title: 'En 3 meses, ¿dónde quieres estar?',
        subtitle: 'Tu viaje comienza con la verificación de forma de hoy.',
        liftingHeavier: 'Levantando más peso',
        lookingLeaner: 'Viéndose más delgado',
        feelingStrongerInjuryFree: 'Sintiéndose más fuerte y libre de lesiones',
        moreConsistent: 'Más consistente',
        moreConfident: 'Más confiado',
      },
      measurements: {
        title: 'Altura y Peso',
        subtitle: 'Esto nos ayuda a proporcionar recomendaciones personalizadas',
        height: 'Altura',
        weight: 'Peso',
        metric: 'Métrico',
        imperial: 'Imperial',
        cm: 'cm',
        ft: 'pies',
        in: 'pulg',
        kg: 'kg',
        lbs: 'lbs',
      },
      birthDate: {
        title: '¿Cuándo naciste?',
        subtitle: 'Esto nos ayuda a proporcionar recomendaciones apropiadas para tu edad',
        month: 'Mes',
        day: 'Día',
        year: 'Año',
      },
      rating: {
        title: 'Danos una calificación',
        subtitle: 'Ayúdanos a mejorar compartiendo tu experiencia',
        skip: 'Omitir',
        middleText: '¡FormAI fue hecho para amantes del gimnasio como tú!',
      },
      referralCode: {
        title: 'Ingresa código de referido (Opcional)',
        subtitle: 'Puedes omitir este paso.',
        placeholder: 'Código de Referido',
        skip: 'Omitir',
        submit: 'Enviar',
        success: 'El código de referido ha sido aplicado exitosamente',
        error: 'Código de referido inválido. Por favor inténtalo de nuevo.',
      },
      allDone: {
        title: '¡Todo listo!',
        allDone: '¡Todo listo!',
        thankYou: 'Gracias por confiar en nosotros',
        privacy: 'Prometemos mantener siempre tu información personal privada y segura.',
      },
      trainSafer: {
        title: 'Entrena con tres veces menos probabilidad de lesionarte con Form AI vs por tu cuenta',
        withoutFormAI: 'Sin Form AI',
        withFormAI: 'Con Form AI',
        description: 'FormAI hace fácil perfeccionar tu forma y mantenerte responsable.',
      },
      notificationPermission: {
        title: 'Alcanza tus objetivos con notificaciones',
        dialogText: 'FormAI quisiera enviarte Notificaciones',
        allow: 'Permitir',
        dontAllow: 'No Permitir',
      },
      setupLoading: {
        title: '',
        mainTitle: 'Estamos configurando todo para ti',
        step1: 'Configurando tu perfil...',
        step2: 'Casi listo...',
      },
      freeTrial: {
        title: 'Queremos que pruebes FormAI gratis.',
        noPaymentDue: 'No hay Pago Requerido Ahora',
        tryForFree: 'Probar por $0.00',
        pricing: 'Solo $39.99 al año ($3.33/mes)',
      },
      notificationReminder: {
        title: 'Te enviaremos\\nun recordatorio antes de que\\ntermine tu prueba gratuita',
        noPaymentDue: 'No hay Pago Requerido Ahora',
        continueForFree: 'Continuar GRATIS',
        pricing: 'Solo $39.99 al año ($3.33/mes)',
      },
      subscriptionSelection: {
        title: 'Inicia tu prueba GRATUITA de 3 días para continuar.',
        titleMonthly: 'Desbloquea FormAI para alcanzar tus objetivos más rápido',
        today: 'Hoy',
        todayDescription: 'Desbloquea todas las características de la aplicación como análisis de forma con IA y más.',
        reminder: 'En 2 Días - Recordatorio',
        reminderDescription: 'Te enviaremos un recordatorio de que tu prueba está terminando pronto.',
        billing: 'En 3 Días - Inicia la Facturación',
        billingDescription: 'Se te cobrará el {{billingDate}} a menos que canceles en cualquier momento antes.',
        monthly: 'Mensual',
        monthlyPrice: '$9.99/mes',
        yearly: 'Anual',
        yearlyPrice: '$3.33/mes',
        freeTag: '3 DÍAS GRATIS',
        noPaymentDue: 'No hay Pago Requerido Ahora',
        cancelAnytime: 'Cancela en Cualquier Momento - Sin Compromiso',
        startTrial: 'Iniciar Mi Prueba Gratuita de 3 Días',
        startToday: 'Comenzar Hoy',
        yearlyPricing: '3 días gratis, luego $39.99 por año ($3.33/mes)',
        monthlyPricing: 'Solo $9.99/mes ($120/año)',
        monthlyFeature1: 'Análisis de forma simple',
        monthlyFeature1Description: 'Analiza tu forma para cualquier movimiento con solo un video',
        monthlyFeature2: 'Alcanza tus objetivos del gimnasio',
        monthlyFeature2Description: 'Ponerse en forma nunca ha sido tan fácil',
        monthlyFeature3: 'Rastrea tu progreso',
        monthlyFeature3Description: 'Mantente en el camino correcto con análisis y recordatorios',
      },
      createAccount: {
        title: 'Crear una cuenta',
        signInWithApple: 'Iniciar sesión con Apple',
        signInWithGoogle: 'Iniciar sesión con Google',
      },
      cameraPermission: {
        title: 'Permitir acceso a la cámara',
        subtitle: 'El acceso a la cámara es requerido para FormAI.',
        dialogText: 'FormAI quisiera acceder a tu Cámara.',
        allow: 'Permitir',
        dontAllow: 'No Permitir',
      },
      perfectFormGoalMessage: {
        highlighted: {
          liftHeavierSafely: 'Levantar más peso de forma segura',
          buildMuscleEfficiently: 'Construir músculo',
          avoidInjuries: 'Evitar lesiones',
          boostConfidence: 'Tu confianza se disparará',
          trainLongerWithoutSetbacks: 'Entrenar sin contratiempos',
          default: 'Tus objetivos',
        },
        rest: ' es un objetivo garantizado. ¡No es nada difícil!',
        restRealistic: ' es un objetivo realista. ¡No es nada difícil!',
        restFantastic: ' es un objetivo fantástico. ¡No es nada difícil!',
        restAfter: ' después. ¡No es nada difícil!',
        restNormal: ' será normal. ¡No es nada difícil!',
        restAchievable: ' son alcanzables con Form AI. ¡No es nada difícil!',
        subtitle: 'El 95% de los usuarios dicen que el cambio es claro después de usar Form AI.',
      },
      potentialGraph: {
        title: 'Tienes un potencial increíble para aplastar tu objetivo',
        chartTitle: 'Tu transición de precisión',
        subtitle: 'Basado en los datos históricos de Form AI, la mejora de precisión se retrasa al principio, pero después de 14 días, ¡te volverás increíblemente consistente!',
      },
      costComparison: {
        title: 'Forma perfecta a una fracción del costo usando Form AI vs entrenadores',
        personalTrainer: 'Entrenador personal',
        withFormAI: 'Con Form AI',
        costLess: '99% Menos',
        description: 'Tener una forma segura y perfecta en el gimnasio no debería costar un ojo de la cara.',
      },
      gymChallengeInfo: {
        noResults: {
          headline: 'Los resultados toman tiempo, pero estás más cerca de lo que piensas.',
          message: 'Te guiaremos con la retroalimentación correcta para que tu arduo trabajo valga la pena.',
          howWeGetYouThere: [
            'Análisis de forma para asegurar que cada repetición cuenta',
            'Retroalimentación de video para detectar lo que te está frenando',
            'Seguimiento de precisión para medir el progreso real a lo largo del tiempo'
          ]
        },
        unsureForm: {
          headline: 'La forma viene primero.',
          message: 'Te daremos retroalimentación clara para que puedas entrenar de forma segura y efectiva, cada vez.',
          howWeGetYouThere: [
            'Desglose instantáneo de forma de tus videos de entrenamiento',
            'Consejos accionables para corregir errores rápidamente',
            'Puntuación de precisión para rastrear tu mejora'
          ]
        },
        worriedInjury: {
          headline: 'Entrena seguro. Entrena fuerte.',
          message: 'Te ayudaremos a levantar con confianza detectando movimientos riesgosos antes de que se conviertan en lesiones.',
          howWeGetYouThere: [
            'Retroalimentación de video para resaltar posiciones inseguras',
            'Recomendaciones de técnica más segura adaptadas a ti',
            'Seguimiento de precisión para asegurar consistencia a largo plazo'
          ]
        },
        strugglingMotivation: {
          headline: 'La motivación es más fácil cuando no lo haces solo.',
          message: 'Te mantendremos comprometido mostrando tu progreso y celebrando cada mejora en tu forma.',
          howWeGetYouThere: [
            'Puntuaciones de precisión fáciles de leer después de cada entrenamiento',
            'Mejoras visibles con tendencias de progreso rastreadas',
            'Consejos alentadores que te ayudan a mantenerte consistente'
          ]
        },
        other: {
          headline: 'Estamos aquí para tu viaje.',
          message: 'Cualquiera que sea tu desafío, te daremos la orientación y el apoyo para superarlo.',
          howWeGetYouThere: [
            'Retroalimentación personalizada en tus videos de movimiento',
            'Seguimiento de precisión a través de diferentes tipos de ejercicio',
            'Consejos e insights continuos para apoyar tus objetivos'
          ]
        },
        howWeGetYouThereTitle: 'Así es como te vamos a llevar allí'
      },
      saveProgress: {
        title: 'Crear una cuenta',
      },
    },
    months: {
      january: 'Enero',
      february: 'Febrero',
      march: 'Marzo',
      april: 'Abril',
      may: 'Mayo',
      june: 'Junio',
      july: 'Julio',
      august: 'Agosto',
      september: 'Septiembre',
      october: 'Octubre',
      november: 'Noviembre',
      december: 'Diciembre',
      array: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] as const,
    },
    progress: {
      title: 'Tu viaje comienza aquí',
      subtitle: 'Ve cómo los usuarios mejoran su forma y rendimiento con FormAI',
      chartTitle: 'Mejora de Puntuación de Forma a lo Largo del Tiempo',
      week: 'Semana',
      score: 'Puntuación de Forma',
      formImprovement: 'Mejora de Forma',
      weeksToExcellence: 'Semanas hasta la Excelencia',
    },
    liftingGoal: {
      title: '¿Cuál es tu objetivo?',
      subtitle: 'Esto se usará para adaptar nuestra IA para entender tu estilo de levantamiento.',
      muscleBuilding: 'Construcción muscular',
      powerlifting: 'Powerlifting',
      toning: 'Tonificación',
      strength: 'Fuerza',
      weightLoss: 'Pérdida de peso',
    },
    formBarrier: {
      title: '¿Qué te impide perfeccionar tu forma de ejercicio?',
      subtitle: 'Ayúdanos a entender tus desafíos',
      expensiveTrainers: 'Los entrenadores personales son muy caros',
      gymAdviceScary: 'Pedir consejos me da miedo',
      noTime: 'No tengo tiempo para perfeccionar mi forma',
      other: 'Otro',
    },
    home: {
      addTestLift: 'Agregar Levantamiento de Prueba',
      dailyAccuracyLevel: 'Nivel de precisión diario',
      noLiftsToday: 'No hay levantamientos hoy',
      allTimeAccuracy: 'Precisión de todos los tiempos',
      earnByReferring: '¡Gana Refiriendo!',
      yourVideoLibrary: 'Tu biblioteca de videos',
      lifts: 'Levantamientos recientes',
      seeAll: 'Ver todos',
      noRecordedLifts: 'No hay levantamientos grabados para esta fecha',
      startAnalyzingWorkout: 'Comienza a analizar tu entrenamiento tomando un video rápido',
      dayStreak: 'Racha de {{count}} días',
      onFireMessage: '¡Estás en llamas! Sigue con el gran trabajo con tus rachas diarias.',
      zeroDayStreak: 'Racha de 0 días',
      noStreakMessage: 'Aún no hay racha. Graba en días consecutivos para comenzar tu racha.',
      continue: 'Continuar',
    },
    performance: {
      title: 'Progreso',
      editDateRange: 'Editar rango de fechas',
      from: 'Desde',
      to: 'Hasta',
      reset: 'Restablecer',
      accuracy: 'Precisión',
      trend: 'Tendencia',
      apply: 'Aplicar',
      filterLifts: 'Filtrar levantamientos',
      timeRanges: {
        ninetyDays: '90 Días',
        sixMonths: '6 Meses',
        oneYear: '1 Año',
        allTime: 'Todo el tiempo',
      },
      chartTitles: {
        accuracyPerWeight: 'Precisión por peso',
        accuracyOverTime: 'Precisión a lo largo del tiempo',
        loading: 'Cargando...',
        noDataAvailable: 'No hay datos disponibles',
      },
      info: {
        accuracyPerWeight: {
          title: 'Precisión por peso',
          message: 'Muestra la precisión promedio de forma para cada peso que levantaste para un movimiento dado. Pesos más altos pueden desafiar la forma. Calculado promediando las puntuaciones de precisión para todos los levantamientos en cada peso.'
        },
        accuracyOverTime: {
          title: 'Precisión a lo largo del tiempo',
          message: 'Muestra cómo tu precisión de forma cambia a lo largo del tiempo para un movimiento. Calculado promediando la precisión para cada día y graficando a través de fechas.'
        },
        accuracy: {
          title: 'Precisión',
          message: 'Tu precisión promedio de forma a través del rango de fechas y filtros seleccionados. Calculado como la media de las puntuaciones de precisión para todos los levantamientos.'
        },
        improvement: {
          title: 'Mejora',
          message: 'Cómo tu forma cambió durante el rango seleccionado. Comparamos el primer tercio de tus levantamientos con el último tercio y mostramos la diferencia en precisión promedio.'
        }
      },
      metricsFeedback: {
        title: '¿Quieres otras métricas? ¡Haznos saber!',
        subtitle: 'Ayúdanos a mejorar tu experiencia',
      }
    },
    library: {
      title: 'Biblioteca',
      editDateRange: 'Editar rango de fechas',
      from: 'Desde',
      to: 'Hasta',
      reset: 'Restablecer',
      apply: 'Aplicar',
      all: 'Todos',
      favourites: 'Favoritos',
      noLiftsAnalysed: 'No hay levantamientos analizados',
      noFavouriteLifts: 'No hay levantamientos favoritos',
      noLiftsFound: 'No se encontraron levantamientos',
      startAnalysingWorkout: 'Comienza a analizar el entrenamiento de hoy tomando un video rápido',
      markLiftsAsFavourites: 'Marca levantamientos como favoritos para verlos aquí',
      tryAdjustingFilters: 'Intenta ajustar tus filtros',
      lifts: 'levantamientos',
      lift: 'levantamiento',
      noLifts: '0',
      selectDateRange: 'Seleccionar rango de fechas',
      allLifts: 'Todos los levantamientos',
      oneLift: '1',
      search: 'Buscar',
      liftsCount: '{{count}} Levantamientos',
      filterByMovement: 'Filtrar por movimiento',
      searchMovements: 'Buscar movimientos...',
      allMovements: 'Todos los Movimientos',
      searchAnalysis: {
        analysisFound: 'Análisis Encontrado',
        analysisFoundNotFavourited: 'Se ha encontrado un análisis pero no fue marcado como favorito.',
        continueToLift: 'Continuar al Levantamiento',
        noAnalysisFound: 'No se Encontró Análisis',
        noAnalysisFoundMessage: 'No se encontró análisis para este video. Por favor asegúrate de que el video haya sido analizado antes.',
        analyse: 'Analizar',
        permissionRequired: 'Permiso Requerido',
        permissionMessage: 'Por favor permite el acceso a tu biblioteca de fotos para buscar videos.',
        error: 'Error',
        errorMessage: 'Error al seleccionar video. Por favor inténtalo de nuevo.',
      },
    },
    liftCard: {
      accuracy: 'Precisión',
    },
    loadingLift: {
      uploadingVideo: 'Subiendo video...',
      checkingVideo: 'Verificando video...',
      estimatingPose: 'Estimando postura...',
      analyzingVideo: 'Analizando video...',
      analyzingForm: 'Analizando forma...',
      analysisFailed: 'Análisis fallido',
      processing: 'Procesando...',
      errorOccurred: 'Ocurrió un error',
      pleaseTryAgain: 'Por favor inténtalo de nuevo',
      tapToRetry: 'Toca para reintentar',
      notifyWhenDone: '¡Te notificaremos cuando esté listo!',
      noLiftFound: {
        title: 'No se encontró levantamiento',
        subtitle: 'No podemos detectar un levantamiento',
      },
      liftMismatch: {
        title: 'Levantamiento no coincide',
        subtitle: 'El movimiento seleccionado no coincide con el video',
        detectedMovement: 'No podemos detectarte realizando: {{movement}}',
      },
    },
    feedback: {
      liftDetails: 'Detalles del Levantamiento',
      rangeOfMotionAcrossReps: 'Rango de movimiento a través de tus repeticiones',
      benchPress: 'Press de Banca',
      formAccuracyAcrossReps: 'Precisión de forma a través de tus repeticiones',
      weight: 'Peso',
      reps: 'Repeticiones',
      reviewFeedback: 'Revisar Retroalimentación',
      favourite: 'Favorito',
      manualDeleteLiftCardData: 'Eliminar Levantamiento',
      deleteLiftTitle: 'Eliminar Levantamiento',
      deleteLiftMessage: '¿Estás seguro de que quieres eliminar este levantamiento? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      howItWorks: 'Cómo funciona',
      viewFeedback: 'Ver Retroalimentación',
      step1: 'Nuestra IA nota momentos específicos durante tu levantamiento donde tu forma puede ser mejorada.',
      step2: 'Luego explicará qué no fue óptimo.',
      step3: '¡Luego se darán consejos sobre cómo mantenerse seguro y mejorar!',
      step4: 'Entonces, depende de ti mejorar tu forma y luego revisar en una semana.',
      accuracy: 'Precisión',
      accuracyScore: 'Puntuación de precisión',
      improvements: 'mejoras',
      noVideoAvailable: 'No hay video disponible',
      deleteLiftConfirmation: '¿Estás seguro de que quieres eliminar este levantamiento? Esta acción no se puede deshacer.',
      lbs: 'lbs',
      kg: 'kg',
      updateFailed: {
        weight: 'Error al actualizar el peso',
        message: 'Por favor inténtalo de nuevo más tarde',
      },
    },
    common: {
      accuracy: 'Precisión',
      averageAccuracy: 'Precisión promedio',
      averageFormImprovement: 'Mejora promedio de forma',
      noData: 'No hay datos',
      selectDateRange: 'Seleccionar rango de fechas',
      allLifts: 'Todos los levantamientos',
      oneLift: '1 Levantamiento',
      lifts: 'Levantamientos',
      noLiftsFound: 'No se encontraron levantamientos',
    },
    tutorial: {
      buttons: {
        previous: 'Anterior',
        next: 'Continuar',
        complete: 'Completar',
        skipGuide: 'Omitir tutorial',
        close: 'Cerrar',
      },
      addButton: {
        title: 'Agregar un levantamiento',
        description: 'Usa el botón agregar para iniciar un nuevo análisis de levantamiento.',
      },
      addOptionsUpload: {
        title: 'Subir y Grabar un video',
        description: 'Aquí puedes subir un video o grabar uno nuevo a través de la aplicación que también se guardará en tu biblioteca de fotos. \\n\\nPara esta demostración subiremos un video de demostración.',
      },
      uploadPracticesCta: {
        title: 'Consejos y subida',
        description: 'Aquí puedes encontrar orientación general sobre la calidad del video y cómo obtener los mejores resultados. \\n\\nEl siguiente paso abriría tu biblioteca de fotos pero para la demostración, omitiremos este paso.',
      },
      videoPreviewContinue: {
        title: 'Vista previa del video',
        description: 'Si el video se ve bien, continúa para seleccionar el tipo de levantamiento.',
      },
      movementSelectionContinue: {
        title: 'Elige un tipo de levantamiento',
        description: 'Por favor selecciona un tipo de levantamiento preciso que nos ayudará a analizar tu forma. \\n\\nSi no puedes encontrar un levantamiento, por favor envía un email a nuestro equipo de soporte y buscaremos integrarlo.',
      },
      weightRepsComplete: {
        title: 'Peso y repeticiones',
        description: 'Esto se usará para rastrear tu progreso y ver cómo estás mejorando a lo largo del tiempo.',
      },
      homeFirstLiftCard: {
        title: 'Haz clic aquí para encontrar tu análisis',
        description: 'Tu levantamiento aparece aquí con tu análisis. Tócalo para ver retroalimentación detallada e insights o desliza para eliminar.',
      },
      liftDetailsFormGraph: {
        title: 'Precisión de forma a través de tus repeticiones',
        description: 'Este gráfico muestra cómo varía tu precisión de forma a través de cada repetición del levantamiento.',
      },
      liftDetailsDepthGraph: {
        title: 'Rango de movimiento a través de tus repeticiones',
        description: 'Este gráfico de barras muestra la profundidad de tu levantamiento a través de tus repeticiones.',
      },
      liftDetailsReviewFeedback: {
        title: 'Revisa tu retroalimentación',
        description: 'Toca el botón Revisar Retroalimentación para ver análisis detallado y consejos para mejorar tu forma.',
      },
      howItWorksModal: {
        title: 'Cómo funciona',
        description: 'Esto muestra cómo funciona nuestro análisis de IA y cómo puede ayudarte a mejorar tu forma.',
      },
      feedbackSlideshow: {
        title: 'Tu retroalimentación',
        description: 'Nuestros sistemas de IA proporcionan puntos específicos durante tu levantamiento que necesitan mejora que aparecerán aquí. Luego, los problemas relevantes y consejos serán proporcionados para ese momento exacto. \\n\\nToca en el chevron derecho para ver el siguiente punto.',
      },
      feedbackIssues: {
        title: 'Problemas a abordar',
        description: 'Revisa los problemas específicos identificados en tu forma que necesitan atención. \\n\\nDesliza la superposición para ver la captura de pantalla de tu video.',
      },
      feedbackTips: {
        title: 'Consejos de mejora',
        description: 'Aquí hay consejos específicos para ayudar a mejorar tu forma y técnica. \\n\\nRecuerda que puedes abrir y cerrar este panel de retroalimentación para ver la captura de pantalla del problema.',
      },
      homeSeeAllLifts: {
        title: 'Ver todos tus levantamientos',
        description: 'Toca aquí para ver todos tus levantamientos grabados en la biblioteca, donde puedes filtrar, ordenar y revisar tu historial de entrenamientos.',
      },
      libraryScreen: {
        title: 'Pantalla de biblioteca',
        description: 'Esta es tu biblioteca donde puedes ver todos tus levantamientos grabados. Usa las pestañas para cambiar entre todos los levantamientos y favoritos. ¡Ordena, filtra y busca también! \\n\\nToca en un levantamiento para ver más detalles y desliza para eliminar.',
      },
      homePerformanceIcon: {
        title: 'Tu rendimiento',
        description: 'Toca la pestaña Rendimiento para ver tu progreso y estadísticas a lo largo del tiempo.',
      },
      performanceMetrics: {
        title: 'Precisión y Mejora',
        description: 'Ve tus métricas de precisión y mejora para rastrear tu progreso a lo largo del tiempo.',
      },
      performanceChartsOverWeight: {
        title: 'Precisión por peso',
        description: 'Este gráfico muestra tu precisión sobre el peso para ayudarte a entender tu progreso a lo largo del tiempo y en qué límite de peso estás rindiendo mejor.',
      },
      performanceChartsOverTime: {
        title: 'Precisión a lo largo del tiempo',
        description: 'Este gráfico muestra tu precisión a lo largo del tiempo para ayudarte a entender tu progreso. ¡Esperamos que tengas una tasa positiva de mejora a lo largo del tiempo dentro de 14 días!',
      },
      settingsFirstCard: {
        title: 'Detalles Personales',
        description: 'Si algo cambia, edita tus detalles personales, idioma y unidades preferidas',
      },
      settingsSupportEmail: {
        title: 'Obtener Soporte',
        description: '¿Necesitas ayuda? Toca aquí en cualquier momento para contactar a nuestro equipo de soporte por email.',
      },
      completionModal: {
        title: 'Todo listo',
        message: 'Estás listo para usar FormAI. Revisa cada día para mantener tu racha viva y mantenerte consistente. \\n\\nRecuerda que siempre puedes repetir este tutorial en cualquier momento a través del menú de configuración.',
      },
    },
    upload: {
      permissionRequired: 'Permiso Requerido',
      permissionMessage: 'Por favor otorga permiso para acceder a tu biblioteca de fotos.',
      mediaPermissionTitle: 'Permitir acceso a la biblioteca de medios',
      mediaPermissionDialogText: 'FormAI quisiera acceder a tu Biblioteca de Medios.',
      allow: 'Permitir',
      dontAllow: 'No Permitir',
      videoTooLong: 'Video Muy Largo',
      videoTooLongMessage: 'Por favor selecciona un video que sea menor a 90 segundos.',
      videoTooShort: 'Video Muy Corto',
      videoTooShortMessage: 'Por favor selecciona un video que sea de al menos 3 segundos de duración.',
      error: 'Error',
      failedToSelectVideo: 'Error al seleccionar video. Por favor inténtalo de nuevo.',
      failedToGenerateThumbnail: 'Error al generar miniatura del video. Por favor inténtalo de nuevo.',
      uploadVideo: 'Subir Video',
      selectNewVideo: 'Nuevo Video',
      duplicateVideo: 'Video Duplicado',
      duplicateVideoMessage: 'Este video ya ha sido analizado. Por favor selecciona un video diferente.',
      selectDifferentVideo: 'Seleccionar Video Diferente',
      viewAnalysis: 'Ver Análisis',
      tips: {
        goodLighting: 'Asegúrate de tener buena iluminación',
        stableVideo: 'Asegúrate de que el video sea estable',
        sideView: 'Ten el video de ti mismo desde el lado',
      },
      ok: 'OK',
      recordingFailed: 'Error al grabar. Por favor inténtalo de nuevo.',
      failedToStartRecording: 'Error al iniciar grabación. Por favor inténtalo de nuevo.',
      failedToFinishRecording: 'Error al finalizar grabación. Por favor inténtalo de nuevo.',
      stopRecording: '¿Detener Grabación?',
      stopRecordingMessage: '¿Estás seguro de que quieres detener la grabación?',
      cancel: 'Cancelar',
      stop: 'Detener',
      accessibility: {
        flipCamera: 'Voltear cámara',
        toggleTorch: 'Alternar linterna',
        toggleMic: 'Alternar micrófono',
        countdown: 'Cuenta regresiva',
      },
    },
  },
  zh: {
    loading: '加载中...',
    getStarted: '开始',
    signIn: '登录',
    dontHaveAccount: '没有账户？',
    startToday: '今天开始',
    alreadyHaveAccount: '已有账户？',
    perfectFormAlways: '完美动作，始终如一！',
    getStartedButton: '开始！',
    signInButton: '登录',
    next: '继续',
    back: '返回',
    tabs: {
      home: '首页',
      progress: '进度',
      settings: '设置',
    },
    settings: {
      personalDetails: '个人详情',
      language: '语言',
      selectLanguage: '选择语言',
      units: '更改单位',
      appTheme: '应用主题',
      whyLowQualityVideos: '为什么我的视频质量很低？',
      referFriends: '推荐朋友',
      growStrongerTogether: '一起变得更强！',
      currentBalance: '当前余额',
      shareNow: '立即分享',
      sharePageTitle: '分享 FormAI',
      termsAndConditions: '使用条款',
      privacyPolicy: '隐私政策',
      supportEmail: '支持邮箱',
      replayTutorial: '重播教程',
      leaveRating: '留下评价',
      deleteAccount: '删除账户',
      logout: '退出登录',
      save: '保存',
      deleteAccountTitle: '删除账户？',
      deleteAccountMessage: '您确定要永久删除您的账户吗？此操作无法撤销，所有数据将被删除。',
      deleteAccountSubscriptionWarning: '通过应用删除您的 Form AI 账户不会取消您的订阅。请记住在设备的订阅设置中单独取消订阅，以免再次收费。',
      iAcknowledge: '我知晓',
      deleteAccountButton: '删除账户',
      logoutTitle: '退出登录？',
      logoutMessage: '您确定要退出登录吗？您需要重新登录才能访问您的账户。',
      no: '否',
      yes: '是',
      editFailed: {
        gender: '性别编辑失败',
        height: '身高编辑失败',
        dateOfBirth: '出生日期编辑失败',
        currentWeight: '体重编辑失败',
        unitSystem: '单位系统更新失败',
        language: '语言更新失败',
        message: '请稍后重试',
      },
    },
    share: {
      referYourFriends: '推荐您的朋友',
      empowerYourFriends: '赋能您的朋友',
      yourPersonalPromoCode: '您的个人促销代码',
      share: '分享',
      howItWorks: '如何运作',
      step1: '与朋友分享代码',
      step2: '每位使用您的代码注册年度计划的朋友可为您赚取 $5',
      copied: '已复制！',
      promoCodeCopied: '促销代码已复制到剪贴板',
      error: '错误',
      failedToCopy: '无法将促销代码复制到剪贴板',
      failedToShare: '无法打开分享对话框',
      shareMessage: '嗨！下载这个应用并使用此促销代码：',
      shareTitle: '下载 FormAI！',
    },
    personalDetails: {
      currentWeight: '当前体重',
      weight: '体重',
      height: '身高',
      dateOfBirth: '出生日期',
      gender: '性别',
      videoQuality: '视频质量',
      editCurrentWeight: '编辑当前体重',
      editHeight: '编辑身高',
      editDateOfBirth: '编辑出生日期',
      editGender: '编辑性别',
      male: '男性',
      female: '女性',
    },
    add: {
      uploadVideo: '上传视频',
      recordVideo: '录制视频',
      uploadVideoDescription: '从您的图库中选择一个视频来分析您的动作。',
      recordVideoDescription: '录制一个新视频来分析您的运动形式。',
      whatExercise: '您在做什么运动？',
      back: '返回',
      noVideoAvailable: '没有可用视频',
      selectNewVideo: '新视频',
      continue: '继续',
      generalTips: '一般提示',
      searchMovements: '搜索动作...',
      useCustomMovement: '使用',
      bestRecordingPractices: '最佳录制实践',
      bodyParts: {
        all: '全部',
        chest: '胸部',
        back: '背部',
        shoulders: '肩部',
        arms: '手臂',
        legs: '腿部',
      },
      movements: {
        'Flat Barbell Bench Press': '平板杠铃卧推',
        'Incline Barbell Bench Press': '上斜杠铃卧推',
        'Decline Barbell Bench Press': '下斜杠铃卧推',
        'Flat Dumbbell Chest Press': '平板哑铃胸推',
        'Incline Dumbbell Chest Press': '上斜哑铃胸推',
        'Decline Dumbbell Chest Press': '下斜哑铃胸推',
        'Dumbbell Chest Fly (Incline)': '哑铃飞鸟（上斜）',
        'Dumbbell Chest Fly (Flat)': '哑铃飞鸟（平板）',
        'Dumbbell Chest Fly (Decline)': '哑铃飞鸟（下斜）',
        'Deadlift': '硬拉',
        'Barbell Row': '杠铃划船',
        'Pendlay Row': 'Pendlay 划船',
        'T-Bar Row': 'T杆划船',
        'Dumbbell Row': '哑铃划船',
        'Single Arm Dumbbell Row': '单臂哑铃划船',
        'Overhead Barbell Press': '头顶杠铃推举',
        'Seated Dumbbell Shoulder Press': '坐姿哑铃肩推',
        'Arnold Press': '阿诺德推举',
        'Lateral Raise (Dumbbell)': '侧平举（哑铃）',
        'Front Raise (Dumbbell)': '前平举（哑铃）',
        'Upright Row': '直立划船',
        'Barbell Curl': '杠铃弯举',
        'EZ-Bar Curl': 'EZ杆弯举',
        'Dumbbell Curl': '哑铃弯举',
        'Hammer Curl': '锤式弯举',
        'Incline Dumbbell Curl': '上斜哑铃弯举',
        'Cable Curl': '绳索弯举',
        'Preacher Curl': '牧师椅弯举',
        'Skullcrusher (Barbell or EZ-Bar)': '颅骨粉碎者（杠铃或EZ杆）',
        'Dumbbell Overhead Triceps Extension': '哑铃过头三头肌伸展',
        'Barbell Back Squat': '杠铃后蹲',
        'Barbell Front Squat': '杠铃前蹲',
        'Goblet Squat': '高脚杯深蹲',
        'Dumbbell Back Squat': '哑铃后蹲',
        'Romanian Deadlift (Barbell or Dumbbell)': '罗马尼亚硬拉（杠铃或哑铃）',
        'Stiff-Leg Deadlift': '直腿硬拉',
        'Good Morning': '早安体前屈',
        'Push Ups': '俯卧撑',
      },
      recordingTips: [
        '确保良好的照明和稳定的摄像头',
        '尽量从侧面录制自己'
      ],
      countdown: {
        title: '倒计时',
        off: '关闭',
        fiveSeconds: '5秒',
        tenSeconds: '10秒',
      },
    },
    welcome: {
      title: 'FormAI',
      subtitle: '完美动作，始终如一',
      modal: {
        title: '欢迎',
        message: '感谢您信任 Form AI。我们很高兴帮助您实现目标。',
        ctaButton: '让我们带您了解一下',
      },
    },
    onboarding: {
      language: {
        title: '语言',
        subtitle: '您随时可以更改此设置',
        selectLanguage: '选择语言',
      },
      units: {
        title: '单位',
        subtitle: '您随时可以更改此设置',
        metric: '公制',
        imperial: '英制',
        metricDescription: '千克和厘米',
        imperialDescription: '磅、英尺、英寸',
      },
      gender: {
        title: '生理性别',
        subtitle: '这将用于帮助我们的系统为您找到最佳的生物力学形式',
        male: '男性',
        female: '女性',
        other: '其他',
      },
      goal: {
        title: '您的目标是什么？',
        subtitle: '这有助于我们为您的卡路里摄入制定计划。',
        loseWeight: '减重',
        maintain: '维持',
        gainWeight: '增重',
      },
      workouts: {
        title: '您每周进行多少次锻炼？',
        subtitle: '您的训练频率决定您的进步。',
        zeroToTwo: '0–2次',
        zeroToTwoDescription: '偶尔锻炼',
        threeToFive: '3–5次',
        threeToFiveDescription: '每周几次',
        SixPlus: '6次以上',
        SixPlusDescription: '训练有素的运动员',
      },
      discovery: {
        title: '您是从哪里了解到我们的？',
        subtitle: '帮助我们了解您是如何找到 FormAI 的',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        google: 'Google',
        appStore: 'App Store',
        playStore: 'Play Store',
        twitter: 'X (Twitter)',
        youtube: 'YouTube',
        friends: '朋友和家人',
        other: '其他',
      },
      personalTrainer: {
        title: '您有私人教练吗？',
        subtitle: '这有助于我们定制您的体验',
        yes: '有',
        no: '没有',
      },
      trainingReason: {
        title: '您训练的首要原因是什么？',
        subtitle: '我们将根据您的目标调整动作分析。',
        buildStrength: '增强力量',
        improvePhysique: '改善体型',
        preventInjury: '预防受伤',
        trainForSport: '为运动训练',
        stayActiveHealthy: '保持活跃和健康',
      },
      gymChallenge: {
        title: '您在健身房最大的挑战是什么？',
        subtitle: '让我们专注于对您最重要的事情。',
        unsureForm: '不确定动作是否正确',
        noResults: '看不到效果',
        worriedInjury: '担心受伤',
        strugglingMotivation: '缺乏动力',
        other: '其他',
      },
      lifterType: {
        title: '您如何看待自己作为举重者？',
        subtitle: '您的经验水平决定我们的指导。',
        beginner: '初学者，学习基础知识',
        intermediate: '中级，完善技术',
        advanced: '高级，追求精英表现',
        returningAfterBreak: '休息后重返',
        injuryRehab: '伤病康复',
      },
      perfectFormGoal: {
        title: '如果您的动作总是完美的，您会更快实现什么？',
        subtitle: '想象没有挫折的进步。',
        liftHeavierSafely: '安全地举起更重的重量',
        buildMuscleEfficiently: '高效增肌',
        avoidInjuries: '避免受伤',
        boostConfidence: '增强信心',
        trainLongerWithoutSetbacks: '训练更长时间而不受挫',
      },
      formConfidence: {
        title: '您现在对自己的动作有多自信？',
        subtitle: '诚实回答，我们会帮您达到100%。',
        zeroToTwentyFive: '0% - 25%',
        twentyFiveToFifty: '25% - 50%',
        fiftyToSeventyFive: '50% - 75%',
        seventyFiveToHundred: '75% - 100%',
      },
      threeMonthGoal: {
        title: '3个月后，您希望达到什么状态？',
        subtitle: '您的旅程从今天的动作检查开始。',
        liftingHeavier: '举起更重的重量',
        lookingLeaner: '看起来更精瘦',
        feelingStrongerInjuryFree: '感觉更强壮且无伤痛',
        moreConsistent: '更加持续',
        moreConfident: '更加自信',
      },
      measurements: {
        title: '身高和体重',
        subtitle: '这有助于我们提供个性化建议',
        height: '身高',
        weight: '体重',
        metric: '公制',
        imperial: '英制',
        cm: '厘米',
        ft: '英尺',
        in: '英寸',
        kg: '千克',
        lbs: '磅',
      },
      birthDate: {
        title: '您什么时候出生？',
        subtitle: '这有助于我们提供适合年龄的建议',
        month: '月',
        day: '日',
        year: '年',
      },
      rating: {
        title: '给我们评分',
        subtitle: '通过分享您的体验帮助我们改进',
        skip: '跳过',
        middleText: 'FormAI 是为像您这样的健身爱好者而制作的！',
      },
      referralCode: {
        title: '输入推荐码（可选）',
        subtitle: '您可以跳过此步骤。',
        placeholder: '推荐码',
        skip: '跳过',
        submit: '提交',
        success: '推荐码已成功应用',
        error: '推荐码无效。请重试。',
      },
      allDone: {
        title: '全部完成！',
        allDone: '全部完成！',
        thankYou: '感谢您信任我们',
        privacy: '我们承诺始终保持您的个人信息私密和安全。',
      },
      trainSafer: {
        title: '使用 Form AI 训练比独自训练受伤几率降低三倍',
        withoutFormAI: '没有 Form AI',
        withFormAI: '使用 Form AI',
        description: 'FormAI 让完善您的动作变得容易，并让您保持负责任。',
      },
      notificationPermission: {
        title: '通过通知实现您的目标',
        dialogText: 'FormAI 想要向您发送通知',
        allow: '允许',
        dontAllow: '不允许',
      },
      setupLoading: {
        title: '',
        mainTitle: '我们正在为您设置一切',
        step1: '设置您的个人资料...',
        step2: '即将完成...',
      },
      freeTrial: {
        title: '我们希望您免费试用 FormAI。',
        noPaymentDue: '现在无需付款',
        tryForFree: '免费试用 $0.00',
        pricing: '仅需每年 $39.99（$3.33/月）',
      },
      notificationReminder: {
        title: '我们会在您的\\n免费试用结束前\\n发送提醒',
        noPaymentDue: '现在无需付款',
        continueForFree: '免费继续',
        pricing: '仅需每年 $39.99（$3.33/月）',
      },
      subscriptionSelection: {
        title: '开始您的3天免费试用以继续。',
        titleMonthly: '解锁 FormAI 更快实现您的目标',
        today: '今天',
        todayDescription: '解锁应用的所有功能，如AI动作分析等。',
        reminder: '2天后 - 提醒',
        reminderDescription: '我们会发送提醒，告知您试用即将结束。',
        billing: '3天后 - 开始计费',
        billingDescription: '除非您在之前随时取消，否则将在{{billingDate}}向您收费。',
        monthly: '月付',
        monthlyPrice: '$9.99/月',
        yearly: '年付',
        yearlyPrice: '$3.33/月',
        freeTag: '3天免费',
        noPaymentDue: '现在无需付款',
        cancelAnytime: '随时取消 - 无承诺',
        startTrial: '开始我的3天免费试用',
        startToday: '今天开始',
        yearlyPricing: '3天免费，然后每年$39.99（$3.33/月）',
        monthlyPricing: '仅需$9.99/月（$120/年）',
        monthlyFeature1: '简单动作分析',
        monthlyFeature1Description: '仅通过视频分析任何动作的形式',
        monthlyFeature2: '实现健身目标',
        monthlyFeature2Description: '塑形从未如此简单',
        monthlyFeature3: '跟踪进度',
        monthlyFeature3Description: '通过分析和提醒保持正确轨道',
      },
      createAccount: {
        title: '创建账户',
        signInWithApple: '使用 Apple 登录',
        signInWithGoogle: '使用 Google 登录',
      },
      cameraPermission: {
        title: '允许摄像头访问',
        subtitle: 'FormAI 需要摄像头访问权限。',
        dialogText: 'FormAI 想要访问您的摄像头。',
        allow: '允许',
        dontAllow: '不允许',
      },
      perfectFormGoalMessage: {
        highlighted: {
          liftHeavierSafely: '安全地举起更重的重量',
          buildMuscleEfficiently: '增肌',
          avoidInjuries: '避免受伤',
          boostConfidence: '您的信心将飙升',
          trainLongerWithoutSetbacks: '训练而不受挫',
          default: '您的目标',
        },
        rest: ' 是一个有保证的目标。这一点都不难！',
        restRealistic: ' 是一个现实的目标。这一点都不难！',
        restFantastic: ' 是一个绝佳的目标。这一点都不难！',
        restAfter: ' 之后。这一点都不难！',
        restNormal: ' 将会很正常。这一点都不难！',
        restAchievable: ' 通过 Form AI 是可以实现的。这一点都不难！',
        subtitle: '95%的用户表示使用 Form AI 后变化很明显。',
      },
      potentialGraph: {
        title: '您有惊人的潜力来击败您的目标',
        chartTitle: '您的准确性转变',
        subtitle: '基于 Form AI 的历史数据，准确性改善起初会延迟，但14天后，您将变得非常一致！',
      },
      costComparison: {
        title: '使用 Form AI 与教练相比，以极少的成本获得完美动作',
        personalTrainer: '私人教练',
        withFormAI: '使用 Form AI',
        costLess: '少99%',
        description: '在健身房拥有安全完美的动作不应该花费一大笔钱。',
      },
      gymChallengeInfo: {
        noResults: {
          headline: '结果需要时间，但您比想象的更接近。',
          message: '我们将用正确的反馈指导您，让您的努力得到回报。',
          howWeGetYouThere: [
            '动作分析确保每次重复都有效',
            '视频反馈发现阻碍您的因素',
            '准确性跟踪测量真正的长期进步'
          ]
        },
        unsureForm: {
          headline: '动作第一。',
          message: '我们将给您清晰的反馈，让您每次都能安全有效地训练。',
          howWeGetYouThere: [
            '从您的锻炼视频即时分解动作',
            '可行的技巧快速纠正错误',
            '准确性评分跟踪您的改善'
          ]
        },
        worriedInjury: {
          headline: '安全训练。强力训练。',
          message: '我们将通过在危险动作变成伤害之前捕捉它们来帮助您自信地举重。',
          howWeGetYouThere: [
            '视频反馈突出不安全位置',
            '为您量身定制更安全的技术建议',
            '准确性跟踪确保长期一致性'
          ]
        },
        strugglingMotivation: {
          headline: '当您不是独自一人时，动力会更容易。',
          message: '我们将通过展示您的进步并庆祝您动作的每一次改善来保持您的参与度。',
          howWeGetYouThere: [
            '每次锻炼后易于阅读的准确性分数',
            '通过跟踪进度趋势看到明显改善',
            '鼓励性提示帮助您保持一致'
          ]
        },
        other: {
          headline: '我们为您的旅程而在。',
          message: '无论您的挑战是什么，我们都会给您指导和支持来克服它。',
          howWeGetYouThere: [
            '对您的动作视频的个性化反馈',
            '跨不同运动类型的准确性跟踪',
            '持续的提示和见解支持您的目标'
          ]
        },
        howWeGetYouThereTitle: '这就是我们如何带您到那里'
      },
      saveProgress: {
        title: '创建账户',
      },
    },
    months: {
      january: '一月',
      february: '二月',
      march: '三月',
      april: '四月',
      may: '五月',
      june: '六月',
      july: '七月',
      august: '八月',
      september: '九月',
      october: '十月',
      november: '十一月',
      december: '十二月',
      array: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'] as const,
    },
    progress: {
      title: '您的旅程从这里开始',
      subtitle: '看看用户如何通过 FormAI 改善他们的动作和表现',
      chartTitle: '动作评分随时间改善',
      week: '周',
      score: '动作评分',
      formImprovement: '动作改善',
      weeksToExcellence: '达到卓越的周数',
    },
    liftingGoal: {
      title: '您的目标是什么？',
      subtitle: '这将用于调整我们的AI以了解您的举重风格。',
      muscleBuilding: '增肌',
      powerlifting: '力量举',
      toning: '塑形',
      strength: '力量',
      weightLoss: '减重',
    },
    formBarrier: {
      title: '什么阻止您完善您的运动形式？',
      subtitle: '帮助我们了解您的挑战',
      expensiveTrainers: '私人教练太昂贵',
      gymAdviceScary: '寻求建议让我害怕',
      noTime: '我没有时间完善我的动作',
      other: '其他',
    },
    home: {
      addTestLift: '添加测试举重',
      dailyAccuracyLevel: '每日准确性水平',
      noLiftsToday: '今天没有举重',
      allTimeAccuracy: '历史准确性',
      earnByReferring: '通过推荐赚钱！',
      yourVideoLibrary: '您的视频库',
      lifts: '最近的举重',
      seeAll: '查看全部',
      noRecordedLifts: '此日期没有记录的举重',
      startAnalyzingWorkout: '通过拍摄快速视频开始分析您的锻炼',
      dayStreak: '{{count}}天连续',
      onFireMessage: '您很棒！继续保持您的每日连续记录。',
      zeroDayStreak: '0天连续',
      noStreakMessage: '还没有连续记录。连续几天记录以开始您的连续记录。',
      continue: '继续',
    },
    performance: {
      title: '进度',
      editDateRange: '编辑日期范围',
      from: '从',
      to: '到',
      reset: '重置',
      accuracy: '准确性',
      trend: '趋势',
      apply: '应用',
      filterLifts: '筛选举重',
      timeRanges: {
        ninetyDays: '90天',
        sixMonths: '6个月',
        oneYear: '1年',
        allTime: '全部时间',
      },
      chartTitles: {
        accuracyPerWeight: '每重量准确性',
        accuracyOverTime: '准确性随时间变化',
        loading: '加载中...',
        noDataAvailable: '没有可用数据',
      },
      info: {
        accuracyPerWeight: {
          title: '每重量准确性',
          message: '显示您为给定动作举起的每个重量的平均动作准确性。更重的重量可能会挑战动作。通过平均每个重量所有举重的准确性分数计算。'
        },
        accuracyOverTime: {
          title: '准确性随时间变化',
          message: '显示您的动作准确性如何随时间变化。通过平均每天的准确性并跨日期绘制计算。'
        },
        accuracy: {
          title: '准确性',
          message: '您在选定日期范围和筛选器中的平均动作准确性。计算为所有举重准确性分数的平均值。'
        },
        improvement: {
          title: '改善',
          message: '您的动作在选定范围内如何变化。我们比较您举重的前三分之一和后三分之一，并显示平均准确性的差异。'
        }
      },
      metricsFeedback: {
        title: '想要其他指标？让我们知道！',
        subtitle: '帮助我们改善您的体验',
      }
    },
    library: {
      title: '库',
      editDateRange: '编辑日期范围',
      from: '从',
      to: '到',
      reset: '重置',
      apply: '应用',
      all: '全部',
      favourites: '收藏',
      noLiftsAnalysed: '没有分析的举重',
      noFavouriteLifts: '没有收藏的举重',
      noLiftsFound: '未找到举重',
      startAnalysingWorkout: '通过拍摄快速视频开始分析今天的锻炼',
      markLiftsAsFavourites: '将举重标记为收藏以在此处查看',
      tryAdjustingFilters: '尝试调整您的筛选器',
      lifts: '举重',
      lift: '举重',
      noLifts: '0',
      selectDateRange: '选择日期范围',
      allLifts: '所有举重',
      oneLift: '1',
      search: '搜索',
      liftsCount: '{{count}}次举重',
      filterByMovement: '按动作筛选',
      searchMovements: '搜索动作...',
      allMovements: '所有动作',
      searchAnalysis: {
        analysisFound: '找到分析',
        analysisFoundNotFavourited: '找到了分析但未收藏。',
        continueToLift: '继续举重',
        noAnalysisFound: '未找到分析',
        noAnalysisFoundMessage: '未找到此视频的分析。请确保视频之前已被分析。',
        analyse: '分析',
        permissionRequired: '需要权限',
        permissionMessage: '请允许访问您的照片库以搜索视频。',
        error: '错误',
        errorMessage: '选择视频失败。请重试。',
      },
    },
    liftCard: {
      accuracy: '准确性',
    },
    loadingLift: {
      uploadingVideo: '上传视频中...',
      checkingVideo: '检查视频中...',
      estimatingPose: '估计姿势中...',
      analyzingVideo: '分析视频中...',
      analyzingForm: '分析动作中...',
      analysisFailed: '分析失败',
      processing: '处理中...',
      errorOccurred: '发生错误',
      pleaseTryAgain: '请重试',
      tapToRetry: '点击重试',
      notifyWhenDone: '完成后我们会通知您！',
      noLiftFound: {
        title: '未找到举重',
        subtitle: '我们无法检测到举重',
      },
      liftMismatch: {
        title: '举重不匹配',
        subtitle: '选择的动作与视频不匹配',
        detectedMovement: '我们无法检测到您在进行：{{movement}}',
      },
    },
    feedback: {
      liftDetails: '举重详情',
      rangeOfMotionAcrossReps: '您各次重复的运动范围',
      benchPress: '卧推',
      formAccuracyAcrossReps: '您各次重复的动作准确性',
      weight: '重量',
      reps: '重复次数',
      reviewFeedback: '查看反馈',
      favourite: '收藏',
      manualDeleteLiftCardData: '删除举重',
      deleteLiftTitle: '删除举重',
      deleteLiftMessage: '您确定要删除此次举重吗？此操作无法撤销。',
      cancel: '取消',
      delete: '删除',
      howItWorks: '工作原理',
      viewFeedback: '查看反馈',
      step1: '我们的AI注意到您举重过程中可以改善动作的特定时刻。',
      step2: '然后它会解释什么不是最佳的。',
      step3: '然后会给出如何保持安全和改善的提示！',
      step4: '然后，您需要改善您的动作，并在一周后回顾。',
      accuracy: '准确性',
      accuracyScore: '准确性分数',
      improvements: '改善',
      noVideoAvailable: '没有可用视频',
      deleteLiftConfirmation: '您确定要删除此次举重吗？此操作无法撤销。',
      lbs: '磅',
      kg: '千克',
      updateFailed: {
        weight: '重量更新失败',
        message: '请稍后重试',
      },
    },
    common: {
      accuracy: '准确性',
      averageAccuracy: '平均准确性',
      averageFormImprovement: '平均动作改善',
      noData: '无数据',
      selectDateRange: '选择日期范围',
      allLifts: '所有举重',
      oneLift: '1次举重',
      lifts: '举重',
      noLiftsFound: '未找到举重',
    },
    tutorial: {
      buttons: {
        previous: '上一步',
        next: '继续',
        complete: '完成',
        skipGuide: '跳过教程',
        close: '关闭',
      },
      addButton: {
        title: '添加举重',
        description: '使用添加按钮开始新的举重分析。',
      },
      addOptionsUpload: {
        title: '上传和录制视频',
        description: '在这里您可以上传视频或通过应用录制新视频，也会保存到您的照片库中。\\n\\n在此演示中我们将上传演示视频。',
      },
      uploadPracticesCta: {
        title: '提示和上传',
        description: '在这里，您可以找到关于视频质量的一般指导以及如何获得最佳结果。\\n\\n下一步会打开您的照片库，但在演示中，我们将跳过此步骤。',
      },
      videoPreviewContinue: {
        title: '视频预览',
        description: '如果视频看起来不错，继续选择举重类型。',
      },
      movementSelectionContinue: {
        title: '选择举重类型',
        description: '请选择准确的举重类型，这将帮助我们分析您的动作。\\n\\n如果您找不到举重动作，请发邮件给我们的支持团队，我们会寻求整合它。',
      },
      weightRepsComplete: {
        title: '重量和重复次数',
        description: '这将用于跟踪您的进度并查看您如何随时间改善。',
      },
      homeFirstLiftCard: {
        title: '点击这里查找您的分析',
        description: '您的举重出现在这里并附有分析。点击它查看详细反馈和见解，或滑动删除。',
      },
      liftDetailsFormGraph: {
        title: '您各次重复的动作准确性',
        description: '此图表显示您的动作准确性如何在举重的每次重复中变化。',
      },
      liftDetailsDepthGraph: {
        title: '您各次重复的运动范围',
        description: '此柱状图显示您各次重复的举重深度。',
      },
      liftDetailsReviewFeedback: {
        title: '查看您的反馈',
        description: '点击查看反馈按钮查看详细分析和改善动作的提示。',
      },
      howItWorksModal: {
        title: '工作原理',
        description: '这显示了我们的AI分析如何工作以及如何帮助您改善动作。',
      },
      feedbackSlideshow: {
        title: '您的反馈',
        description: '我们的AI系统提供您举重过程中需要改善的特定点，将在这里显示。然后，会为那个确切时刻提供相关问题和提示。\\n\\n点击右箭头查看下一个点。',
      },
      feedbackIssues: {
        title: '需要解决的问题',
        description: '查看在您的动作中识别出的需要注意的特定问题。\\n\\n滑动覆盖层查看您的视频截图。',
      },
      feedbackTips: {
        title: '改善提示',
        description: '这里是帮助改善您的动作和技术的具体提示。\\n\\n记住您可以打开和关闭此反馈面板以查看问题的截图。',
      },
      homeSeeAllLifts: {
        title: '查看您的所有举重',
        description: '点击这里查看库中所有记录的举重，您可以在那里筛选、排序和查看您的锻炼历史。',
      },
      libraryScreen: {
        title: '库屏幕',
        description: '这是您的库，您可以在这里查看所有记录的举重。使用标签在所有举重和收藏之间切换。也可以排序、筛选和搜索！\\n\\n点击举重查看更多详情，滑动删除。',
      },
      homePerformanceIcon: {
        title: '您的表现',
        description: '点击表现标签查看您随时间的进度和统计数据。',
      },
      performanceMetrics: {
        title: '准确性和改善',
        description: '查看您的准确性和改善指标以跟踪您随时间的进度。',
      },
      performanceChartsOverWeight: {
        title: '每重量准确性',
        description: '此图表显示您的准确性随重量变化，帮助您了解您随时间的进度以及在什么重量限制下您表现最佳。',
      },
      performanceChartsOverTime: {
        title: '准确性随时间变化',
        description: '此图表显示您的准确性随时间变化，帮助您了解您的进步。我们期望您在14天内有积极的改善率！',
      },
      settingsFirstCard: {
        title: '个人详情',
        description: '如果有任何变化，编辑您的个人详情、语言和首选单位',
      },
      settingsSupportEmail: {
        title: '获取支持',
        description: '需要帮助？随时点击这里通过电子邮件联系我们的支持团队。',
      },
      completionModal: {
        title: '全部完成',
        message: '您已准备好使用FormAI。每天检查以保持您的连续记录并保持一致。\\n\\n记住您随时可以通过设置菜单重播此教程。',
      },
    },
    upload: {
      permissionRequired: '需要权限',
      permissionMessage: '请授予访问您照片库的权限。',
      mediaPermissionTitle: '允许媒体库访问',
      mediaPermissionDialogText: 'FormAI 想要访问您的媒体库。',
      allow: '允许',
      dontAllow: '不允许',
      videoTooLong: '视频太长',
      videoTooLongMessage: '请选择90秒以下的视频。',
      videoTooShort: '视频太短',
      videoTooShortMessage: '请选择至少3秒长的视频。',
      error: '错误',
      failedToSelectVideo: '选择视频失败。请重试。',
      failedToGenerateThumbnail: '生成视频缩略图失败。请重试。',
      uploadVideo: '上传视频',
      selectNewVideo: '新视频',
      duplicateVideo: '重复视频',
      duplicateVideoMessage: '此视频已被分析。请选择不同的视频。',
      selectDifferentVideo: '选择不同视频',
      viewAnalysis: '查看分析',
      tips: {
        goodLighting: '确保良好的照明',
        stableVideo: '确保视频稳定',
        sideView: '从侧面拍摄自己的视频',
      },
      ok: 'OK',
      recordingFailed: '录制失败。请重试。',
      failedToStartRecording: '开始录制失败。请重试。',
      failedToFinishRecording: '录制完成失败。请重试。',
      stopRecording: '停止录制？',
      stopRecordingMessage: '您确定要停止录制吗？',
      cancel: '取消',
      stop: '停止',
      accessibility: {
        flipCamera: '翻转摄像头',
        toggleTorch: '切换手电筒',
        toggleMic: '切换麦克风',
        countdown: '倒计时',
      },
    },
  },
  it: {
    loading: 'Caricamento...',
    getStarted: 'Inizia',
    signIn: 'Accedi',
    dontHaveAccount: 'Non hai un account?',
    startToday: 'Inizia oggi',
    alreadyHaveAccount: 'Hai già un account?',
    perfectFormAlways: 'Forma perfetta, sempre!',
    getStartedButton: 'Inizia!',
    signInButton: 'Accedi',
    next: 'Continua',
    back: 'Indietro',
    tabs: {
      home: 'Home',
      progress: 'Progressi',
      settings: 'Impostazioni',
    },
    settings: {
      personalDetails: 'Dettagli Personali',
      language: 'Lingua',
      selectLanguage: 'Seleziona lingua',
      units: 'Cambia Unità',
      appTheme: 'Tema app',
      whyLowQualityVideos: 'Perché i miei video hanno bassa qualità?',
      referFriends: 'Invita Amici',
      growStrongerTogether: 'Diventiamo più forti insieme!',
      currentBalance: 'Saldo Attuale',
      shareNow: 'Condividi Ora',
      sharePageTitle: 'Condividi FormAI',
      termsAndConditions: 'Termini di Utilizzo',
      privacyPolicy: 'Politica sulla Privacy',
      supportEmail: 'Email di Supporto',
      replayTutorial: 'Riproduci Tutorial',
      leaveRating: 'Lascia una Valutazione',
      deleteAccount: 'Elimina Account',
      logout: 'Disconnetti',
      save: 'Salva',
      deleteAccountTitle: 'Eliminare Account?',
      deleteAccountMessage: 'Sei sicuro di voler eliminare permanentemente il tuo account? Questa azione non può essere annullata e tutti i dati verranno eliminati.',
      deleteAccountSubscriptionWarning: 'Eliminare il tuo account Form AI tramite l\'app non annulla il tuo abbonamento. Ricorda di annullare l\'abbonamento separatamente nelle impostazioni degli abbonamenti del tuo dispositivo per non essere addebitato di nuovo.',
      iAcknowledge: 'Riconosco',
      deleteAccountButton: 'Elimina account',
      logoutTitle: 'Disconnettersi?',
      logoutMessage: 'Sei sicuro di voler disconnetterti? Dovrai accedere di nuovo per accedere al tuo account.',
      no: 'No',
      yes: 'Sì',
      editFailed: {
        gender: 'Modifica genere fallita',
        height: 'Modifica altezza fallita',
        dateOfBirth: 'Modifica data di nascita fallita',
        currentWeight: 'Modifica peso fallita',
        unitSystem: 'Aggiornamento sistema unità fallito',
        language: 'Aggiornamento lingua fallito',
        message: 'Riprova più tardi',
      },
    },
    share: {
      referYourFriends: 'Invita i tuoi amici',
      empowerYourFriends: 'Potenzia i tuoi amici',
      yourPersonalPromoCode: 'Il tuo codice promozionale personale',
      share: 'Condividi',
      howItWorks: 'Come funziona',
      step1: 'Condividi il codice con gli amici',
      step2: 'Guadagna $5 per ogni amico che si iscrive a un piano annuale con il tuo codice',
      copied: 'Copiato!',
      promoCodeCopied: 'Codice promozionale copiato negli appunti',
      error: 'Errore',
      failedToCopy: 'Impossibile copiare il codice promozionale negli appunti',
      failedToShare: 'Impossibile aprire la finestra di condivisione',
      shareMessage: 'Ciao! Scarica questa app e usa questo codice promozionale:',
      shareTitle: 'Scarica FormAI!',
    },
    personalDetails: {
      currentWeight: 'Peso attuale',
      weight: 'Peso',
      height: 'Altezza',
      dateOfBirth: 'Data di nascita',
      gender: 'Genere',
      videoQuality: 'Qualità Video',
      editCurrentWeight: 'Modifica Peso Attuale',
      editHeight: 'Modifica Altezza',
      editDateOfBirth: 'Modifica Data di Nascita',
      editGender: 'Modifica Genere',
      male: 'Maschio',
      female: 'Femmina',
    },
    add: {
      uploadVideo: 'Carica Video',
      recordVideo: 'Registra Video',
      uploadVideoDescription: 'Seleziona un video dalla tua galleria per analizzare la tua forma.',
      recordVideoDescription: 'Registra un nuovo video per analizzare la tua forma di esercizio.',
      whatExercise: 'Che esercizio stavi facendo?',
      back: 'Indietro',
      noVideoAvailable: 'Nessun video disponibile',
      selectNewVideo: 'Nuovo video',
      continue: 'Continua',
      generalTips: 'Consigli generali',
      searchMovements: 'Cerca movimenti...',
      useCustomMovement: 'Usa',
      bestRecordingPractices: 'Migliori pratiche di registrazione',
      bodyParts: {
        all: 'Tutti',
        chest: 'Petto',
        back: 'Schiena',
        shoulders: 'Spalle',
        arms: 'Braccia',
        legs: 'Gambe',
      },
      movements: {
        'Flat Barbell Bench Press': 'Panca Piana con Bilanciere',
        'Incline Barbell Bench Press': 'Panca Inclinata con Bilanciere',
        'Decline Barbell Bench Press': 'Panca Declinata con Bilanciere',
        'Flat Dumbbell Chest Press': 'Panca Piana con Manubri',
        'Incline Dumbbell Chest Press': 'Panca Inclinata con Manubri',
        'Decline Dumbbell Chest Press': 'Panca Declinata con Manubri',
        'Dumbbell Chest Fly (Incline)': 'Croci con Manubri (Inclinata)',
        'Dumbbell Chest Fly (Flat)': 'Croci con Manubri (Piana)',
        'Dumbbell Chest Fly (Decline)': 'Croci con Manubri (Declinata)',
        'Deadlift': 'Stacco da Terra',
        'Barbell Row': 'Rematore con Bilanciere',
        'Pendlay Row': 'Rematore Pendlay',
        'T-Bar Row': 'Rematore con T-Bar',
        'Dumbbell Row': 'Rematore con Manubri',
        'Single Arm Dumbbell Row': 'Rematore con Manubrio a Braccio Singolo',
        'Overhead Barbell Press': 'Lento Avanti con Bilanciere',
        'Seated Dumbbell Shoulder Press': 'Lento con Manubri da Seduto',
        'Arnold Press': 'Arnold Press',
        'Lateral Raise (Dumbbell)': 'Alzate Laterali (Manubri)',
        'Front Raise (Dumbbell)': 'Alzate Frontali (Manubri)',
        'Upright Row': 'Tirate al Mento',
        'Barbell Curl': 'Curl con Bilanciere',
        'EZ-Bar Curl': 'Curl con Bilanciere EZ',
        'Dumbbell Curl': 'Curl con Manubri',
        'Hammer Curl': 'Curl a Martello',
        'Incline Dumbbell Curl': 'Curl con Manubri su Panca Inclinata',
        'Cable Curl': 'Curl ai Cavi',
        'Preacher Curl': 'Curl alla Panca Scott',
        'Skullcrusher (Barbell or EZ-Bar)': 'French Press (Bilanciere o EZ-Bar)',
        'Dumbbell Overhead Triceps Extension': 'Estensioni Tricipiti Sopra la Testa con Manubri',
        'Barbell Back Squat': 'Squat con Bilanciere',
        'Barbell Front Squat': 'Front Squat con Bilanciere',
        'Goblet Squat': 'Goblet Squat',
        'Dumbbell Back Squat': 'Squat con Manubri',
        'Romanian Deadlift (Barbell or Dumbbell)': 'Stacco Rumeno (Bilanciere o Manubri)',
        'Stiff-Leg Deadlift': 'Stacco a Gambe Tese',
        'Good Morning': 'Good Morning',
        'Push Ups': 'Flessioni',
      },
      recordingTips: [
        'Assicurati di avere una buona illuminazione e una fotocamera stabile',
        'Cerca di riprenderti dal lato'
      ],
      countdown: {
        title: 'Conto alla rovescia',
        off: 'Spento',
        fiveSeconds: '5s',
        tenSeconds: '10s',
      },
    },
    welcome: {
      title: 'FormAI',
      subtitle: 'Forma perfetta, sempre',
      modal: {
        title: 'Benvenuto',
        message: 'Grazie per aver scelto Form AI. Siamo entusiasti di aiutarti a raggiungere i tuoi obiettivi.',
        ctaButton: 'Lascia che ti mostriamo come funziona',
      },
    },
    onboarding: {
      language: {
        title: 'Lingua',
        subtitle: 'Puoi sempre cambiare questo in seguito',
        selectLanguage: 'Seleziona una lingua',
      },
      units: {
        title: 'Unità',
        subtitle: 'Puoi sempre cambiare questo in seguito',
        metric: 'Metrico',
        imperial: 'Imperiale',
        metricDescription: 'Chilogrammi e centimetri',
        imperialDescription: 'Libbre, piedi, pollici',
      },
      gender: {
        title: 'Genere biologico',
        subtitle: 'Questo sarà utilizzato per aiutare i nostri sistemi a trovare la forma biomeccanica ottimale per te',
        male: 'Maschio',
        female: 'Femmina',
        other: 'Altro',
      },
      goal: {
        title: 'Qual è il tuo obiettivo?',
        subtitle: 'Questo ci aiuta a generare un piano per il tuo apporto calorico.',
        loseWeight: 'Perdere peso',
        maintain: 'Mantenere',
        gainWeight: 'Aumentare peso',
      },
      workouts: {
        title: 'Quanti allenamenti fai ogni settimana?',
        subtitle: 'La tua frequenza di allenamento modella i tuoi progressi.',
        zeroToTwo: '0–2',
        zeroToTwoDescription: 'Allenamenti qua e là',
        threeToFive: '3–5',
        threeToFiveDescription: 'Alcune volte a settimana',
        SixPlus: '6+',
        SixPlusDescription: 'Atleta disciplinato',
      },
      discovery: {
        title: 'Dove hai sentito parlare di noi?',
        subtitle: 'Aiutaci a capire come hai trovato FormAI',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        google: 'Google',
        appStore: 'App Store',
        playStore: 'Play Store',
        twitter: 'X (Twitter)',
        youtube: 'YouTube',
        friends: 'Amici e Famiglia',
        other: 'Altro',
      },
      personalTrainer: {
        title: 'Hai un personal trainer?',
        subtitle: 'Questo ci aiuta a personalizzare la tua esperienza',
        yes: 'Sì',
        no: 'No',
      },
      trainingReason: {
        title: 'Qual è la ragione #1 per cui ti alleni?',
        subtitle: 'Adatteremo la tua analisi della forma al tuo obiettivo.',
        buildStrength: 'Costruire forza',
        improvePhysique: 'Migliorare il fisico',
        preventInjury: 'Prevenire infortuni',
        trainForSport: 'Allenarsi per uno sport',
        stayActiveHealthy: 'Rimanere attivo e sano',
      },
      gymChallenge: {
        title: 'Qual è la tua sfida più grande in palestra?',
        subtitle: 'Concentriamoci su ciò che è più importante per te.',
        unsureForm: 'Non sono sicuro se la mia forma è corretta',
        noResults: 'Non vedo risultati',
        worriedInjury: 'Preoccupato per gli infortuni',
        strugglingMotivation: 'Lotta con la motivazione',
        other: 'Altro',
      },
      lifterType: {
        title: 'Come ti vedi come sollevatore?',
        subtitle: 'Il tuo livello di esperienza modella la nostra guida.',
        beginner: 'Principiante, imparando le basi',
        intermediate: 'Intermedio, perfezionando la tecnica',
        advanced: 'Avanzato, inseguendo prestazioni d\'élite',
        returningAfterBreak: 'Tornando dopo una pausa',
        injuryRehab: 'Riabilitazione da infortunio',
      },
      perfectFormGoal: {
        title: 'Se la tua forma fosse sempre perfetta, cosa otterresti più velocemente?',
        subtitle: 'Visualizza i tuoi progressi senza battute d\'arresto.',
        liftHeavierSafely: 'Sollevare più peso in sicurezza',
        buildMuscleEfficiently: 'Costruire muscoli efficacemente',
        avoidInjuries: 'Evitare infortuni',
        boostConfidence: 'Aumentare la fiducia',
        trainLongerWithoutSetbacks: 'Allenarsi più a lungo senza battute d\'arresto',
      },
      formConfidence: {
        title: 'Quanto sei sicuro della tua forma in questo momento?',
        subtitle: 'Sii onesto, ti aiuteremo a raggiungere il 100%.',
        zeroToTwentyFive: '0% - 25%',
        twentyFiveToFifty: '25% - 50%',
        fiftyToSeventyFive: '50% - 75%',
        seventyFiveToHundred: '75% - 100%',
      },
      threeMonthGoal: {
        title: 'Tra 3 mesi, dove vuoi essere?',
        subtitle: 'Il tuo viaggio inizia con il controllo della forma di oggi.',
        liftingHeavier: 'Sollevando più peso',
        lookingLeaner: 'Apparendo più magro',
        feelingStrongerInjuryFree: 'Sentendosi più forte e senza infortuni',
        moreConsistent: 'Più costante',
        moreConfident: 'Più sicuro',
      },
      measurements: {
        title: 'Altezza e Peso',
        subtitle: 'Questo ci aiuta a fornire raccomandazioni personalizzate',
        height: 'Altezza',
        weight: 'Peso',
        metric: 'Metrico',
        imperial: 'Imperiale',
        cm: 'cm',
        ft: 'piedi',
        in: 'pollici',
        kg: 'kg',
        lbs: 'lbs',
      },
      birthDate: {
        title: 'Quando sei nato?',
        subtitle: 'Questo ci aiuta a fornire raccomandazioni appropriate per l\'età',
        month: 'Mese',
        day: 'Giorno',
        year: 'Anno',
      },
      rating: {
        title: 'Dacci una valutazione',
        subtitle: 'Aiutaci a migliorare condividendo la tua esperienza',
        skip: 'Salta',
        middleText: 'FormAI è stato creato per gli amanti della palestra come te!',
      },
      referralCode: {
        title: 'Inserisci codice di riferimento (Opzionale)',
        subtitle: 'Puoi saltare questo passaggio.',
        placeholder: 'Codice di Riferimento',
        skip: 'Salta',
        submit: 'Invia',
        success: 'Il codice di riferimento è stato applicato con successo',
        error: 'Codice di riferimento non valido. Riprova.',
      },
      allDone: {
        title: 'Tutto fatto!',
        allDone: 'Tutto fatto!',
        thankYou: 'Grazie per aver scelto di fidarti di noi',
        privacy: 'Promettiamo di mantenere sempre le tue informazioni personali private e sicure.',
      },
      trainSafer: {
        title: 'Allenati con tre volte meno probabilità di infortuni con Form AI rispetto a da solo',
        withoutFormAI: 'Senza Form AI',
        withFormAI: 'Con Form AI',
        description: 'FormAI rende facile perfezionare la tua forma e mantenerti responsabile.',
      },
      notificationPermission: {
        title: 'Raggiungi i tuoi obiettivi con le notifiche',
        dialogText: 'FormAI vorrebbe inviarti Notifiche',
        allow: 'Consenti',
        dontAllow: 'Non Consentire',
      },
      setupLoading: {
        title: '',
        mainTitle: 'Stiamo configurando tutto per te',
        step1: 'Configurando il tuo profilo...',
        step2: 'Quasi pronto...',
      },
      freeTrial: {
        title: 'Vogliamo che provi FormAI gratuitamente.',
        noPaymentDue: 'Nessun Pagamento Dovuto Ora',
        tryForFree: 'Prova per $0.00',
        pricing: 'Solo $39.99 all\'anno ($3.33/mese)',
      },
      notificationReminder: {
        title: 'Ti invieremo\\nun promemoria prima che\\nla tua prova gratuita finisca',
        noPaymentDue: 'Nessun Pagamento Dovuto Ora',
        continueForFree: 'Continua GRATIS',
        pricing: 'Solo $39.99 all\'anno ($3.33/mese)',
      },
      subscriptionSelection: {
        title: 'Inizia la tua prova GRATUITA di 3 giorni per continuare.',
        titleMonthly: 'Sblocca FormAI per raggiungere i tuoi obiettivi più velocemente',
        today: 'Oggi',
        todayDescription: 'Sblocca tutte le funzionalità dell\'app come l\'analisi della forma con IA e altro.',
        reminder: 'Tra 2 Giorni - Promemoria',
        reminderDescription: 'Ti invieremo un promemoria che la tua prova sta finendo presto.',
        billing: 'Tra 3 Giorni - Inizio Fatturazione',
        billingDescription: 'Ti verrà addebitato il {{billingDate}} a meno che non annulli in qualsiasi momento prima.',
        monthly: 'Mensile',
        monthlyPrice: '$9.99/mese',
        yearly: 'Annuale',
        yearlyPrice: '$3.33/mese',
        freeTag: '3 GIORNI GRATIS',
        noPaymentDue: 'Nessun Pagamento Dovuto Ora',
        cancelAnytime: 'Annulla in Qualsiasi Momento - Nessun Impegno',
        startTrial: 'Inizia la Mia Prova Gratuita di 3 Giorni',
        startToday: 'Inizia Oggi',
        yearlyPricing: '3 giorni gratis, poi $39.99 all\'anno ($3.33/mese)',
        monthlyPricing: 'Solo $9.99/mese ($120/anno)',
        monthlyFeature1: 'Analisi della forma semplice',
        monthlyFeature1Description: 'Analizza la tua forma per qualsiasi movimento con solo un video',
        monthlyFeature2: 'Raggiungi i tuoi obiettivi in palestra',
        monthlyFeature2Description: 'Mettersi in forma non è mai stato così facile',
        monthlyFeature3: 'Traccia i tuoi progressi',
        monthlyFeature3Description: 'Rimani sulla strada giusta con analisi e promemoria',
      },
      createAccount: {
        title: 'Crea un account',
        signInWithApple: 'Accedi con Apple',
        signInWithGoogle: 'Accedi con Google',
      },
      cameraPermission: {
        title: 'Consenti accesso alla fotocamera',
        subtitle: 'L\'accesso alla fotocamera è richiesto per FormAI.',
        dialogText: 'FormAI vorrebbe accedere alla tua Fotocamera.',
        allow: 'Consenti',
        dontAllow: 'Non Consentire',
      },
      perfectFormGoalMessage: {
        highlighted: {
          liftHeavierSafely: 'Sollevare più peso in sicurezza',
          buildMuscleEfficiently: 'Costruire muscoli',
          avoidInjuries: 'Evitare infortuni',
          boostConfidence: 'La tua fiducia salirà alle stelle',
          trainLongerWithoutSetbacks: 'Allenarsi senza battute d\'arresto',
          default: 'I tuoi obiettivi',
        },
        rest: ' è un obiettivo garantito. Non è per niente difficile!',
        restRealistic: ' è un obiettivo realistico. Non è per niente difficile!',
        restFantastic: ' è un obiettivo fantastico. Non è per niente difficile!',
        restAfter: ' dopo. Non è per niente difficile!',
        restNormal: ' sarà normale. Non è per niente difficile!',
        restAchievable: ' sono raggiungibili con Form AI. Non è per niente difficile!',
        subtitle: 'Il 95% degli utenti dice che il cambiamento è chiaro dopo aver usato Form AI.',
      },
      potentialGraph: {
        title: 'Hai un potenziale incredibile per raggiungere il tuo obiettivo',
        chartTitle: 'La tua transizione di accuratezza',
        subtitle: 'Basandoci sui dati storici di Form AI, il miglioramento dell\'accuratezza è ritardato all\'inizio, ma dopo 14 giorni, diventerai incredibilmente costante!',
      },
      costComparison: {
        title: 'Forma perfetta a una frazione del costo usando Form AI vs allenatori',
        personalTrainer: 'Personal trainer',
        withFormAI: 'Con Form AI',
        costLess: '99% Meno',
        description: 'Avere una forma sicura e perfetta in palestra non dovrebbe costare un occhio della testa.',
      },
      gymChallengeInfo: {
        noResults: {
          headline: 'I risultati richiedono tempo, ma sei più vicino di quanto pensi.',
          message: 'Ti guideremo con il feedback giusto così il tuo duro lavoro ripagherà.',
          howWeGetYouThere: [
            'Analisi della forma per assicurare che ogni ripetizione conti',
            'Feedback video per individuare cosa ti sta frenando',
            'Tracciamento dell\'accuratezza per misurare il progresso reale nel tempo'
          ]
        },
        unsureForm: {
          headline: 'La forma viene prima.',
          message: 'Ti daremo feedback chiari così potrai allenarti in sicurezza ed efficacemente, ogni volta.',
          howWeGetYouThere: [
            'Analisi istantanea della forma dai tuoi video di allenamento',
            'Consigli attuabili per correggere gli errori rapidamente',
            'Punteggio di accuratezza per tracciare il tuo miglioramento'
          ]
        },
        worriedInjury: {
          headline: 'Allenati sicuro. Allenati forte.',
          message: 'Ti aiuteremo a sollevare con fiducia catturando i movimenti rischiosi prima che diventino infortuni.',
          howWeGetYouThere: [
            'Feedback video per evidenziare posizioni non sicure',
            'Raccomandazioni di tecniche più sicure su misura per te',
            'Tracciamento dell\'accuratezza per assicurare coerenza a lungo termine'
          ]
        },
        strugglingMotivation: {
          headline: 'La motivazione è più facile quando non lo fai da solo.',
          message: 'Ti manterremo impegnato mostrando i tuoi progressi e celebrando ogni miglioramento nella tua forma.',
          howWeGetYouThere: [
            'Punteggi di accuratezza facili da leggere dopo ogni allenamento',
            'Miglioramenti visibili con tendenze di progresso tracciate',
            'Consigli incoraggianti che ti aiutano a rimanere costante'
          ]
        },
        other: {
          headline: 'Siamo qui per il tuo viaggio.',
          message: 'Qualunque sia la tua sfida, ti daremo la guida e il supporto per superarla.',
          howWeGetYouThere: [
            'Feedback personalizzato sui tuoi video di movimento',
            'Tracciamento dell\'accuratezza attraverso diversi tipi di esercizio',
            'Consigli e approfondimenti continui per supportare i tuoi obiettivi'
          ]
        },
        howWeGetYouThereTitle: 'Ecco come ti porteremo lì'
      },
      saveProgress: {
        title: 'Crea un account',
      },
    },
    months: {
      january: 'Gennaio',
      february: 'Febbraio',
      march: 'Marzo',
      april: 'Aprile',
      may: 'Maggio',
      june: 'Giugno',
      july: 'Luglio',
      august: 'Agosto',
      september: 'Settembre',
      october: 'Ottobre',
      november: 'Novembre',
      december: 'Dicembre',
      array: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'] as const,
    },
    progress: {
      title: 'Il tuo viaggio inizia qui',
      subtitle: 'Vedi come gli utenti migliorano la loro forma e prestazioni con FormAI',
      chartTitle: 'Miglioramento del Punteggio di Forma nel Tempo',
      week: 'Settimana',
      score: 'Punteggio di Forma',
      formImprovement: 'Miglioramento della Forma',
      weeksToExcellence: 'Settimane all\'Eccellenza',
    },
    liftingGoal: {
      title: 'Qual è il tuo obiettivo?',
      subtitle: 'Questo sarà utilizzato per adattare la nostra IA per comprendere il tuo stile di sollevamento.',
      muscleBuilding: 'Costruzione muscolare',
      powerlifting: 'Powerlifting',
      toning: 'Tonificazione',
      strength: 'Forza',
      weightLoss: 'Perdita di peso',
    },
    formBarrier: {
      title: 'Cosa ti impedisce di perfezionare la tua forma di esercizio?',
      subtitle: 'Aiutaci a capire le tue sfide',
      expensiveTrainers: 'I personal trainer sono troppo costosi',
      gymAdviceScary: 'Chiedere consigli mi spaventa',
      noTime: 'Non ho tempo per perfezionare la mia forma',
      other: 'Altro',
    },
    home: {
      addTestLift: 'Aggiungi Sollevamento di Prova',
      dailyAccuracyLevel: 'Livello di accuratezza giornaliero',
      noLiftsToday: 'Nessun sollevamento oggi',
      allTimeAccuracy: 'Accuratezza di tutti i tempi',
      earnByReferring: 'Guadagna Invitando!',
      yourVideoLibrary: 'La tua libreria video',
      lifts: 'Sollevamenti recenti',
      seeAll: 'Vedi tutti',
      noRecordedLifts: 'Nessun sollevamento registrato per questa data',
      startAnalyzingWorkout: 'Inizia ad analizzare il tuo allenamento facendo un video veloce',
      dayStreak: 'Serie di {{count}} giorni',
      onFireMessage: 'Sei in fiamme! Continua così con le tue serie giornaliere.',
      zeroDayStreak: 'Serie di 0 giorni',
      noStreakMessage: 'Nessuna serie ancora. Registra in giorni consecutivi per iniziare la tua serie.',
      continue: 'Continua',
    },
    performance: {
      title: 'Progressi',
      editDateRange: 'Modifica intervallo di date',
      from: 'Da',
      to: 'A',
      reset: 'Reimposta',
      accuracy: 'Precisione',
      trend: 'Tendenza',
      apply: 'Applica',
      filterLifts: 'Filtra sollevamenti',
      timeRanges: {
        ninetyDays: '90 Giorni',
        sixMonths: '6 Mesi',
        oneYear: '1 Anno',
        allTime: 'Tutto il tempo',
      },
      chartTitles: {
        accuracyPerWeight: 'Accuratezza per peso',
        accuracyOverTime: 'Accuratezza nel tempo',
        loading: 'Caricamento...',
        noDataAvailable: 'Nessun dato disponibile',
      },
      info: {
        accuracyPerWeight: {
          title: 'Accuratezza per peso',
          message: 'Mostra l\'accuratezza media della forma per ogni peso che hai sollevato per un dato movimento. Pesi più alti possono sfidare la forma. Calcolato facendo la media dei punteggi di accuratezza per tutti i sollevamenti a ogni peso.'
        },
        accuracyOverTime: {
          title: 'Accuratezza nel tempo',
          message: 'Mostra come la tua accuratezza della forma cambia nel tempo per un movimento. Calcolato facendo la media dell\'accuratezza per ogni giorno e tracciando attraverso le date.'
        },
        accuracy: {
          title: 'Accuratezza',
          message: 'La tua accuratezza media della forma attraverso l\'intervallo di date e i filtri selezionati. Calcolato come la media dei punteggi di accuratezza per tutti i sollevamenti.'
        },
        improvement: {
          title: 'Miglioramento',
          message: 'Come la tua forma è cambiata nell\'intervallo selezionato. Confrontiamo il primo terzo dei tuoi sollevamenti con l\'ultimo terzo e mostriamo la differenza nell\'accuratezza media.'
        }
      },
      metricsFeedback: {
        title: 'Vuoi altre metriche? Faccelo sapere!',
        subtitle: 'Aiutaci a migliorare la tua esperienza',
      }
    },
    library: {
      title: 'Libreria',
      editDateRange: 'Modifica intervallo di date',
      from: 'Da',
      to: 'A',
      reset: 'Reimposta',
      apply: 'Applica',
      all: 'Tutti',
      favourites: 'Preferiti',
      noLiftsAnalysed: 'Nessun sollevamento analizzato',
      noFavouriteLifts: 'Nessun sollevamento preferito',
      noLiftsFound: 'Nessun sollevamento trovato',
      startAnalysingWorkout: 'Inizia ad analizzare l\'allenamento di oggi facendo un video veloce',
      markLiftsAsFavourites: 'Contrassegna i sollevamenti come preferiti per vederli qui',
      tryAdjustingFilters: 'Prova ad aggiustare i tuoi filtri',
      lifts: 'sollevamenti',
      lift: 'sollevamento',
      noLifts: '0',
      selectDateRange: 'Seleziona intervallo di date',
      allLifts: 'Tutti i sollevamenti',
      oneLift: '1',
      search: 'Cerca',
      liftsCount: '{{count}} Sollevamenti',
      filterByMovement: 'Filtra per movimento',
      searchMovements: 'Cerca movimenti...',
      allMovements: 'Tutti i Movimenti',
      searchAnalysis: {
        analysisFound: 'Analisi Trovata',
        analysisFoundNotFavourited: 'È stata trovata un\'analisi ma non è stata aggiunta ai preferiti.',
        continueToLift: 'Continua al Sollevamento',
        noAnalysisFound: 'Nessuna Analisi Trovata',
        noAnalysisFoundMessage: 'Nessuna analisi trovata per questo video. Assicurati che il video sia stato analizzato prima.',
        analyse: 'Analizza',
        permissionRequired: 'Permesso Richiesto',
        permissionMessage: 'Consenti l\'accesso alla tua libreria di foto per cercare video.',
        error: 'Errore',
        errorMessage: 'Impossibile selezionare il video. Riprova.',
      },
    },
    liftCard: {
      accuracy: 'Accuratezza',
    },
    loadingLift: {
      uploadingVideo: 'Caricamento video...',
      checkingVideo: 'Controllo video...',
      estimatingPose: 'Stima della posa...',
      analyzingVideo: 'Analisi video...',
      analyzingForm: 'Analisi della forma...',
      analysisFailed: 'Analisi fallita',
      processing: 'Elaborazione...',
      errorOccurred: 'Si è verificato un errore',
      pleaseTryAgain: 'Riprova',
      tapToRetry: 'Tocca per riprovare',
      notifyWhenDone: 'Ti avviseremo quando è finito!',
      noLiftFound: {
        title: 'Nessun sollevamento trovato',
        subtitle: 'Non riusciamo a rilevare un sollevamento',
      },
      liftMismatch: {
        title: 'Sollevamento non corrispondente',
        subtitle: 'Il movimento selezionato non corrisponde al video',
        detectedMovement: 'Non riusciamo a rilevarti mentre esegui: {{movement}}',
      },
    },
    feedback: {
      liftDetails: 'Dettagli del Sollevamento',
      rangeOfMotionAcrossReps: 'Ampiezza di movimento attraverso le tue ripetizioni',
      benchPress: 'Panca Piana',
      formAccuracyAcrossReps: 'Accuratezza della forma attraverso le tue ripetizioni',
      weight: 'Peso',
      reps: 'Ripetizioni',
      reviewFeedback: 'Rivedi Feedback',
      favourite: 'Preferito',
      manualDeleteLiftCardData: 'Elimina Sollevamento',
      deleteLiftTitle: 'Elimina Sollevamento',
      deleteLiftMessage: 'Sei sicuro di voler eliminare questo sollevamento? Questa azione non può essere annullata.',
      cancel: 'Annulla',
      delete: 'Elimina',
      howItWorks: 'Come funziona',
      viewFeedback: 'Visualizza Feedback',
      step1: 'La nostra IA nota momenti specifici durante il tuo sollevamento dove la tua forma può essere migliorata.',
      step2: 'Poi spiegherà cosa non era ottimale.',
      step3: 'Poi verranno dati consigli su come rimanere sicuri e migliorare!',
      step4: 'Poi, sta a te migliorare la tua forma e poi rivedere tra una settimana.',
      accuracy: 'Accuratezza',
      accuracyScore: 'Punteggio di accuratezza',
      improvements: 'miglioramenti',
      noVideoAvailable: 'Nessun video disponibile',
      deleteLiftConfirmation: 'Sei sicuro di voler eliminare questo sollevamento? Questa azione non può essere annullata.',
      lbs: 'lbs',
      kg: 'kg',
      updateFailed: {
        weight: 'Aggiornamento peso fallito',
        message: 'Riprova più tardi',
      },
    },
    common: {
      accuracy: 'Accuratezza',
      averageAccuracy: 'Accuratezza media',
      averageFormImprovement: 'Miglioramento medio della forma',
      noData: 'Nessun dato',
      selectDateRange: 'Seleziona intervallo di date',
      allLifts: 'Tutti i sollevamenti',
      oneLift: '1 Sollevamento',
      lifts: 'Sollevamenti',
      noLiftsFound: 'Nessun sollevamento trovato',
    },
    tutorial: {
      buttons: {
        previous: 'Precedente',
        next: 'Continua',
        complete: 'Completa',
        skipGuide: 'Salta tutorial',
        close: 'Chiudi',
      },
      addButton: {
        title: 'Aggiungi un sollevamento',
        description: 'Usa il pulsante aggiungi per iniziare una nuova analisi del sollevamento.',
      },
      addOptionsUpload: {
        title: 'Carica e Registra un video',
        description: 'Qui puoi caricare un video o registrarne uno nuovo tramite l\'app che verrà anche salvato nella tua libreria di foto. \\n\\nPer questa dimostrazione caricheremo un video di prova.',
      },
      uploadPracticesCta: {
        title: 'Consigli e caricamento',
        description: 'Qui puoi trovare una guida generale sulla qualità del video e su come ottenere i migliori risultati. \\n\\nIl prossimo passo aprirebbe la tua libreria di foto ma per la demo, salteremo questo passaggio.',
      },
      videoPreviewContinue: {
        title: 'Anteprima video',
        description: 'Se il video sembra buono, continua per selezionare il tipo di sollevamento.',
      },
      movementSelectionContinue: {
        title: 'Scegli un tipo di sollevamento',
        description: 'Seleziona un tipo di sollevamento accurato che ci aiuterà ad analizzare la tua forma. \\n\\nSe non riesci a trovare un sollevamento, invia un\'email al nostro team di supporto e cercheremo di integrarlo.',
      },
      weightRepsComplete: {
        title: 'Peso e ripetizioni',
        description: 'Questo sarà utilizzato per tracciare i tuoi progressi e vedere come stai migliorando nel tempo.',
      },
      homeFirstLiftCard: {
        title: 'Clicca qui per trovare la tua analisi',
        description: 'Il tuo sollevamento appare qui con la tua analisi. Toccalo per vedere feedback e approfondimenti dettagliati o scorri per eliminare.',
      },
      liftDetailsFormGraph: {
        title: 'Accuratezza della forma attraverso le tue ripetizioni',
        description: 'Questo grafico mostra come varia la tua accuratezza della forma attraverso ogni ripetizione del sollevamento.',
      },
      liftDetailsDepthGraph: {
        title: 'Ampiezza di movimento attraverso le tue ripetizioni',
        description: 'Questo grafico a barre mostra la profondità del tuo sollevamento attraverso le tue ripetizioni.',
      },
      liftDetailsReviewFeedback: {
        title: 'Rivedi il tuo feedback',
        description: 'Tocca il pulsante Rivedi Feedback per vedere analisi dettagliate e consigli per migliorare la tua forma.',
      },
      howItWorksModal: {
        title: 'Come funziona',
        description: 'Questo mostra come funziona la nostra analisi IA e come può aiutarti a migliorare la tua forma.',
      },
      feedbackSlideshow: {
        title: 'Il tuo feedback',
        description: 'I nostri sistemi IA forniscono punti specifici durante il tuo sollevamento che necessitano di miglioramento che verranno mostrati qui. Poi, i problemi rilevanti e i consigli verranno forniti per quel momento esatto. \\n\\nTocca la freccia destra per vedere il prossimo punto.',
      },
      feedbackIssues: {
        title: 'Problemi da affrontare',
        description: 'Rivedi i problemi specifici identificati nella tua forma che necessitano di attenzione. \\n\\nScolli la sovrapposizione per vedere lo screenshot del tuo video.',
      },
      feedbackTips: {
        title: 'Consigli per il miglioramento',
        description: 'Ecco consigli specifici per aiutare a migliorare la tua forma e tecnica. \\n\\nRicorda che puoi aprire e chiudere questo pannello di feedback per vedere lo screenshot del problema.',
      },
      homeSeeAllLifts: {
        title: 'Visualizza tutti i tuoi sollevamenti',
        description: 'Tocca qui per vedere tutti i tuoi sollevamenti registrati nella libreria, dove puoi filtrare, ordinare e rivedere la tua cronologia di allenamento.',
      },
      libraryScreen: {
        title: 'Schermata libreria',
        description: 'Questa è la tua libreria dove puoi visualizzare tutti i tuoi sollevamenti registrati. Usa le schede per passare tra tutti i sollevamenti e i preferiti. Ordina, filtra e cerca anche! \\n\\nTocca un sollevamento per vedere più dettagli e scorri per eliminare.',
      },
      homePerformanceIcon: {
        title: 'Le tue prestazioni',
        description: 'Tocca la scheda Prestazioni per visualizzare i tuoi progressi e le statistiche nel tempo.',
      },
      performanceMetrics: {
        title: 'Accuratezza e Miglioramento',
        description: 'Visualizza le tue metriche di accuratezza e miglioramento per tracciare i tuoi progressi nel tempo.',
      },
      performanceChartsOverWeight: {
        title: 'Accuratezza per peso',
        description: 'Questo grafico mostra la tua accuratezza rispetto al peso per aiutarti a capire i tuoi progressi nel tempo e a quale limite di peso stai performando al meglio.',
      },
      performanceChartsOverTime: {
        title: 'Accuratezza nel tempo',
        description: 'Questo grafico mostra la tua accuratezza nel tempo per aiutarti a capire i tuoi progressi. Ci aspettiamo che tu abbia un tasso positivo di miglioramento nel tempo entro 14 giorni!',
      },
      settingsFirstCard: {
        title: 'Dettagli Personali',
        description: 'Se qualcosa cambia, modifica i tuoi dettagli personali, lingua e unità preferite',
      },
      settingsSupportEmail: {
        title: 'Ottieni Supporto',
        description: 'Hai bisogno di aiuto? Tocca qui in qualsiasi momento per contattare il nostro team di supporto via email.',
      },
      completionModal: {
        title: 'Tutto fatto',
        message: 'Sei pronto per usare FormAI. Controlla ogni giorno per mantenere viva la tua serie e rimanere costante. \\n\\nRicorda che puoi sempre riprodurre questo tutorial in qualsiasi momento attraverso il menu delle impostazioni.',
      },
    },
    upload: {
      permissionRequired: 'Permesso Richiesto',
      permissionMessage: 'Concedi il permesso per accedere alla tua libreria di foto.',
      mediaPermissionTitle: 'Consenti accesso alla libreria multimediale',
      mediaPermissionDialogText: 'FormAI vorrebbe accedere alla tua Libreria Multimediale.',
      allow: 'Consenti',
      dontAllow: 'Non Consentire',
      videoTooLong: 'Video Troppo Lungo',
      videoTooLongMessage: 'Seleziona un video che sia sotto i 90 secondi.',
      videoTooShort: 'Video Troppo Corto',
      videoTooShortMessage: 'Seleziona un video che sia lungo almeno 3 secondi.',
      error: 'Errore',
      failedToSelectVideo: 'Impossibile selezionare il video. Riprova.',
      failedToGenerateThumbnail: 'Impossibile generare la miniatura del video. Riprova.',
      uploadVideo: 'Carica Video',
      selectNewVideo: 'Nuovo Video',
      duplicateVideo: 'Video Duplicato',
      duplicateVideoMessage: 'Questo video è già stato analizzato. Seleziona un video diverso.',
      selectDifferentVideo: 'Seleziona Video Diverso',
      viewAnalysis: 'Visualizza Analisi',
      tips: {
        goodLighting: 'Assicurati di avere una buona illuminazione',
        stableVideo: 'Assicurati che il video sia stabile',
        sideView: 'Fai il video di te stesso dal lato',
      },
      ok: 'OK',
      recordingFailed: 'Registrazione fallita. Riprova.',
      failedToStartRecording: 'Impossibile iniziare la registrazione. Riprova.',
      failedToFinishRecording: 'Impossibile terminare la registrazione. Riprova.',
      stopRecording: 'Fermare la Registrazione?',
      stopRecordingMessage: 'Sei sicuro di voler fermare la registrazione?',
      cancel: 'Annulla',
      stop: 'Ferma',
      accessibility: {
        flipCamera: 'Capovolgi fotocamera',
        toggleTorch: 'Attiva/disattiva torcia',
        toggleMic: 'Attiva/disattiva microfono',
        countdown: 'Conto alla rovescia',
      },
    },
  },
  pt: {
    loading: 'Carregando...',
    getStarted: 'Começar',
    signIn: 'Entrar',
    dontHaveAccount: 'Não tem uma conta?',
    startToday: 'Comece hoje',
    alreadyHaveAccount: 'Já tem uma conta?',
    perfectFormAlways: 'Forma perfeita, sempre!',
    getStartedButton: 'Começar!',
    signInButton: 'Entrar',
    next: 'Continuar',
    back: 'Voltar',
    tabs: {
      home: 'Início',
      progress: 'Progresso',
      settings: 'Configurações',
    },
    settings: {
      personalDetails: 'Detalhes Pessoais',
      language: 'Idioma',
      selectLanguage: 'Selecionar idioma',
      units: 'Alterar Unidades',
      appTheme: 'Tema do app',
      whyLowQualityVideos: 'Por que meus vídeos têm baixa qualidade?',
      referFriends: 'Indicar Amigos',
      growStrongerTogether: 'Cresçam mais fortes juntos!',
      currentBalance: 'Saldo Atual',
      shareNow: 'Compartilhar Agora',
      sharePageTitle: 'Compartilhar FormAI',
      termsAndConditions: 'Termos de Uso',
      privacyPolicy: 'Política de Privacidade',
      supportEmail: 'Email de Suporte',
      replayTutorial: 'Reproduzir Tutorial',
      leaveRating: 'Deixar uma Avaliação',
      deleteAccount: 'Excluir Conta',
      logout: 'Sair',
      save: 'Salvar',
      deleteAccountTitle: 'Excluir Conta?',
      deleteAccountMessage: 'Tem certeza de que deseja excluir permanentemente sua conta? Esta ação não pode ser desfeita e todos os dados serão excluídos.',
      deleteAccountSubscriptionWarning: 'Excluir sua conta Form AI através do app não cancela sua assinatura. Lembre-se de cancelar sua assinatura separadamente nas configurações de assinatura do seu dispositivo para não ser cobrado novamente.',
      iAcknowledge: 'Eu reconheço',
      deleteAccountButton: 'Excluir conta',
      logoutTitle: 'Sair?',
      logoutMessage: 'Tem certeza de que deseja sair? Você precisará entrar novamente para acessar sua conta.',
      no: 'Não',
      yes: 'Sim',
      editFailed: {
        gender: 'Falha ao editar gênero',
        height: 'Falha ao editar altura',
        dateOfBirth: 'Falha ao editar data de nascimento',
        currentWeight: 'Falha ao editar peso',
        unitSystem: 'Falha ao atualizar sistema de unidades',
        language: 'Falha ao atualizar idioma',
        message: 'Tente novamente mais tarde',
      },
    },
    share: {
      referYourFriends: 'Indique seus amigos',
      empowerYourFriends: 'Capacite seus amigos',
      yourPersonalPromoCode: 'Seu código promocional pessoal',
      share: 'Compartilhar',
      howItWorks: 'Como funciona',
      step1: 'Compartilhe o código com amigos',
      step2: 'Ganhe $5 por cada amigo que se inscrever em um plano anual com seu código',
      copied: 'Copiado!',
      promoCodeCopied: 'Código promocional copiado para a área de transferência',
      error: 'Erro',
      failedToCopy: 'Falha ao copiar código promocional para a área de transferência',
      failedToShare: 'Falha ao abrir diálogo de compartilhamento',
      shareMessage: 'Oi! Baixe este app e use este código promocional:',
      shareTitle: 'Baixe o FormAI!',
    },
    personalDetails: {
      currentWeight: 'Peso atual',
      weight: 'Peso',
      height: 'Altura',
      dateOfBirth: 'Data de nascimento',
      gender: 'Gênero',
      videoQuality: 'Qualidade de Vídeo',
      editCurrentWeight: 'Editar Peso Atual',
      editHeight: 'Editar Altura',
      editDateOfBirth: 'Editar Data de Nascimento',
      editGender: 'Editar Gênero',
      male: 'Masculino',
      female: 'Feminino',
    },
    add: {
      uploadVideo: 'Enviar Vídeo',
      recordVideo: 'Gravar Vídeo',
      uploadVideoDescription: 'Selecione um vídeo da sua galeria para analisar sua forma.',
      recordVideoDescription: 'Grave um novo vídeo para analisar sua forma de exercício.',
      whatExercise: 'Que exercício você estava fazendo?',
      back: 'Voltar',
      noVideoAvailable: 'Nenhum vídeo disponível',
      selectNewVideo: 'Novo vídeo',
      continue: 'Continuar',
      generalTips: 'Dicas gerais',
      searchMovements: 'Buscar movimentos...',
      useCustomMovement: 'Usar',
      bestRecordingPractices: 'Melhores práticas de gravação',
      bodyParts: {
        all: 'Todos',
        chest: 'Peito',
        back: 'Costas',
        shoulders: 'Ombros',
        arms: 'Braços',
        legs: 'Pernas',
      },
      movements: {
        'Flat Barbell Bench Press': 'Supino Reto com Barra',
        'Incline Barbell Bench Press': 'Supino Inclinado com Barra',
        'Decline Barbell Bench Press': 'Supino Declinado com Barra',
        'Flat Dumbbell Chest Press': 'Supino Reto com Halteres',
        'Incline Dumbbell Chest Press': 'Supino Inclinado com Halteres',
        'Decline Dumbbell Chest Press': 'Supino Declinado com Halteres',
        'Dumbbell Chest Fly (Incline)': 'Voador com Halteres (Inclinado)',
        'Dumbbell Chest Fly (Flat)': 'Voador com Halteres (Reto)',
        'Dumbbell Chest Fly (Decline)': 'Voador com Halteres (Declinado)',
        'Deadlift': 'Levantamento Terra',
        'Barbell Row': 'Remada com Barra',
        'Pendlay Row': 'Remada Pendlay',
        'T-Bar Row': 'Remada com Barra T',
        'Dumbbell Row': 'Remada com Halteres',
        'Single Arm Dumbbell Row': 'Remada Unilateral com Halter',
        'Overhead Barbell Press': 'Desenvolvimento com Barra',
        'Seated Dumbbell Shoulder Press': 'Desenvolvimento com Halteres Sentado',
        'Arnold Press': 'Desenvolvimento Arnold',
        'Lateral Raise (Dumbbell)': 'Elevação Lateral (Halteres)',
        'Front Raise (Dumbbell)': 'Elevação Frontal (Halteres)',
        'Upright Row': 'Remada Alta',
        'Barbell Curl': 'Rosca Direta com Barra',
        'EZ-Bar Curl': 'Rosca com Barra W',
        'Dumbbell Curl': 'Rosca com Halteres',
        'Hammer Curl': 'Rosca Martelo',
        'Incline Dumbbell Curl': 'Rosca com Halteres Inclinado',
        'Cable Curl': 'Rosca no Cabo',
        'Preacher Curl': 'Rosca Scott',
        'Skullcrusher (Barbell or EZ-Bar)': 'Tríceps Testa (Barra ou Barra W)',
        'Dumbbell Overhead Triceps Extension': 'Extensão de Tríceps com Halteres',
        'Barbell Back Squat': 'Agachamento com Barra nas Costas',
        'Barbell Front Squat': 'Agachamento Frontal com Barra',
        'Goblet Squat': 'Agachamento Goblet',
        'Dumbbell Back Squat': 'Agachamento com Halteres',
        'Romanian Deadlift (Barbell or Dumbbell)': 'Levantamento Terra Romeno (Barra ou Halteres)',
        'Stiff-Leg Deadlift': 'Levantamento Terra com Pernas Rígidas',
        'Good Morning': 'Good Morning',
        'Push Ups': 'Flexões',
      },
      recordingTips: [
        'Certifique-se de ter boa iluminação e uma câmera estável',
        'Tente se filmar de lado'
      ],
      countdown: {
        title: 'Contagem regressiva',
        off: 'Desligado',
        fiveSeconds: '5s',
        tenSeconds: '10s',
      },
    },
    welcome: {
      title: 'FormAI',
      subtitle: 'Forma perfeita, sempre',
      modal: {
        title: 'Bem-vindo',
        message: 'Obrigado por confiar no Form AI. Estamos animados para ajudar você a atingir seus objetivos.',
        ctaButton: 'Vamos te mostrar como funciona',
      },
    },
    onboarding: {
      language: {
        title: 'Idioma',
        subtitle: 'Você sempre pode mudar isso depois',
        selectLanguage: 'Selecione um idioma',
      },
      units: {
        title: 'Unidades',
        subtitle: 'Você sempre pode mudar isso depois',
        metric: 'Métrico',
        imperial: 'Imperial',
        metricDescription: 'Quilogramas e centímetros',
        imperialDescription: 'Libras, pés, polegadas',
      },
      gender: {
        title: 'Gênero biológico',
        subtitle: 'Isso será usado para ajudar nossos sistemas a encontrar a forma biomecânica ideal para você',
        male: 'Masculino',
        female: 'Feminino',
        other: 'Outro',
      },
      goal: {
        title: 'Qual é o seu objetivo?',
        subtitle: 'Isso nos ajuda a gerar um plano para sua ingestão calórica.',
        loseWeight: 'Perder peso',
        maintain: 'Manter',
        gainWeight: 'Ganhar peso',
      },
      workouts: {
        title: 'Quantos treinos você faz por semana?',
        subtitle: 'Sua frequência de treino molda seu progresso.',
        zeroToTwo: '0–2',
        zeroToTwoDescription: 'Treinos ocasionais',
        threeToFive: '3–5',
        threeToFiveDescription: 'Algumas vezes por semana',
        SixPlus: '6+',
        SixPlusDescription: 'Atleta disciplinado',
      },
      discovery: {
        title: 'Onde você ouviu falar sobre nós?',
        subtitle: 'Nos ajude a entender como você encontrou o FormAI',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        google: 'Google',
        appStore: 'App Store',
        playStore: 'Play Store',
        twitter: 'X (Twitter)',
        youtube: 'YouTube',
        friends: 'Amigos e Família',
        other: 'Outro',
      },
      personalTrainer: {
        title: 'Você tem um personal trainer?',
        subtitle: 'Isso nos ajuda a personalizar sua experiência',
        yes: 'Sim',
        no: 'Não',
      },
      trainingReason: {
        title: 'Qual é a razão #1 pela qual você treina?',
        subtitle: 'Adaptaremos sua análise de forma ao seu objetivo.',
        buildStrength: 'Ganhar força',
        improvePhysique: 'Melhorar físico',
        preventInjury: 'Prevenir lesões',
        trainForSport: 'Treinar para um esporte',
        stayActiveHealthy: 'Manter-se ativo e saudável',
      },
      gymChallenge: {
        title: 'Qual é o seu maior desafio na academia?',
        subtitle: 'Vamos focar no que é mais importante para você.',
        unsureForm: 'Não tenho certeza se minha forma está correta',
        noResults: 'Não vejo resultados',
        worriedInjury: 'Preocupado com lesões',
        strugglingMotivation: 'Lutando com motivação',
        other: 'Outro',
      },
      lifterType: {
        title: 'Como você se vê como praticante de musculação?',
        subtitle: 'Seu nível de experiência molda nossa orientação.',
        beginner: 'Iniciante, aprendendo o básico',
        intermediate: 'Intermediário, refinando técnica',
        advanced: 'Avançado, buscando performance de elite',
        returningAfterBreak: 'Retornando após uma pausa',
        injuryRehab: 'Reabilitação de lesão',
      },
      perfectFormGoal: {
        title: 'Se sua forma fosse sempre perfeita, o que você alcançaria mais rápido?',
        subtitle: 'Visualize seu progresso sem contratempos.',
        liftHeavierSafely: 'Levantar mais peso com segurança',
        buildMuscleEfficiently: 'Construir músculo eficientemente',
        avoidInjuries: 'Evitar lesões',
        boostConfidence: 'Aumentar confiança',
        trainLongerWithoutSetbacks: 'Treinar por mais tempo sem contratempos',
      },
      formConfidence: {
        title: 'Quão confiante você está na sua forma agora?',
        subtitle: 'Seja honesto, vamos te ajudar a chegar aos 100%.',
        zeroToTwentyFive: '0% - 25%',
        twentyFiveToFifty: '25% - 50%',
        fiftyToSeventyFive: '50% - 75%',
        seventyFiveToHundred: '75% - 100%',
      },
      threeMonthGoal: {
        title: 'Em 3 meses, onde você quer estar?',
        subtitle: 'Sua jornada começa com a verificação de forma de hoje.',
        liftingHeavier: 'Levantando mais peso',
        lookingLeaner: 'Parecendo mais magro',
        feelingStrongerInjuryFree: 'Sentindo-se mais forte e sem lesões',
        moreConsistent: 'Mais consistente',
        moreConfident: 'Mais confiante',
      },
      measurements: {
        title: 'Altura e Peso',
        subtitle: 'Isso nos ajuda a fornecer recomendações personalizadas',
        height: 'Altura',
        weight: 'Peso',
        metric: 'Métrico',
        imperial: 'Imperial',
        cm: 'cm',
        ft: 'pés',
        in: 'pol',
        kg: 'kg',
        lbs: 'lbs',
      },
      birthDate: {
        title: 'Quando você nasceu?',
        subtitle: 'Isso nos ajuda a fornecer recomendações apropriadas para a idade',
        month: 'Mês',
        day: 'Dia',
        year: 'Ano',
      },
      rating: {
        title: 'Nos dê uma avaliação',
        subtitle: 'Nos ajude a melhorar compartilhando sua experiência',
        skip: 'Pular',
        middleText: 'FormAI foi feito para amantes da academia como você!',
      },
      referralCode: {
        title: 'Digite o código de indicação (Opcional)',
        subtitle: 'Você pode pular esta etapa.',
        placeholder: 'Código de Indicação',
        skip: 'Pular',
        submit: 'Enviar',
        success: 'Código de indicação aplicado com sucesso',
        error: 'Código de indicação inválido. Tente novamente.',
      },
      allDone: {
        title: 'Tudo pronto!',
        allDone: 'Tudo pronto!',
        thankYou: 'Obrigado por confiar em nós',
        privacy: 'Prometemos sempre manter suas informações pessoais privadas e seguras.',
      },
      trainSafer: {
        title: 'Treine com três vezes menos chance de lesão com Form AI vs sozinho',
        withoutFormAI: 'Sem Form AI',
        withFormAI: 'Com Form AI',
        description: 'FormAI torna fácil aperfeiçoar sua forma e te manter responsável.',
      },
      notificationPermission: {
        title: 'Alcance seus objetivos com notificações',
        dialogText: 'FormAI gostaria de te enviar Notificações',
        allow: 'Permitir',
        dontAllow: 'Não Permitir',
      },
      setupLoading: {
        title: '',
        mainTitle: 'Estamos configurando tudo para você',
        step1: 'Configurando seu perfil...',
        step2: 'Quase pronto...',
      },
      freeTrial: {
        title: 'Queremos que você experimente o FormAI gratuitamente.',
        noPaymentDue: 'Nenhum Pagamento Devido Agora',
        tryForFree: 'Experimente por $0.00',
        pricing: 'Apenas $39.99 por ano ($3.33/mês)',
      },
      notificationReminder: {
        title: 'Enviaremos um\\nlembrete antes do seu\\nteste gratuito acabar',
        noPaymentDue: 'Nenhum Pagamento Devido Agora',
        continueForFree: 'Continue GRÁTIS',
        pricing: 'Apenas $39.99 por ano ($3.33/mês)',
      },
      subscriptionSelection: {
        title: 'Inicie seu teste GRATUITO de 3 dias para continuar.',
        titleMonthly: 'Desbloqueie o FormAI para alcançar seus objetivos mais rápido',
        today: 'Hoje',
        todayDescription: 'Desbloqueie todas as funcionalidades do app como análise de forma com IA e mais.',
        reminder: 'Em 2 Dias - Lembrete',
        reminderDescription: 'Enviaremos um lembrete de que seu teste está acabando em breve.',
        billing: 'Em 3 Dias - Início da Cobrança',
        billingDescription: 'Você será cobrado em {{billingDate}} a menos que cancele a qualquer momento antes.',
        monthly: 'Mensal',
        monthlyPrice: '$9.99/mês',
        yearly: 'Anual',
        yearlyPrice: '$3.33/mês',
        freeTag: '3 DIAS GRÁTIS',
        noPaymentDue: 'Nenhum Pagamento Devido Agora',
        cancelAnytime: 'Cancele a Qualquer Momento - Sem Compromisso',
        startTrial: 'Iniciar Meu Teste Gratuito de 3 Dias',
        startToday: 'Começar Hoje',
        yearlyPricing: '3 dias grátis, depois $39.99 por ano ($3.33/mês)',
        monthlyPricing: 'Apenas $9.99/mês ($120/ano)',
        monthlyFeature1: 'Análise de forma simples',
        monthlyFeature1Description: 'Analise sua forma para qualquer movimento com apenas um vídeo',
        monthlyFeature2: 'Alcance seus objetivos na academia',
        monthlyFeature2Description: 'Entrar em forma nunca foi tão fácil',
        monthlyFeature3: 'Acompanhe seu progresso',
        monthlyFeature3Description: 'Mantenha-se no caminho certo com análises e lembretes',
      },
      createAccount: {
        title: 'Criar uma conta',
        signInWithApple: 'Entrar com Apple',
        signInWithGoogle: 'Entrar com Google',
      },
      cameraPermission: {
        title: 'Permitir acesso à câmera',
        subtitle: 'Acesso à câmera é necessário para o FormAI.',
        dialogText: 'FormAI gostaria de acessar sua Câmera.',
        allow: 'Permitir',
        dontAllow: 'Não Permitir',
      },
      perfectFormGoalMessage: {
        highlighted: {
          liftHeavierSafely: 'Levantar mais peso com segurança',
          buildMuscleEfficiently: 'Construir músculo',
          avoidInjuries: 'Evitar lesões',
          boostConfidence: 'Sua confiança vai disparar',
          trainLongerWithoutSetbacks: 'Treinar sem contratempos',
          default: 'Seus objetivos',
        },
        rest: ' é um objetivo garantido. Não é nada difícil!',
        restRealistic: ' é um objetivo realista. Não é nada difícil!',
        restFantastic: ' é um objetivo fantástico. Não é nada difícil!',
        restAfter: ' depois. Não é nada difícil!',
        restNormal: ' será normal. Não é nada difícil!',
        restAchievable: ' são alcançáveis com Form AI. Não é nada difícil!',
        subtitle: '95% dos usuários dizem que a mudança é clara após usar Form AI.',
      },
      potentialGraph: {
        title: 'Você tem um potencial incrível para esmagar seu objetivo',
        chartTitle: 'Sua transição de precisão',
        subtitle: 'Baseado nos dados históricos do Form AI, a melhoria da precisão é atrasada no início, mas após 14 dias, você se tornará incrivelmente consistente!',
      },
      costComparison: {
        title: 'Forma perfeita por uma fração do custo usando Form AI vs personal trainers',
        personalTrainer: 'Personal trainer',
        withFormAI: 'Com Form AI',
        costLess: '99% Menos',
        description: 'Ter forma segura e perfeita na academia não deveria custar os olhos da cara.',
      },
      gymChallengeInfo: {
        noResults: {
          headline: 'Resultados levam tempo, mas você está mais perto do que pensa.',
          message: 'Vamos te guiar com o feedback certo para que seu trabalho duro compense.',
          howWeGetYouThere: [
            'Análise de forma para garantir que cada repetição conte',
            'Feedback de vídeo para detectar o que está te atrapalhando',
            'Rastreamento de precisão para medir progresso real ao longo do tempo'
          ]
        },
        unsureForm: {
          headline: 'Forma vem primeiro.',
          message: 'Daremos feedback claro para que você possa treinar com segurança e eficácia, sempre.',
          howWeGetYouThere: [
            'Análise instantânea de forma dos seus vídeos de treino',
            'Dicas acionáveis para corrigir erros rapidamente',
            'Pontuação de precisão para acompanhar sua melhoria'
          ]
        },
        worriedInjury: {
          headline: 'Treine seguro. Treine forte.',
          message: 'Vamos te ajudar a levantar com confiança capturando movimentos arriscados antes que se tornem lesões.',
          howWeGetYouThere: [
            'Feedback de vídeo para destacar posições inseguras',
            'Recomendações de técnicas mais seguras personalizadas para você',
            'Rastreamento de precisão para garantir consistência a longo prazo'
          ]
        },
        strugglingMotivation: {
          headline: 'Motivação é mais fácil quando você não faz isso sozinho.',
          message: 'Vamos te manter engajado mostrando seu progresso e celebrando cada melhoria na sua forma.',
          howWeGetYouThere: [
            'Pontuações de precisão fáceis de ler após cada treino',
            'Melhorias visíveis com tendências de progresso rastreadas',
            'Dicas encorajadoras que te ajudam a manter consistência'
          ]
        },
        other: {
          headline: 'Estamos aqui para sua jornada.',
          message: 'Qualquer que seja seu desafio, daremos orientação e suporte para superá-lo.',
          howWeGetYouThere: [
            'Feedback personalizado nos seus vídeos de movimento',
            'Rastreamento de precisão através de diferentes tipos de exercício',
            'Dicas e insights contínuos para apoiar seus objetivos'
          ]
        },
        howWeGetYouThereTitle: 'Veja como vamos te levar lá'
      },
      saveProgress: {
        title: 'Criar uma conta',
      },
    },
    months: {
      january: 'Janeiro',
      february: 'Fevereiro',
      march: 'Março',
      april: 'Abril',
      may: 'Maio',
      june: 'Junho',
      july: 'Julho',
      august: 'Agosto',
      september: 'Setembro',
      october: 'Outubro',
      november: 'Novembro',
      december: 'Dezembro',
      array: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] as const,
    },
    progress: {
      title: 'Sua jornada começa aqui',
      subtitle: 'Veja como os usuários melhoram sua forma e performance com FormAI',
      chartTitle: 'Melhoria da Pontuação de Forma ao Longo do Tempo',
      week: 'Semana',
      score: 'Pontuação de Forma',
      formImprovement: 'Melhoria da Forma',
      weeksToExcellence: 'Semanas para Excelência',
    },
    liftingGoal: {
      title: 'Qual é o seu objetivo?',
      subtitle: 'Isso será usado para adaptar nossa IA para entender seu estilo de levantamento.',
      muscleBuilding: 'Ganho de massa muscular',
      powerlifting: 'Powerlifting',
      toning: 'Tonificação',
      strength: 'Força',
      weightLoss: 'Perda de peso',
    },
    formBarrier: {
      title: 'O que te impede de aperfeiçoar sua forma de exercício?',
      subtitle: 'Nos ajude a entender seus desafios',
      expensiveTrainers: 'Personal trainers são muito caros',
      gymAdviceScary: 'Pedir conselhos me assusta',
      noTime: 'Não tenho tempo para aperfeiçoar minha forma',
      other: 'Outro',
    },
    home: {
      addTestLift: 'Adicionar Levantamento Teste',
      dailyAccuracyLevel: 'Nível de precisão diário',
      noLiftsToday: 'Nenhum levantamento hoje',
      allTimeAccuracy: 'Precisão de todos os tempos',
      earnByReferring: 'Ganhe Indicando!',
      yourVideoLibrary: 'Sua biblioteca de vídeos',
      lifts: 'Levantamentos recentes',
      seeAll: 'Ver todos',
      noRecordedLifts: 'Nenhum levantamento gravado para esta data',
      startAnalyzingWorkout: 'Comece a analisar seu treino fazendo um vídeo rápido',
      dayStreak: 'Sequência de {{count}} dias',
      onFireMessage: 'Você está pegando fogo! Continue com o ótimo trabalho com suas sequências diárias.',
      zeroDayStreak: 'Sequência de 0 dias',
      noStreakMessage: 'Ainda sem sequência. Grave em dias consecutivos para começar sua sequência.',
      continue: 'Continuar',
    },
    performance: {
      title: 'Progresso',
      editDateRange: 'Editar intervalo de datas',
      from: 'De',
      to: 'Para',
      reset: 'Redefinir',
      apply: 'Aplicar',
      filterLifts: 'Filtrar levantamentos',
      timeRanges: {
        ninetyDays: '90 Dias',
        sixMonths: '6 Meses',
        oneYear: '1 Ano',
        allTime: 'Todo o tempo',
      },
      chartTitles: {
        accuracyPerWeight: 'Precisão por peso',
        accuracyOverTime: 'Precisão ao longo do tempo',
        loading: 'Carregando...',
        noDataAvailable: 'Nenhum dado disponível',
      },
      info: {
        accuracyPerWeight: {
          title: 'Precisão por peso',
          message: 'Mostra a precisão média de forma para cada peso que você levantou para um determinado movimento. Pesos mais altos podem desafiar a forma. Calculado pela média das pontuações de precisão para todos os levantamentos em cada peso.'
        },
        accuracyOverTime: {
          title: 'Precisão ao longo do tempo',
          message: 'Mostra como sua precisão de forma muda ao longo do tempo para um movimento. Calculado pela média da precisão para cada dia e plotagem através das datas.'
        },
        accuracy: {
          title: 'Precisão',
          message: 'Sua precisão média de forma através do intervalo de datas e filtros selecionados. Calculado como a média das pontuações de precisão para todos os levantamentos.'
        },
        improvement: {
          title: 'Melhoria',
          message: 'Como sua forma mudou ao longo do intervalo selecionado. Comparamos o primeiro terço dos seus levantamentos com o último terço e mostramos a diferença na precisão média.'
        }
      },
      metricsFeedback: {
        title: 'Quer outras métricas? Nos avise!',
        subtitle: 'Nos ajude a melhorar sua experiência',
      }
    },
    library: {
      title: 'Biblioteca',
      editDateRange: 'Editar intervalo de datas',
      from: 'De',
      to: 'Para',
      reset: 'Redefinir',
      apply: 'Aplicar',
      all: 'Todos',
      favourites: 'Favoritos',
      noLiftsAnalysed: 'Nenhum levantamento analisado',
      noFavouriteLifts: 'Nenhum levantamento favorito',
      noLiftsFound: 'Nenhum levantamento encontrado',
      startAnalysingWorkout: 'Comece a analisar o treino de hoje fazendo um vídeo rápido',
      markLiftsAsFavourites: 'Marque levantamentos como favoritos para vê-los aqui',
      tryAdjustingFilters: 'Tente ajustar seus filtros',
      lifts: 'levantamentos',
      lift: 'levantamento',
      noLifts: '0',
      selectDateRange: 'Selecionar intervalo de datas',
      allLifts: 'Todos os levantamentos',
      oneLift: '1',
      search: 'Buscar',
      liftsCount: '{{count}} Levantamentos',
      filterByMovement: 'Filtrar por movimento',
      searchMovements: 'Buscar movimentos...',
      allMovements: 'Todos os Movimentos',
      searchAnalysis: {
        analysisFound: 'Análise Encontrada',
        analysisFoundNotFavourited: 'Uma análise foi encontrada mas não foi favoritada.',
        continueToLift: 'Continuar para Levantamento',
        noAnalysisFound: 'Nenhuma Análise Encontrada',
        noAnalysisFoundMessage: 'Nenhuma análise encontrada para este vídeo. Certifique-se de que o vídeo foi analisado antes.',
        analyse: 'Analisar',
        permissionRequired: 'Permissão Necessária',
        permissionMessage: 'Por favor permita acesso à sua biblioteca de fotos para buscar vídeos.',
        error: 'Erro',
        errorMessage: 'Falha ao selecionar vídeo. Tente novamente.',
      },
    },
    liftCard: {
      accuracy: 'Precisão',
    },
    loadingLift: {
      uploadingVideo: 'Enviando vídeo...',
      checkingVideo: 'Verificando vídeo...',
      estimatingPose: 'Estimando postura...',
      analyzingVideo: 'Analisando vídeo...',
      analyzingForm: 'Analisando forma...',
      analysisFailed: 'Análise falhou',
      processing: 'Processando...',
      errorOccurred: 'Ocorreu um erro',
      pleaseTryAgain: 'Tente novamente',
      tapToRetry: 'Toque para tentar novamente',
      notifyWhenDone: 'Vamos te notificar quando terminar!',
      noLiftFound: {
        title: 'Nenhum levantamento encontrado',
        subtitle: 'Não conseguimos detectar um levantamento',
      },
      liftMismatch: {
        title: 'Levantamento não corresponde',
        subtitle: 'O movimento selecionado não corresponde ao vídeo',
        detectedMovement: 'Não conseguimos detectar você executando: {{movement}}',
      },
    },
    feedback: {
      liftDetails: 'Detalhes do Levantamento',
      rangeOfMotionAcrossReps: 'Amplitude de movimento através das suas repetições',
      benchPress: 'Supino',
      formAccuracyAcrossReps: 'Precisão de forma através das suas repetições',
      weight: 'Peso',
      reps: 'Repetições',
      reviewFeedback: 'Revisar Feedback',
      favourite: 'Favorito',
      manualDeleteLiftCardData: 'Excluir Levantamento',
      deleteLiftTitle: 'Excluir Levantamento',
      deleteLiftMessage: 'Tem certeza de que deseja excluir este levantamento? Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      delete: 'Excluir',
      howItWorks: 'Como funciona',
      viewFeedback: 'Ver Feedback',
      step1: 'Nossa IA nota momentos específicos durante seu levantamento onde sua forma pode ser melhorada.',
      step2: 'Então explicará o que não estava ideal.',
      step3: 'Dicas sobre como manter-se seguro e melhorar serão então dadas!',
      step4: 'Então, cabe a você melhorar sua forma e depois revisar em uma semana.',
      accuracy: 'Precisão',
      accuracyScore: 'Pontuação de precisão',
      improvements: 'melhorias',
      noVideoAvailable: 'Nenhum vídeo disponível',
      deleteLiftConfirmation: 'Tem certeza de que deseja excluir este levantamento? Esta ação não pode ser desfeita.',
      lbs: 'lbs',
      kg: 'kg',
      updateFailed: {
        weight: 'Falha ao atualizar peso',
        message: 'Tente novamente mais tarde',
      },
    },
    common: {
      accuracy: 'Precisão',
      averageAccuracy: 'Precisão média',
      averageFormImprovement: 'Melhoria média da forma',
      noData: 'Nenhum dado',
      selectDateRange: 'Selecionar intervalo de datas',
      allLifts: 'Todos os levantamentos',
      oneLift: '1 Levantamento',
      lifts: 'Levantamentos',
      noLiftsFound: 'Nenhum levantamento encontrado',
    },
    tutorial: {
      buttons: {
        previous: 'Anterior',
        next: 'Continuar',
        complete: 'Completar',
        skipGuide: 'Pular tutorial',
        close: 'Fechar',
      },
      addButton: {
        title: 'Adicionar um levantamento',
        description: 'Use o botão adicionar para iniciar uma nova análise de levantamento.',
      },
      addOptionsUpload: {
        title: 'Enviar e Gravar um vídeo',
        description: 'Aqui você pode enviar um vídeo ou gravar um novo através do app que também será salvo na sua biblioteca de fotos. \\n\\nPara esta demonstração vamos enviar um vídeo de demonstração.',
      },
      uploadPracticesCta: {
        title: 'Dicas e envio',
        description: 'Aqui você pode encontrar orientação geral sobre qualidade de vídeo e como obter os melhores resultados. \\n\\nO próximo passo abriria sua biblioteca de fotos mas para a demonstração, pularemos esta etapa.',
      },
      videoPreviewContinue: {
        title: 'Prévia do vídeo',
        description: 'Se o vídeo parecer bom, continue para selecionar o tipo de levantamento.',
      },
      movementSelectionContinue: {
        title: 'Escolha um tipo de levantamento',
        description: 'Por favor selecione um tipo de levantamento preciso que nos ajudará a analisar sua forma. \\n\\nSe você não conseguir encontrar um levantamento, envie um email para nossa equipe de suporte e buscaremos integrá-lo.',
      },
      weightRepsComplete: {
        title: 'Peso e repetições',
        description: 'Isso será usado para acompanhar seu progresso e ver como você está melhorando ao longo do tempo.',
      },
      homeFirstLiftCard: {
        title: 'Clique aqui para encontrar sua análise',
        description: 'Seu levantamento aparece aqui com sua análise. Toque nele para ver feedback detalhado e insights ou deslize para excluir.',
      },
      liftDetailsFormGraph: {
        title: 'Precisão de forma através das suas repetições',
        description: 'Este gráfico mostra como sua precisão de forma varia através de cada repetição do levantamento.',
      },
      liftDetailsDepthGraph: {
        title: 'Amplitude de movimento através das suas repetições',
        description: 'Este gráfico de barras mostra a profundidade do seu levantamento através das suas repetições.',
      },
      liftDetailsReviewFeedback: {
        title: 'Revise seu feedback',
        description: 'Toque no botão Revisar Feedback para ver análise detalhada e dicas para melhorar sua forma.',
      },
      howItWorksModal: {
        title: 'Como funciona',
        description: 'Isso mostra como nossa análise de IA funciona e como pode te ajudar a melhorar sua forma.',
      },
      feedbackSlideshow: {
        title: 'Seu feedback',
        description: 'Nossos sistemas de IA fornecem pontos específicos durante seu levantamento que precisam de melhoria que aparecerão aqui. Então, os problemas relevantes e dicas serão fornecidos para aquele momento exato. \\n\\nToque na seta direita para ver o próximo ponto.',
      },
      feedbackIssues: {
        title: 'Problemas a abordar',
        description: 'Revise os problemas específicos identificados na sua forma que precisam de atenção. \\n\\nDeslize a sobreposição para ver a captura de tela do seu vídeo.',
      },
      feedbackTips: {
        title: 'Dicas de melhoria',
        description: 'Aqui estão dicas específicas para ajudar a melhorar sua forma e técnica. \\n\\nLembre-se que você pode abrir e fechar este painel de feedback para ver a captura de tela do problema.',
      },
      homeSeeAllLifts: {
        title: 'Ver todos os seus levantamentos',
        description: 'Toque aqui para ver todos os seus levantamentos gravados na biblioteca, onde você pode filtrar, ordenar e revisar seu histórico de treinos.',
      },
      libraryScreen: {
        title: 'Tela da biblioteca',
        description: 'Esta é sua biblioteca onde você pode ver todos os seus levantamentos gravados. Use as abas para alternar entre todos os levantamentos e favoritos. Ordene, filtre e busque também! \\n\\nToque em um levantamento para ver mais detalhes e deslize para excluir.',
      },
      homePerformanceIcon: {
        title: 'Sua performance',
        description: 'Toque na aba Performance para ver seu progresso e estatísticas ao longo do tempo.',
      },
      performanceMetrics: {
        title: 'Precisão e Melhoria',
        description: 'Veja suas métricas de precisão e melhoria para acompanhar seu progresso ao longo do tempo.',
      },
      performanceChartsOverWeight: {
        title: 'Precisão por peso',
        description: 'Este gráfico mostra sua precisão sobre peso para te ajudar a entender seu progresso ao longo do tempo e em que limite de peso você está performando melhor.',
      },
      performanceChartsOverTime: {
        title: 'Precisão ao longo do tempo',
        description: 'Este gráfico mostra sua precisão ao longo do tempo para te ajudar a entender seu progresso. Esperamos que você tenha uma taxa positiva de melhoria ao longo do tempo dentro de 14 dias!',
      },
      settingsFirstCard: {
        title: 'Detalhes Pessoais',
        description: 'Se algo mudar, edite seus detalhes pessoais, idioma e unidades preferidas',
      },
      settingsSupportEmail: {
        title: 'Obter Suporte',
        description: 'Precisa de ajuda? Toque aqui a qualquer momento para contatar nossa equipe de suporte por email.',
      },
      completionModal: {
        title: 'Tudo pronto',
        message: 'Você está pronto para usar o FormAI. Verifique todos os dias para manter sua sequência viva e permanecer consistente. \\n\\nLembre-se que você sempre pode reproduzir este tutorial a qualquer momento através do menu de configurações.',
      },
    },
    upload: {
      permissionRequired: 'Permissão Necessária',
      permissionMessage: 'Por favor conceda permissão para acessar sua biblioteca de fotos.',
      mediaPermissionTitle: 'Permitir acesso à biblioteca de mídia',
      mediaPermissionDialogText: 'FormAI gostaria de acessar sua Biblioteca de Mídia.',
      allow: 'Permitir',
      dontAllow: 'Não Permitir',
      videoTooLong: 'Vídeo Muito Longo',
      videoTooLongMessage: 'Por favor selecione um vídeo com menos de 90 segundos.',
      videoTooShort: 'Vídeo Muito Curto',
      videoTooShortMessage: 'Por favor selecione um vídeo com pelo menos 3 segundos de duração.',
      error: 'Erro',
      failedToSelectVideo: 'Falha ao selecionar vídeo. Tente novamente.',
      failedToGenerateThumbnail: 'Falha ao gerar miniatura do vídeo. Tente novamente.',
      uploadVideo: 'Enviar Vídeo',
      selectNewVideo: 'Novo Vídeo',
      duplicateVideo: 'Vídeo Duplicado',
      duplicateVideoMessage: 'Este vídeo já foi analisado. Por favor selecione um vídeo diferente.',
      selectDifferentVideo: 'Selecionar Vídeo Diferente',
      viewAnalysis: 'Ver Análise',
      tips: {
        goodLighting: 'Certifique-se de ter boa iluminação',
        stableVideo: 'Certifique-se de que o vídeo esteja estável',
        sideView: 'Filme-se de lado',
      },
      ok: 'OK',
      recordingFailed: 'Gravação falhou. Tente novamente.',
      failedToStartRecording: 'Falha ao iniciar gravação. Tente novamente.',
      failedToFinishRecording: 'Falha ao finalizar gravação. Tente novamente.',
      stopRecording: 'Parar Gravação?',
      stopRecordingMessage: 'Tem certeza de que deseja parar a gravação?',
      cancel: 'Cancelar',
      stop: 'Parar',
      accessibility: {
        flipCamera: 'Virar câmera',
        toggleTorch: 'Alternar lanterna',
        toggleMic: 'Alternar microfone',
        countdown: 'Contagem regressiva',
      },
    },
  },
  ro: {
    "loading": "Se încarcă...",
    "getStarted": "Începe",
    "signIn": "Autentificare",
    "dontHaveAccount": "Nu ai un cont?",
    "startToday": "Începe astăzi",
    "alreadyHaveAccount": "Ai deja un cont?",
    "next": "Continuă",
    "back": "Înapoi",
    "tabs": {
      "home": "Acasă",
      "progress": "Progres",
      "settings": "Setări"
    },
    "settings": {
      "personalDetails": "Date personale",
      "language": "Limbă",
      "selectLanguage": "Selectează limba",
      "units": "Schimbă unitățile",
      "appTheme": "Temă aplicație",
      "whyLowQualityVideos": "De ce au videoclipurile o calitate scăzută?",
      "referFriends": "Recomandă prietenilor",
      "growStrongerTogether": "Deveniți mai puternici împreună!",
      "currentBalance": "Sold curent",
      "shareNow": "Distribuie acum",
      "sharePageTitle": "Distribuie FormAI",
      "termsAndConditions": "Termeni de utilizare",
      "privacyPolicy": "Politica de confidențialitate",
      "supportEmail": "E-mail suport",
      "replayTutorial": "Redă din nou tutorialul",
      "leaveRating": "Lasă o recenzie",
      "deleteAccount": "Șterge contul",
      "logout": "Deconectare",
      "save": "Salvează",
      "deleteAccountTitle": "Ștergi contul?",
      "deleteAccountMessage": "Ești sigur că vrei să ștergi definitiv contul? Această acțiune nu poate fi anulată și toate datele vor fi șterse.",
      "deleteAccountSubscriptionWarning": "Ștergerea contului Form AI din aplicație nu anulează abonamentul. Nu uita să-l anulezi separat din setările de abonamente ale dispozitivului pentru a evita costuri ulterioare.",
      "iAcknowledge": "Confirm",
      "deleteAccountButton": "Șterge contul",
      "logoutTitle": "Te deconectezi?",
      "logoutMessage": "Sigur vrei să te deconectezi? Va trebui să te autentifici din nou pentru a accesa contul.",
      "no": "Nu",
      "yes": "Da",
      "editFailed": {
        "gender": "Modificarea genului a eșuat",
        "height": "Modificarea înălțimii a eșuat",
        "dateOfBirth": "Modificarea datei nașterii a eșuat",
        "currentWeight": "Modificarea greutății a eșuat",
        "unitSystem": "Actualizarea sistemului de unități a eșuat",
        "language": "Actualizarea limbii a eșuat",
        "message": "Te rugăm să încerci mai târziu"
      }
    },
    "share": {
      "referYourFriends": "Recomandă prietenilor",
      "empowerYourFriends": "Inspiră-ți prietenii",
      "yourPersonalPromoCode": "Codul tău promo personal",
      "share": "Distribuie",
      "howItWorks": "Cum funcționează",
      "step1": "Distribuie codul prietenilor",
      "step2": "Câștigă 5 $ pentru fiecare prieten care se abonează anual cu codul tău",
      "copied": "Copiat!",
      "promoCodeCopied": "Codul promo a fost copiat în clipboard",
      "error": "Eroare",
      "failedToCopy": "Copierea codului promo a eșuat",
      "failedToShare": "Deschiderea ferestrei de partajare a eșuat",
      "shareMessage": "Hei! Descarcă aplicația și folosește acest cod promo:",
      "shareTitle": "Descarcă FormAI!"
    },
    "personalDetails": {
      "currentWeight": "Greutate actuală",
      "weight": "Greutate",
      "height": "Înălțime",
      "dateOfBirth": "Data nașterii",
      "gender": "Gen",
      "videoQuality": "Calitate video",
      "editCurrentWeight": "Editează greutatea actuală",
      "editHeight": "Editează înălțimea",
      "editDateOfBirth": "Editează data nașterii",
      "editGender": "Editează genul",
      "male": "Masculin",
      "female": "Feminin"
    },
    "add": {
      "uploadVideo": "Încarcă video",
      "recordVideo": "Înregistrează video",
      "uploadVideoDescription": "Selectează un video din galerie pentru a-ți analiza forma.",
      "recordVideoDescription": "Înregistrează un video nou pentru a-ți analiza tehnica exercițiului.",
      "whatExercise": "Ce exercițiu executai?",
      "back": "Înapoi",
      "noVideoAvailable": "Niciun video disponibil",
      "selectNewVideo": "Video nou",
      "continue": "Continuă",
      "generalTips": "Sfaturi generale",
      "searchMovements": "Caută mișcări...",
      "useCustomMovement": "Folosește",
      "bestRecordingPractices": "Cele mai bune practici de filmare",
      "bodyParts": {
        "all": "Toate",
        "chest": "Piept",
        "back": "Spate",
        "shoulders": "Umeri",
        "arms": "Brațe",
        "legs": "Picioare"
      },
      "movements": {
        "Flat Barbell Bench Press": "Împins la piept cu haltera (plan drept)",
        "Incline Barbell Bench Press": "Împins la piept înclinat cu haltera",
        "Decline Barbell Bench Press": "Împins la piept declinat cu haltera",
        "Flat Dumbbell Chest Press": "Împins la piept cu gantere (plan drept)",
        "Incline Dumbbell Chest Press": "Împins la piept înclinat cu gantere",
        "Decline Dumbbell Chest Press": "Împins la piept declinat cu gantere",
        "Dumbbell Chest Fly (Incline)": "Fluturări gantere piept (înclinat)",
        "Dumbbell Chest Fly (Flat)": "Fluturări gantere piept (drept)",
        "Dumbbell Chest Fly (Decline)": "Fluturări gantere piept (declinat)",
        "Deadlift": "Îndreptări",
        "Barbell Row": "Ramat cu haltera",
        "Pendlay Row": "Ramat Pendlay",
        "T-Bar Row": "Ramat la T-Bar",
        "Dumbbell Row": "Ramat cu gantera",
        "Single Arm Dumbbell Row": "Ramat cu o mână cu gantera",
        "Overhead Barbell Press": "Împins deasupra capului cu haltera",
        "Seated Dumbbell Shoulder Press": "Împins umeri la șezut cu gantere",
        "Arnold Press": "Presa Arnold",
        "Lateral Raise (Dumbbell)": "Ridicări laterale (gantere)",
        "Front Raise (Dumbbell)": "Ridicări frontale (gantere)",
        "Upright Row": "Ramat vertical",
        "Barbell Curl": "Flexii cu haltera",
        "EZ-Bar Curl": "Flexii cu bara EZ",
        "Dumbbell Curl": "Flexii cu gantere",
        "Hammer Curl": "Flexii ciocan",
        "Incline Dumbbell Curl": "Flexii înclinat cu gantere",
        "Cable Curl": "Flexii la scripete",
        "Preacher Curl": "Flexii la banca Scott",
        "Skullcrusher (Barbell or EZ-Bar)": "Extensii triceps la frunte (bară/EZ)",
        "Dumbbell Overhead Triceps Extension": "Extensii triceps deasupra capului (ganteră)",
        "Barbell Back Squat": "Genuflexiuni cu haltera la spate",
        "Barbell Front Squat": "Genuflexiuni frontale cu haltera",
        "Goblet Squat": "Genuflexiuni Goblet",
        "Dumbbell Back Squat": "Genuflexiuni cu gantere",
        "Romanian Deadlift (Barbell or Dumbbell)": "Îndreptări românești (haltera/gantere)",
        "Stiff-Leg Deadlift": "Îndreptări cu picioare întinse",
        "Good Morning": "Good Morning",
        "Push Ups": "Flotări"
      },
      "recordingTips": [
        "Asigură iluminare bună și cameră stabilă",
        "Încearcă să te filmezi din lateral"
      ],
      "countdown": {
        "title": "Numărătoare inversă",
        "off": "Oprit",
        "fiveSeconds": "5 s",
        "tenSeconds": "10 s"
      }
    },
    "welcome": {
      "title": "FormAI",
      "subtitle": "Formă perfectă, mereu",
      "modal": {
        "title": "Bun venit",
        "message": "Îți mulțumim pentru încrederea acordată Form AI. Suntem încântați să te ajutăm să-ți atingi obiectivele.",
        "ctaButton": "Hai să-ți arătăm aplicația"
      }
    },
    "onboarding": {
      "language": {
        "title": "Limbă",
        "subtitle": "Poți schimba oricând mai târziu",
        "selectLanguage": "Selectează o limbă"
      },
      "units": {
        "title": "Unități",
        "subtitle": "Poți schimba oricând mai târziu",
        "metric": "Metric",
        "imperial": "Imperial",
        "metricDescription": "Kilograme și centimetri",
        "imperialDescription": "Livre, picioare, inci"
      },
      "gender": {
        "title": "Gen biologic",
        "subtitle": "Ne ajută să găsim biomecanica optimă pentru tine",
        "male": "Masculin",
        "female": "Feminin",
        "other": "Altul"
      },
      "goal": {
        "title": "Care este obiectivul tău?",
        "subtitle": "Ne ajută să generăm un plan de calorii.",
        "loseWeight": "Slăbire",
        "maintain": "Menținere",
        "gainWeight": "Creștere în greutate"
      },
      "workouts": {
        "title": "Câte antrenamente faci pe săptămână?",
        "subtitle": "Frecvența îți modelează progresul.",
        "zeroToTwo": "0–2",
        "zeroToTwoDescription": "Antrenamente ocazionale",
        "threeToFive": "3–5",
        "threeToFiveDescription": "De câteva ori pe săptămână",
        "SixPlus": "6+",
        "SixPlusDescription": "Sportiv disciplinat"
      },
      "discovery": {
        "title": "De unde ai aflat de noi?",
        "subtitle": "Ajută-ne să înțelegem cum ai descoperit FormAI",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "facebook": "Facebook",
        "google": "Google",
        "appStore": "App Store",
        "playStore": "Play Store",
        "twitter": "X (Twitter)",
        "youtube": "YouTube",
        "friends": "Prieteni & familie",
        "other": "Altceva"
      },
      "personalTrainer": {
        "title": "Ai antrenor personal?",
        "subtitle": "Ne ajută să îți personalizăm experiența",
        "yes": "Da",
        "no": "Nu"
      },
      "trainingReason": {
        "title": "Care este motivul #1 pentru care te antrenezi?",
        "subtitle": "Vom adapta analiza formei la obiectivul tău.",
        "buildStrength": "Dezvoltare forță",
        "improvePhysique": "Îmbunătățirea fizicului",
        "preventInjury": "Prevenirea accidentărilor",
        "trainForSport": "Antrenament pentru sport",
        "stayActiveHealthy": "Activ și sănătos"
      },
      "gymChallenge": {
        "title": "Care este cea mai mare provocare la sală?",
        "subtitle": "Hai să ne concentrăm pe ce contează pentru tine.",
        "unsureForm": "Nu sunt sigur de corectitudinea formei",
        "noResults": "Nu văd rezultate",
        "worriedInjury": "Îmi este teamă de accidentări",
        "strugglingMotivation": "Mă lupt cu motivația",
        "other": "Altceva"
      },
      "lifterType": {
        "title": "Cum te vezi ca lifter?",
        "subtitle": "Nivelul tău de experiență ne ghidează recomandările.",
        "beginner": "Începător – învăț bazele",
        "intermediate": "Intermediar – îmi perfecționez tehnica",
        "advanced": "Avansat – urmăresc performanța de elită",
        "returningAfterBreak": "Revenire după pauză",
        "injuryRehab": "Recuperare după accidentare"
      },
      "perfectFormGoal": {
        "title": "Dacă forma ta ar fi mereu perfectă, ce ai atinge mai repede?",
        "subtitle": "Vizualizează progresul fără piedici.",
        "liftHeavierSafely": "Ridicare mai grea în siguranță",
        "buildMuscleEfficiently": "Construire eficientă de masă musculară",
        "avoidInjuries": "Evitarea accidentărilor",
        "boostConfidence": "Sporirea încrederii",
        "trainLongerWithoutSetbacks": "Antrenamente mai lungi fără recul"
      },
      "formConfidence": {
        "title": "Cât de încrezător ești în forma ta acum?",
        "subtitle": "Fii sincer – te aducem la 100%.",
        "zeroToTwentyFive": "0% - 25%",
        "twentyFiveToFifty": "25% - 50%",
        "fiftyToSeventyFive": "50% - 75%",
        "seventyFiveToHundred": "75% - 100%"
      },
      "threeMonthGoal": {
        "title": "În 3 luni, unde vrei să fii?",
        "subtitle": "Călătoria începe cu verificarea formei de azi.",
        "liftingHeavier": "Să ridic mai greu",
        "lookingLeaner": "Să arăt mai definit",
        "feelingStrongerInjuryFree": "Să mă simt mai puternic și fără accidentări",
        "moreConsistent": "Să fiu mai consecvent",
        "moreConfident": "Să fiu mai încrezător"
      },
      "measurements": {
        "title": "Înălțime & Greutate",
        "subtitle": "Ne ajută să oferim recomandări personalizate",
        "height": "Înălțime",
        "weight": "Greutate",
        "metric": "Metric",
        "imperial": "Imperial",
        "cm": "cm",
        "ft": "ft",
        "in": "inci",
        "kg": "kg",
        "lbs": "lbs"
      },
      "birthDate": {
        "title": "Când te-ai născut?",
        "subtitle": "Pentru recomandări adecvate vârstei",
        "month": "Luna",
        "day": "Ziua",
        "year": "Anul"
      },
      "rating": {
        "title": "Oferă-ne o evaluare",
        "subtitle": "Ajută-ne să îmbunătățim experiența",
        "skip": "Sari peste",
        "middleText": "FormAI este creat pentru pasionații de sală ca tine!"
      },
      "referralCode": {
        "title": "Introdu codul de recomandare (opțional)",
        "subtitle": "Poți sări peste acest pas.",
        "placeholder": "Cod de recomandare",
        "skip": "Sari peste",
        "submit": "Trimite",
        "success": "Codul de recomandare a fost aplicat",
        "error": "Cod invalid. Încearcă din nou."
      },
      "allDone": {
        "title": "Gata!",
        "allDone": "Gata!",
        "thankYou": "Mulțumim pentru încredere",
        "privacy": "Promitem să-ți păstrăm mereu datele private și în siguranță."
      },
      "trainSafer": {
        "title": "Antrenează-te cu de 3 ori mai puține șanse de accidentare cu Form AI față de pe cont propriu",
        "withoutFormAI": "Fără Form AI",
        "withFormAI": "Cu Form AI",
        "description": "FormAI te ajută să-ți perfecționezi forma și te menține consecvent."
      },
      "notificationPermission": {
        "title": "Atinge-ți obiectivele cu notificări",
        "dialogText": "FormAI dorește să îți trimită notificări",
        "allow": "Permite",
        "dontAllow": "Nu permite"
      },
      "setupLoading": {
        "title": "",
        "mainTitle": "Configurăm totul pentru tine",
        "step1": "Îți configurăm profilul...",
        "step2": "Aproape gata..."
      },
      "freeTrial": {
        "title": "Vrem să încerci FormAI gratuit.",
        "noPaymentDue": "Nicio plată acum",
        "tryForFree": "Încearcă pentru 0,00 $",
        "pricing": "Doar 39,99 $ pe an (3,33 $/lună)"
      },
      "notificationReminder": {
        "title": "Îți vom trimite\nun reminder înainte să se\ntermine perioada de probă",
        "noPaymentDue": "Nicio plată acum",
        "continueForFree": "Continuă GRATUIT",
        "pricing": "Doar 39,99 $ pe an (3,33 $/lună)"
      },
      "subscriptionSelection": {
        "title": "Începe perioada de probă GRATUITĂ de 3 zile pentru a continua.",
        "titleMonthly": "Deblochează FormAI pentru a-ți atinge mai repede obiectivele",
        "today": "Astăzi",
        "todayDescription": "Deblochează toate funcțiile aplicației, precum analiza AI a formei.",
        "reminder": "Peste 2 zile - Reminder",
        "reminderDescription": "Îți vom aminti că perioada de probă se apropie de final.",
        "billing": "Peste 3 zile - Începe facturarea",
        "billingDescription": "Vei fi taxat la {{billingDate}} dacă nu anulezi înainte.",
        "monthly": "Lunar",
        "monthlyPrice": "9,99 $/lună",
        "yearly": "Anual",
        "yearlyPrice": "3,33 $/lună",
        "freeTag": "3 ZILE GRATUIT",
        "noPaymentDue": "Nicio plată acum",
        "cancelAnytime": "Anulezi oricând - Fără angajament",
        "startTrial": "Pornește perioada mea de probă de 3 zile",
        "startToday": "Începe azi",
        "yearlyPricing": "3 zile gratuit, apoi 39,99 $/an (3,33 $/lună)",
        "monthlyPricing": "Doar 9,99 $/lună (120 $/an)",
        "monthlyFeature1": "Analiză simplă a formei",
        "monthlyFeature1Description": "Analizează orice mișcare doar cu un video",
        "monthlyFeature2": "Atinge-ți obiectivele",
        "monthlyFeature2Description": "Să intri în formă n-a fost niciodată mai ușor",
        "monthlyFeature3": "Urmărește-ți progresul",
        "monthlyFeature3Description": "Rămâi pe drumul cel bun cu analize și mementouri"
      },
      "createAccount": {
        "title": "Creează un cont",
        "signInWithApple": "Autentificare cu Apple",
        "signInWithGoogle": "Autentificare cu Google"
      },
      "cameraPermission": {
        "title": "Permite accesul la cameră",
        "subtitle": "Accesul la cameră este necesar pentru FormAI.",
        "dialogText": "FormAI dorește acces la cameră.",
        "allow": "Permite",
        "dontAllow": "Nu permite"
      },
      "perfectFormGoalMessage": {
        "highlighted": {
          "liftHeavierSafely": "Să ridici mai greu în siguranță",
          "buildMuscleEfficiently": "Să construiești masă musculară",
          "avoidInjuries": "Să eviți accidentările",
          "boostConfidence": "Încrederea ta va exploda",
          "trainLongerWithoutSetbacks": "Antrenamente fără poticneli",
          "default": "Obiectivele tale"
        },
        "rest": " este un obiectiv garantat. Nu e deloc greu!",
        "restRealistic": " este un obiectiv realist. Nu e deloc greu!",
        "restFantastic": " este un obiectiv grozav. Nu e deloc greu!",
        "restAfter": " apoi. Nu e deloc greu!",
        "restNormal": " va deveni normal. Nu e deloc greu!",
        "restAchievable": " sunt realizabile cu Form AI. Nu e deloc greu!",
        "subtitle": "95% dintre utilizatori spun că schimbarea este vizibilă după utilizarea Form AI."
      },
      "potentialGraph": {
        "title": "Ai un potențial uimitor să-ți atingi obiectivul",
        "chartTitle": "Tranziția preciziei tale",
        "subtitle": "Bazat pe datele istorice Form AI, îmbunătățirea este întârziată la început, dar după 14 zile devii foarte constant!"
      },
      "costComparison": {
        "title": "Formă perfectă la o fracțiune din costul antrenorilor",
        "personalTrainer": "Antrenor personal",
        "withFormAI": "Cu Form AI",
        "costLess": "Cu 99% mai ieftin",
        "description": "Tehnica sigură și corectă nu ar trebui să coste o avere."
      },
      "gymChallengeInfo": {
        "noResults": {
          "headline": "Rezultatele cer timp, dar ești mai aproape decât crezi.",
          "message": "Te ghidăm cu feedbackul potrivit ca munca ta să dea roade.",
          "howWeGetYouThere": [
            "Analiza formei pentru ca fiecare repetare să conteze",
            "Feedback video pentru a evidenția ce te trage înapoi",
            "Urmărirea preciziei pentru a măsura progresul real"
          ]
        },
        "unsureForm": {
          "headline": "Forma pe primul loc.",
          "message": "Îți oferim feedback clar ca să te antrenezi sigur și eficient, de fiecare dată.",
          "howWeGetYouThere": [
            "Analiză instantă a formelor din clipurile tale",
            "Sfaturi aplicabile pentru corecții rapide",
            "Scoruri de precizie pentru a urmări îmbunătățirea"
          ]
        },
        "worriedInjury": {
          "headline": "Antrenează-te în siguranță. Antrenează-te puternic.",
          "message": "Prindem mișcările riscante înainte să devină accidentări.",
          "howWeGetYouThere": [
            "Feedback video pe poziții nesigure",
            "Recomandări de tehnică mai sigure, personalizate",
            "Urmărirea preciziei pentru consecvență pe termen lung"
          ]
        },
        "strugglingMotivation": {
          "headline": "Motivația e mai ușoară când nu ești singur.",
          "message": "Te menținem implicat arătându-ți progresul și sărbătorind fiecare pas.",
          "howWeGetYouThere": [
            "Scoruri ușor de citit după fiecare antrenament",
            "Îmbunătățiri vizibile cu tendințe de progres",
            "Sfaturi încurajatoare pentru a rămâne consecvent"
          ]
        },
        "other": {
          "headline": "Suntem aici pentru drumul tău.",
          "message": "Indiferent de provocare, îți oferim ghidare și suport.",
          "howWeGetYouThere": [
            "Feedback personalizat pe videoclipurile tale de mișcare",
            "Urmărirea preciziei pe tipuri diferite de exerciții",
            "Sfaturi și insighturi continue pentru obiectivele tale"
          ]
        },
        "howWeGetYouThereTitle": "Iată cum te vom duce acolo"
      },
      "saveProgress": {
        "title": "Creează un cont"
      }
    },
    "months": {
      "january": "Ianuarie",
      "february": "Februarie",
      "march": "Martie",
      "april": "Aprilie",
      "may": "Mai",
      "june": "Iunie",
      "july": "Iulie",
      "august": "August",
      "september": "Septembrie",
      "october": "Octombrie",
      "november": "Noiembrie",
      "december": "Decembrie",
      "array": ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
    },
    "progress": {
      "title": "Călătoria ta începe aici",
      "subtitle": "Vezi cum utilizatorii își îmbunătățesc forma și performanța cu FormAI",
      "chartTitle": "Îmbunătățirea scorului de formă în timp",
      "week": "Săptămâna",
      "score": "Scor formă",
      "formImprovement": "Îmbunătățirea formei",
      "weeksToExcellence": "Săptămâni până la excelență"
    },
    "liftingGoal": {
      "title": "Care este obiectivul tău?",
      "subtitle": "Vom adapta AI-ul la stilul tău de ridicare.",
      "muscleBuilding": "Construire masă musculară",
      "powerlifting": "Powerlifting",
      "toning": "Tonifiere",
      "strength": "Forță",
      "weightLoss": "Scădere în greutate"
    },
    "formBarrier": {
      "title": "Ce te împiedică să-ți perfecționezi forma?",
      "subtitle": "Ajută-ne să înțelegem provocările tale",
      "expensiveTrainers": "Antrenorii personali sunt prea scumpi",
      "gymAdviceScary": "Mi-e incomod să cer sfaturi",
      "noTime": "Nu am timp să-mi perfecționez forma",
      "other": "Altceva"
    },
    "home": {
      "addTestLift": "Adaugă un lift de test",
      "dailyAccuracyLevel": "Precizia zilnică",
      "noLiftsToday": "Niciun lift astăzi",
      "allTimeAccuracy": "Precizie totală",
      "earnByReferring": "Câștigă prin recomandări!",
      "yourVideoLibrary": "Biblioteca ta video",
      "lifts": "Lifturi recente",
      "seeAll": "Vezi tot",
      "noRecordedLifts": "Nu există lifturi înregistrate pentru această dată",
      "startAnalyzingWorkout": "Începe analiza antrenamentului cu un video scurt",
      "dayStreak": "Seria de {{count}} zile",
      "onFireMessage": "Ești în formă maximă! Continuă seria zilnică.",
      "zeroDayStreak": "Serie de 0 zile",
      "noStreakMessage": "Încă nu ai serie. Înregistrează în zile consecutive pentru a începe.",
      "continue": "Continuă"
    },
    "performance": {
      "title": "Progres",
      "editDateRange": "Editează intervalul",
      "from": "De la",
      "to": "Până la",
      "reset": "Resetează",
      "apply": "Aplică",
      "filterLifts": "Filtrează lifturile",
      "timeRanges": {
        "ninetyDays": "90 Zile",
        "sixMonths": "6 Luni",
        "oneYear": "1 An",
        "allTime": "Tot timpul",
      },
      "chartTitles": {
        "accuracyPerWeight": "Precizie per greutate",
        "accuracyOverTime": "Precizie în timp",
        "loading": "Se încarcă...",
        "noDataAvailable": "Nu există date"
      },
      "info": {
        "accuracyPerWeight": {
          "title": "Precizie per greutate",
          "message": "Arată precizia medie a formei pentru fiecare greutate ridicată la o mișcare. Greutățile mari pot pune forma la încercare. Calcul: media scorurilor pentru fiecare greutate."
        },
        "accuracyOverTime": {
          "title": "Precizie în timp",
          "message": "Arată cum se schimbă precizia formei în timp pentru o mișcare. Media zilnică este reprezentată pe parcursul datelor."
        },
        "accuracy": {
          "title": "Precizie",
          "message": "Precizia medie în intervalul selectat. Media scorurilor tuturor lifturilor."
        },
        "improvement": {
          "title": "Îmbunătățire",
          "message": "Schimbarea formei pe interval: comparăm prima treime a lifturilor cu ultima treime și afișăm diferența medie."
        }
      },
      "metricsFeedback": {
        "title": "Vrei și alte metrici? Spune-ne!",
        "subtitle": "Ajută-ne să-ți îmbunătățim experiența"
      }
    },
    "library": {
      "title": "Bibliotecă",
      "editDateRange": "Editează intervalul",
      "from": "De la",
      "to": "Până la",
      "reset": "Resetează",
      "apply": "Aplică",
      "all": "Toate",
      "favourites": "Favorite",
      "noLiftsAnalysed": "Niciun lift analizat",
      "noFavouriteLifts": "Niciun lift favorit",
      "noLiftsFound": "Nu s-au găsit lifturi",
      "startAnalysingWorkout": "Începe analiza antrenamentului de azi cu un video scurt",
      "markLiftsAsFavourites": "Marchează lifturile ca favorite pentru a apărea aici",
      "tryAdjustingFilters": "Încearcă să ajustezi filtrele",
      "lifts": "lifturi",
      "lift": "lift",
      "noLifts": "0",
      "selectDateRange": "Selectează intervalul",
      "allLifts": "Toate lifturile",
      "oneLift": "1",
      "search": "Caută",
      "liftsCount": "{{count}} lifturi",
      "filterByMovement": "Filtrează după mișcare",
      "searchMovements": "Caută mișcări...",
      "allMovements": "Toate mișcările",
      "searchAnalysis": {
        "analysisFound": "Analiză găsită",
        "analysisFoundNotFavourited": "S-a găsit o analiză dar nu e la favorite.",
        "continueToLift": "Continuă la lift",
        "noAnalysisFound": "Nu s-a găsit analiză",
        "noAnalysisFoundMessage": "Nu există analiză pentru acest video. Asigură-te că a fost analizat.",
        "analyse": "Analizează",
        "permissionRequired": "Permisiune necesară",
        "permissionMessage": "Permite accesul la biblioteca foto pentru a căuta videoclipuri.",
        "error": "Eroare",
        "errorMessage": "Selectarea videoclipului a eșuat. Încearcă din nou."
      }
    },
    "liftCard": {
      "accuracy": "Precizie"
    },
    "loadingLift": {
      "uploadingVideo": "Se încarcă videoclipul...",
      "checkingVideo": "Se verifică videoclipul...",
      "estimatingPose": "Se estimează postura...",
      "analyzingVideo": "Se analizează videoclipul...",
      "analyzingForm": "Se analizează forma...",
      "analysisFailed": "Analiza a eșuat",
      "processing": "Procesare...",
      "errorOccurred": "A apărut o eroare",
      "pleaseTryAgain": "Te rugăm să încerci din nou",
      "tapToRetry": "Atinge pentru a reîncerca",
      "notifyWhenDone": "Te vom anunța când este gata!",
      "noLiftFound": {
        "title": "Nu s-a găsit niciun lift",
        "subtitle": "Nu putem detecta o ridicare"
      },
      "liftMismatch": {
        "title": "Nepotrivire lift",
        "subtitle": "Mișcarea selectată nu corespunde videoclipului",
        "detectedMovement": "Nu te putem detecta executând: {{movement}}"
      }
    },
    "feedback": {
      "liftDetails": "Detalii lift",
      "rangeOfMotionAcrossReps": "Amplitudinea mișcării pe repetări",
      "benchPress": "Împins la piept",
      "formAccuracyAcrossReps": "Precizia formei pe repetări",
      "weight": "Greutate",
      "reps": "Repetări",
      "reviewFeedback": "Vezi feedbackul",
      "favourite": "Favorit",
      "manualDeleteLiftCardData": "Șterge liftul",
      "deleteLiftTitle": "Ștergi liftul",
      "deleteLiftMessage": "Ești sigur că vrei să ștergi acest lift? Acțiune ireversibilă.",
      "cancel": "Anulează",
      "delete": "Șterge",
      "howItWorks": "Cum funcționează",
      "viewFeedback": "Vezi feedbackul",
      "step1": "AI-ul nostru observă momente specifice în timpul liftului în care forma poate fi îmbunătățită.",
      "step2": "Apoi explică ce nu a fost optim.",
      "step3": "Primești sfaturi de siguranță și îmbunătățire!",
      "step4": "Apoi ține de tine să îmbunătățești forma și să revii într-o săptămână.",
      "accuracy": "Precizie",
      "accuracyScore": "Scor precizie",
      "improvements": "Îmbunătățiri",
      "noVideoAvailable": "Niciun video disponibil",
      "deleteLiftConfirmation": "Sigur ștergi acest lift? Acțiune ireversibilă.",
      "lbs": "lbs",
      "kg": "kg",
      "updateFailed": {
        "weight": "Actualizarea greutății a eșuat",
        "message": "Te rugăm să încerci mai târziu"
      }
    },
    "common": {
      "accuracy": "Precizie",
      "averageAccuracy": "Precizie medie",
      "averageFormImprovement": "Îmbunătățire medie a formei",
      "noData": "Fără date",
      "selectDateRange": "Selectează intervalul",
      "allLifts": "Toate lifturile",
      "oneLift": "1 lift",
      "lifts": "Lifturi",
      "noLiftsFound": "Nu s-au găsit lifturi"
    },
    "tutorial": {
      "buttons": {
        "previous": "Înapoi",
        "next": "Continuă",
        "complete": "Finalizează",
        "skipGuide": "Sari peste tutorial",
        "close": "Închide"
      },
      "addButton": {
        "title": "Adaugă un lift",
        "description": "Folosește butonul Adaugă pentru a începe o nouă analiză."
      },
      "addOptionsUpload": {
        "title": "Încarcă & Înregistrează un video",
        "description": "Aici poți încărca un video sau înregistra unul nou în aplicație, care va fi salvat și în galeria foto.\n\nPentru acest tur vom încărca un video demo."
      },
      "uploadPracticesCta": {
        "title": "Sfaturi & încărcare",
        "description": "Găsești aici recomandări privind calitatea video și cum obții cele mai bune rezultate.\n\nPasul următor ar deschide galeria, dar îl omitem în demo."
      },
      "videoPreviewContinue": {
        "title": "Previzualizare video",
        "description": "Dacă video-ul arată bine, continuă și alege tipul mișcării."
      },
      "movementSelectionContinue": {
        "title": "Alege tipul mișcării",
        "description": "Selectează o mișcare exactă pentru a ne ajuta să analizăm corect forma.\n\nDacă nu o găsești, scrie echipei de suport și vom încerca să o adăugăm."
      },
      "weightRepsComplete": {
        "title": "Greutate & repetări",
        "description": "Le folosim pentru a-ți urmări progresul și îmbunătățirea în timp."
      },
      "homeFirstLiftCard": {
        "title": "Atinge aici pentru analiza ta",
        "description": "Liftul tău apare aici cu analiza aferentă. Atinge pentru detalii sau glisează pentru a șterge."
      },
      "liftDetailsFormGraph": {
        "title": "Precizia formei pe repetări",
        "description": "Graficul arată cum variază precizia pentru fiecare repetare."
      },
      "liftDetailsDepthGraph": {
        "title": "Amplitudinea pe repetări",
        "description": "Acest grafic bară arată profunzimea liftului pe repetări."
      },
      "liftDetailsReviewFeedback": {
        "title": "Revizuiește feedbackul",
        "description": "Apasă „Vezi feedbackul” pentru analiză detaliată și sfaturi."
      },
      "howItWorksModal": {
        "title": "Cum funcționează",
        "description": "Aici vezi cum funcționează analiza AI și cum te ajută să progresezi."
      },
      "feedbackSlideshow": {
        "title": "Feedbackul tău",
        "description": "Sistemul evidențiază momente ce necesită îmbunătățire, cu problemele și sfaturile aferente.\n\nGlisează la dreapta pentru următorul punct."
      },
      "feedbackIssues": {
        "title": "Probleme de adresat",
        "description": "Revizuiește problemele identificate în forma ta.\n\nGlisează overlay-ul pentru a vedea captura video."
      },
      "feedbackTips": {
        "title": "Sfaturi de îmbunătățire",
        "description": "Sfaturi concrete pentru a-ți îmbunătăți tehnica.\n\nPoți deschide/închide panoul pentru a vedea captura."
      },
      "homeSeeAllLifts": {
        "title": "Vezi toate lifturile",
        "description": "Deschide biblioteca pentru a filtra, sorta și revizui istoricul."
      },
      "libraryScreen": {
        "title": "Ecran Bibliotecă",
        "description": "Aici vezi toate lifturile. Comută între Toate și Favorite. Sortează, filtrează și caută!\n\nAtinge un lift pentru detalii, glisează pentru a șterge."
      },
      "homePerformanceIcon": {
        "title": "Performanța ta",
        "description": "Atinge fila Progres pentru statistici în timp."
      },
      "performanceMetrics": {
        "title": "Precizie & Îmbunătățire",
        "description": "Urmărește indicatorii ca să-ți măsori progresul."
      },
      "performanceChartsOverWeight": {
        "title": "Precizie per greutate",
        "description": "Afișează la ce greutăți performezi cel mai bine."
      },
      "performanceChartsOverTime": {
        "title": "Precizie în timp",
        "description": "Vizualizează progresul – de obicei pozitiv după 14 zile!"
      },
      "settingsFirstCard": {
        "title": "Date personale",
        "description": "Dacă se schimbă ceva, editează datele, limba și unitățile preferate."
      },
      "settingsSupportEmail": {
        "title": "Obține suport",
        "description": "Ai nevoie de ajutor? Atinge aici pentru a contacta suportul prin e-mail."
      },
      "completionModal": {
        "title": "Totul este gata",
        "message": "Ești pregătit să folosești FormAI. Revino zilnic pentru a-ți menține seria și consecvența.\n\nPoți reda oricând acest tutorial din setări."
      }
    },
    "upload": {
      "permissionRequired": "Permisiune necesară",
      "permissionMessage": "Te rugăm să acorzi acces la biblioteca foto.",
      "mediaPermissionTitle": "Permite accesul la biblioteca media",
      "mediaPermissionDialogText": "FormAI dorește acces la biblioteca media.",
      "allow": "Permite",
      "dontAllow": "Nu permite",
      "videoTooLong": "Video prea lung",
      "videoTooLongMessage": "Selectează un video sub 90 de secunde.",
      "videoTooShort": "Video prea scurt",
      "videoTooShortMessage": "Selectează un video de cel puțin 3 secunde.",
      "error": "Eroare",
      "failedToSelectVideo": "Selectarea videoclipului a eșuat. Încearcă din nou.",
      "failedToGenerateThumbnail": "Generarea miniaturii a eșuat. Încearcă din nou.",
      "uploadVideo": "Încarcă video",
      "selectNewVideo": "Video nou",
      "duplicateVideo": "Video duplicat",
      "duplicateVideoMessage": "Acest video a fost deja analizat. Te rugăm să alegi altul.",
      "selectDifferentVideo": "Alege alt video",
      "viewAnalysis": "Vezi analiza",
      "tips": {
        "goodLighting": "Asigură iluminare bună",
        "stableVideo": "Asigură o filmare stabilă",
        "sideView": "Filmează din profil (lateral)"
      },
      "ok": "OK",
      "recordingFailed": "Înregistrarea a eșuat. Încearcă din nou.",
      "failedToStartRecording": "Nu s-a putut porni înregistrarea. Încearcă din nou.",
      "failedToFinishRecording": "Nu s-a putut finaliza înregistrarea. Încearcă din nou.",
      "stopRecording": "Oprești înregistrarea?",
      "stopRecordingMessage": "Sigur vrei să oprești înregistrarea?",
      "cancel": "Anulează",
      "stop": "Oprește",
      "accessibility": {
        "flipCamera": "Comută camera",
        "toggleTorch": "Pornește/Oprește lanterna",
        "toggleMic": "Pornește/Oprește microfonul",
        "countdown": "Numărătoare inversă"
      }
    }
  },
  de: {
    "loading": "Wird geladen...",
    "getStarted": "Loslegen",
    "signIn": "Anmelden",
    "dontHaveAccount": "Hast du kein Konto?",
    "startToday": "Heute beginnen",
    "alreadyHaveAccount": "Hast du bereits ein Konto?",
    "next": "Weiter",
    "back": "Zurück",
    "tabs": {
      "home": "Start",
      "progress": "Fortschritt",
      "settings": "Einstellungen"
    },
    "settings": {
      "personalDetails": "Persönliche Daten",
      "language": "Sprache",
      "selectLanguage": "Sprache auswählen",
      "units": "Einheiten ändern",
      "appTheme": "App-Design",
      "whyLowQualityVideos": "Warum ist die Videoqualität niedrig?",
      "referFriends": "Freunde einladen",
      "growStrongerTogether": "Gemeinsam stärker werden!",
      "currentBalance": "Aktuelles Guthaben",
      "shareNow": "Jetzt teilen",
      "sharePageTitle": "FormAI teilen",
      "termsAndConditions": "Nutzungsbedingungen",
      "privacyPolicy": "Datenschutzrichtlinie",
      "supportEmail": "Support-E-Mail",
      "replayTutorial": "Tutorial erneut abspielen",
      "leaveRating": "Bewertung abgeben",
      "deleteAccount": "Konto löschen",
      "logout": "Abmelden",
      "save": "Speichern",
      "deleteAccountTitle": "Konto löschen?",
      "deleteAccountMessage": "Möchtest du dein Konto dauerhaft löschen? Dieser Vorgang kann nicht rückgängig gemacht werden und alle Daten werden gelöscht.",
      "deleteAccountSubscriptionWarning": "Das Löschen deines Form-AI-Kontos in der App beendet dein Abonnement nicht. Denke daran, es in den Abo-Einstellungen deines Geräts separat zu kündigen, damit keine weiteren Kosten anfallen.",
      "iAcknowledge": "Ich bestätige",
      "deleteAccountButton": "Konto löschen",
      "logoutTitle": "Abmelden?",
      "logoutMessage": "Möchtest du dich wirklich abmelden? Du musst dich anschließend erneut anmelden.",
      "no": "Nein",
      "yes": "Ja",
      "editFailed": {
        "gender": "Änderung des Geschlechts fehlgeschlagen",
        "height": "Änderung der Größe fehlgeschlagen",
        "dateOfBirth": "Änderung des Geburtsdatums fehlgeschlagen",
        "currentWeight": "Änderung des Gewichts fehlgeschlagen",
        "unitSystem": "Aktualisierung des Einheitensystems fehlgeschlagen",
        "language": "Aktualisierung der Sprache fehlgeschlagen",
        "message": "Bitte später erneut versuchen"
      }
    },
    "share": {
      "referYourFriends": "Empfiehl uns deinen Freunden",
      "empowerYourFriends": "Unterstütze deine Freunde",
      "yourPersonalPromoCode": "Dein persönlicher Promocode",
      "share": "Teilen",
      "howItWorks": "So funktioniert’s",
      "step1": "Teile den Code mit Freunden",
      "step2": "Verdiene 5 $ pro Freund, der mit deinem Code ein Jahresabo abschließt",
      "copied": "Kopiert!",
      "promoCodeCopied": "Promocode in die Zwischenablage kopiert",
      "error": "Fehler",
      "failedToCopy": "Promocode konnte nicht kopiert werden",
      "failedToShare": "Teilen-Dialog konnte nicht geöffnet werden",
      "shareMessage": "Hey! Lade diese App herunter und nutze diesen Promocode:",
      "shareTitle": "Lade FormAI herunter!"
    },
    "personalDetails": {
      "currentWeight": "Aktuelles Gewicht",
      "weight": "Gewicht",
      "height": "Größe",
      "dateOfBirth": "Geburtsdatum",
      "gender": "Geschlecht",
      "videoQuality": "Videoqualität",
      "editCurrentWeight": "Aktuelles Gewicht bearbeiten",
      "editHeight": "Größe bearbeiten",
      "editDateOfBirth": "Geburtsdatum bearbeiten",
      "editGender": "Geschlecht bearbeiten",
      "male": "Männlich",
      "female": "Weiblich"
    },
    "add": {
      "uploadVideo": "Video hochladen",
      "recordVideo": "Video aufzeichnen",
      "uploadVideoDescription": "Wähle ein Video aus deiner Galerie, um deine Technik zu analysieren.",
      "recordVideoDescription": "Nimm ein neues Video auf, um deine Übungstechnik zu analysieren.",
      "whatExercise": "Welche Übung hast du gemacht?",
      "back": "Zurück",
      "noVideoAvailable": "Kein Video verfügbar",
      "selectNewVideo": "Neues Video",
      "continue": "Weiter",
      "generalTips": "Allgemeine Tipps",
      "searchMovements": "Bewegungen suchen...",
      "useCustomMovement": "Verwenden",
      "bestRecordingPractices": "Best Practices für Aufnahmen",
      "bodyParts": {
        "all": "Alle",
        "chest": "Brust",
        "back": "Rücken",
        "shoulders": "Schultern",
        "arms": "Arme",
        "legs": "Beine"
      },
      "movements": {
        "Flat Barbell Bench Press": "Bankdrücken flach (Langhantel)",
        "Incline Barbell Bench Press": "Schrägbankdrücken (Langhantel)",
        "Decline Barbell Bench Press": "Negativbankdrücken (Langhantel)",
        "Flat Dumbbell Chest Press": "Bankdrücken flach (Kurzhanteln)",
        "Incline Dumbbell Chest Press": "Schrägbankdrücken (Kurzhanteln)",
        "Decline Dumbbell Chest Press": "Negativbankdrücken (Kurzhanteln)",
        "Dumbbell Chest Fly (Incline)": "Kurzhantel-Fliegende (schräg)",
        "Dumbbell Chest Fly (Flat)": "Kurzhantel-Fliegende (flach)",
        "Dumbbell Chest Fly (Decline)": "Kurzhantel-Fliegende (negativ)",
        "Deadlift": "Kreuzheben",
        "Barbell Row": "Langhantelrudern",
        "Pendlay Row": "Pendlay Rudern",
        "T-Bar Row": "T-Bar Rudern",
        "Dumbbell Row": "Kurzhantelrudern",
        "Single Arm Dumbbell Row": "Einarmiges Kurzhantelrudern",
        "Overhead Barbell Press": "Schulterdrücken stehend (Langhantel)",
        "Seated Dumbbell Shoulder Press": "Schulterdrücken sitzend (Kurzhanteln)",
        "Arnold Press": "Arnold-Press",
        "Lateral Raise (Dumbbell)": "Seitheben (Kurzhanteln)",
        "Front Raise (Dumbbell)": "Frontheben (Kurzhanteln)",
        "Upright Row": "Aufrechtes Rudern",
        "Barbell Curl": "Langhantelcurls",
        "EZ-Bar Curl": "SZ-Curls",
        "Dumbbell Curl": "Kurzhantelcurls",
        "Hammer Curl": "Hammercurls",
        "Incline Dumbbell Curl": "Schrägbank-Kurzhantelcurls",
        "Cable Curl": "Kabelcurls",
        "Preacher Curl": "Scottcurls",
        "Skullcrusher (Barbell or EZ-Bar)": "Skullcrusher (Langhantel oder SZ)",
        "Dumbbell Overhead Triceps Extension": "Kurzhantel-Trizepsstrecken über Kopf",
        "Barbell Back Squat": "Kniebeuge (Langhantel, Back Squat)",
        "Barbell Front Squat": "Frontkniebeuge (Langhantel)",
        "Goblet Squat": "Goblet Squat",
        "Dumbbell Back Squat": "Kniebeuge (Kurzhanteln)",
        "Romanian Deadlift (Barbell or Dumbbell)": "Rumänisches Kreuzheben (Langhantel/Kurzhanteln)",
        "Stiff-Leg Deadlift": "Kreuzheben mit gestreckten Beinen",
        "Good Morning": "Good Mornings",
        "Push Ups": "Liegestütze"
      },
      "recordingTips": [
        "Sorge für gutes Licht und eine stabile Kamera",
        "Versuche, dich von der Seite zu filmen"
      ],
      "countdown": {
        "title": "Countdown",
        "off": "Aus",
        "fiveSeconds": "5 s",
        "tenSeconds": "10 s"
      }
    },
    "welcome": {
      "title": "FormAI",
      "subtitle": "Perfekte Form, jederzeit",
      "modal": {
        "title": "Willkommen",
        "message": "Danke für dein Vertrauen in Form AI. Wir freuen uns, dir beim Erreichen deiner Ziele zu helfen.",
        "ctaButton": "Los geht’s mit einer Tour"
      }
    },
    "onboarding": {
      "language": {
        "title": "Sprache",
        "subtitle": "Du kannst das später jederzeit ändern",
        "selectLanguage": "Sprache auswählen"
      },
      "units": {
        "title": "Einheiten",
        "subtitle": "Du kannst das später jederzeit ändern",
        "metric": "Metrisch",
        "imperial": "Imperial",
        "metricDescription": "Kilogramm und Zentimeter",
        "imperialDescription": "Pfund, Fuß, Zoll"
      },
      "gender": {
        "title": "Biologisches Geschlecht",
        "subtitle": "Hilft uns, die optimale Biomechanik für dich zu finden",
        "male": "Männlich",
        "female": "Weiblich",
        "other": "Sonstiges"
      },
      "goal": {
        "title": "Was ist dein Ziel?",
        "subtitle": "Damit erstellen wir deinen Kalorienplan.",
        "loseWeight": "Abnehmen",
        "maintain": "Halten",
        "gainWeight": "Zunehmen"
      },
      "workouts": {
        "title": "Wie oft trainierst du pro Woche?",
        "subtitle": "Deine Trainingshäufigkeit bestimmt deinen Fortschritt.",
        "zeroToTwo": "0–2",
        "zeroToTwoDescription": "Ab und zu ein Workout",
        "threeToFive": "3–5",
        "threeToFiveDescription": "Ein paar Mal pro Woche",
        "SixPlus": "6+",
        "SixPlusDescription": "Disziplinierte/r Athlet/in"
      },
      "discovery": {
        "title": "Wo hast du von uns erfahren?",
        "subtitle": "Hilf uns zu verstehen, wie du FormAI gefunden hast",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "facebook": "Facebook",
        "google": "Google",
        "appStore": "App Store",
        "playStore": "Play Store",
        "twitter": "X (Twitter)",
        "youtube": "YouTube",
        "friends": "Freunde & Familie",
        "other": "Andere"
      },
      "personalTrainer": {
        "title": "Hast du einen Personal Trainer?",
        "subtitle": "So können wir deine Erfahrung anpassen",
        "yes": "Ja",
        "no": "Nein"
      },
      "trainingReason": {
        "title": "Was ist dein Hauptgrund fürs Training?",
        "subtitle": "Wir passen die Analyse an dein Ziel an.",
        "buildStrength": "Kraft aufbauen",
        "improvePhysique": "Aussehen verbessern",
        "preventInjury": "Verletzungen vermeiden",
        "trainForSport": "Für Sport trainieren",
        "stayActiveHealthy": "Aktiv & gesund bleiben"
      },
      "gymChallenge": {
        "title": "Was ist deine größte Herausforderung im Gym?",
        "subtitle": "Konzentrieren wir uns auf das, was dir am wichtigsten ist.",
        "unsureForm": "Ich bin unsicher, ob meine Technik korrekt ist",
        "noResults": "Ich sehe keine Ergebnisse",
        "worriedInjury": "Ich habe Angst vor Verletzungen",
        "strugglingMotivation": "Mir fehlt die Motivation",
        "other": "Andere"
      },
      "lifterType": {
        "title": "Wie siehst du dich als Lifter/in?",
        "subtitle": "Dein Erfahrungslevel steuert unsere Hinweise.",
        "beginner": "Anfänger/in – ich lerne die Grundlagen",
        "intermediate": "Fortgeschritten – ich feile an der Technik",
        "advanced": "Sehr fortgeschritten – ich strebe Spitzenleistung an",
        "returningAfterBreak": "Wiedereinstieg nach Pause",
        "injuryRehab": "Reha nach Verletzung"
      },
      "perfectFormGoal": {
        "title": "Wenn deine Form immer perfekt wäre – was würdest du schneller erreichen?",
        "subtitle": "Stell dir Fortschritt ohne Rückschläge vor.",
        "liftHeavierSafely": "Sicher schwerer heben",
        "buildMuscleEfficiently": "Effizient Muskeln aufbauen",
        "avoidInjuries": "Verletzungen vermeiden",
        "boostConfidence": "Selbstvertrauen steigern",
        "trainLongerWithoutSetbacks": "Länger trainieren ohne Rückschläge"
      },
      "formConfidence": {
        "title": "Wie sicher bist du dir bei deiner Technik?",
        "subtitle": "Sei ehrlich – wir bringen dich auf 100 %. ",
        "zeroToTwentyFive": "0 % - 25 %",
        "twentyFiveToFifty": "25 % - 50 %",
        "fiftyToSeventyFive": "50 % - 75 %",
        "seventyFiveToHundred": "75 % - 100 %"
      },
      "threeMonthGoal": {
        "title": "Wo willst du in 3 Monaten stehen?",
        "subtitle": "Deine Reise beginnt mit der heutigen Analyse.",
        "liftingHeavier": "Schwerer heben",
        "lookingLeaner": "Schlanker aussehen",
        "feelingStrongerInjuryFree": "Stärker & verletzungsfrei fühlen",
        "moreConsistent": "Konstanter sein",
        "moreConfident": "Selbstbewusster sein"
      },
      "measurements": {
        "title": "Größe & Gewicht",
        "subtitle": "Damit können wir Empfehlungen personalisieren",
        "height": "Größe",
        "weight": "Gewicht",
        "metric": "Metrisch",
        "imperial": "Imperial",
        "cm": "cm",
        "ft": "ft",
        "in": "in",
        "kg": "kg",
        "lbs": "lbs"
      },
      "birthDate": {
        "title": "Wann bist du geboren?",
        "subtitle": "Für altersgerechte Empfehlungen",
        "month": "Monat",
        "day": "Tag",
        "year": "Jahr"
      },
      "rating": {
        "title": "Gib uns eine Bewertung",
        "subtitle": "Hilf uns durch dein Feedback",
        "skip": "Überspringen",
        "middleText": "FormAI wurde für Gym-Fans wie dich gemacht!"
      },
      "referralCode": {
        "title": "Empfehlungscode eingeben (optional)",
        "subtitle": "Du kannst diesen Schritt überspringen.",
        "placeholder": "Empfehlungscode",
        "skip": "Überspringen",
        "submit": "Senden",
        "success": "Empfehlungscode erfolgreich angewendet",
        "error": "Ungültiger Empfehlungscode. Bitte erneut versuchen."
      },
      "allDone": {
        "title": "Alles erledigt!",
        "allDone": "Alles erledigt!",
        "thankYou": "Danke für dein Vertrauen",
        "privacy": "Wir halten deine Daten stets privat und sicher."
      },
      "trainSafer": {
        "title": "Mit Form AI dreimal geringeres Verletzungsrisiko als allein",
        "withoutFormAI": "Ohne Form AI",
        "withFormAI": "Mit Form AI",
        "description": "FormAI macht perfekte Form einfach und hält dich konsequent."
      },
      "notificationPermission": {
        "title": "Erreiche deine Ziele mit Benachrichtigungen",
        "dialogText": "FormAI möchte dir Benachrichtigungen senden",
        "allow": "Zulassen",
        "dontAllow": "Nicht zulassen"
      },
      "setupLoading": {
        "title": "",
        "mainTitle": "Wir richten alles für dich ein",
        "step1": "Dein Profil wird eingerichtet...",
        "step2": "Fast fertig..."
      },
      "freeTrial": {
        "title": "Probiere FormAI kostenlos aus.",
        "noPaymentDue": "Jetzt keine Zahlung fällig",
        "tryForFree": "Für 0,00 $ testen",
        "pricing": "Nur 39,99 $ pro Jahr (3,33 $/Monat)"
      },
      "notificationReminder": {
        "title": "Wir senden dir\neine Erinnerung,\nbevor dein Test endet",
        "noPaymentDue": "Jetzt keine Zahlung fällig",
        "continueForFree": "Kostenlos fortfahren",
        "pricing": "Nur 39,99 $ pro Jahr (3,33 $/Monat)"
      },
      "subscriptionSelection": {
        "title": "Starte deine 3-tägige KOSTENLOSE Testphase, um fortzufahren.",
        "titleMonthly": "Schalte FormAI frei, um schneller ans Ziel zu kommen",
        "today": "Heute",
        "todayDescription": "Schalte alle Funktionen wie die KI-Formanalyse frei.",
        "reminder": "In 2 Tagen – Erinnerung",
        "reminderDescription": "Wir erinnern dich daran, dass dein Test bald endet.",
        "billing": "In 3 Tagen – Abrechnung beginnt",
        "billingDescription": "Am {{billingDate}} wird abgerechnet, sofern du nicht vorher kündigst.",
        "monthly": "Monatlich",
        "monthlyPrice": "9,99 $/Monat",
        "yearly": "Jährlich",
        "yearlyPrice": "3,33 $/Monat",
        "freeTag": "3 TAGE GRATIS",
        "noPaymentDue": "Jetzt keine Zahlung fällig",
        "cancelAnytime": "Jederzeit kündbar – keine Bindung",
        "startTrial": "Meine 3-tägige kostenlose Testphase starten",
        "startToday": "Heute starten",
        "yearlyPricing": "3 Tage gratis, danach 39,99 $/Jahr (3,33 $/Monat)",
        "monthlyPricing": "Nur 9,99 $/Monat (120 $/Jahr)",
        "monthlyFeature1": "Einfache Formanalyse",
        "monthlyFeature1Description": "Analysiere jede Bewegung nur mit einem Video",
        "monthlyFeature2": "Erreiche deine Ziele",
        "monthlyFeature2Description": "Fit werden war noch nie so einfach",
        "monthlyFeature3": "Verfolge deinen Fortschritt",
        "monthlyFeature3Description": "Bleib mit Analysen und Erinnerungen auf Kurs"
      },
      "createAccount": {
        "title": "Konto erstellen",
        "signInWithApple": "Mit Apple anmelden",
        "signInWithGoogle": "Mit Google anmelden"
      },
      "cameraPermission": {
        "title": "Kamerazugriff erlauben",
        "subtitle": "Kamerazugriff ist für FormAI erforderlich.",
        "dialogText": "FormAI möchte auf deine Kamera zugreifen.",
        "allow": "Zulassen",
        "dontAllow": "Nicht zulassen"
      },
      "perfectFormGoalMessage": {
        "highlighted": {
          "liftHeavierSafely": "Sicher schwerer heben",
          "buildMuscleEfficiently": "Muskeln aufbauen",
          "avoidInjuries": "Verletzungen vermeiden",
          "boostConfidence": "Dein Selbstvertrauen steigt",
          "trainLongerWithoutSetbacks": "Ohne Rückschläge trainieren",
          "default": "Deine Ziele"
        },
        "rest": " ist ein garantiertes Ziel. Überhaupt nicht schwer!",
        "restRealistic": " ist ein realistisches Ziel. Überhaupt nicht schwer!",
        "restFantastic": " ist ein fantastisches Ziel. Überhaupt nicht schwer!",
        "restAfter": " danach. Überhaupt nicht schwer!",
        "restNormal": " wird normal sein. Überhaupt nicht schwer!",
        "restAchievable": " sind mit Form AI erreichbar. Überhaupt nicht schwer!",
        "subtitle": "95 % der Nutzer sagen, dass die Veränderung nach der Nutzung von Form AI deutlich ist."
      },
      "potentialGraph": {
        "title": "Du hast enormes Potenzial, dein Ziel zu erreichen",
        "chartTitle": "Dein Präzisionsverlauf",
        "subtitle": "Basierend auf historischen Daten verbessert sich die Präzision anfangs langsamer – nach 14 Tagen wirst du sehr konstant!"
      },
      "costComparison": {
        "title": "Perfekte Form zu einem Bruchteil der Kosten eines Trainers",
        "personalTrainer": "Personal Trainer",
        "withFormAI": "Mit Form AI",
        "costLess": "99 % günstiger",
        "description": "Sichere und perfekte Technik sollte kein Vermögen kosten."
      },
      "gymChallengeInfo": {
        "noResults": {
          "headline": "Ergebnisse brauchen Zeit – du bist näher dran, als du denkst.",
          "message": "Wir geben dir das richtige Feedback, damit sich deine Mühe auszahlt.",
          "howWeGetYouThere": [
            "Formanalyse, damit jede Wiederholung zählt",
            "Videofeedback, um Bremsklötze sichtbar zu machen",
            "Präzisions-Tracking, um echten Fortschritt zu messen"
          ]
        },
        "unsureForm": {
          "headline": "Technik zuerst.",
          "message": "Klares Feedback, damit du sicher und effektiv trainierst – jedes Mal.",
          "howWeGetYouThere": [
            "Sofortige Analyse deiner Videos",
            "Umsetzbare Tipps für schnelle Korrekturen",
            "Präzisionswerte, um Verbesserungen zu verfolgen"
          ]
        },
        "worriedInjury": {
          "headline": "Sicher trainieren. Stark werden.",
          "message": "Wir erkennen riskante Bewegungen, bevor sie zu Verletzungen führen.",
          "howWeGetYouThere": [
            "Videofeedback zu unsicheren Positionen",
            "Sicherere, auf dich zugeschnittene Technikempfehlungen",
            "Präzisions-Tracking für langfristige Konstanz"
          ]
        },
        "strugglingMotivation": {
          "headline": "Motivation fällt leichter zusammen.",
          "message": "Wir zeigen deinen Fortschritt und feiern jede Verbesserung.",
          "howWeGetYouThere": [
            "Leicht verständliche Präzisionswerte nach jedem Training",
            "Sichtbare Verbesserungen mit Trendverläufen",
            "Motivierende Tipps für mehr Beständigkeit"
          ]
        },
        "other": {
          "headline": "Wir sind für deine Reise da.",
          "message": "Egal welche Hürde – wir geben dir Anleitung und Unterstützung.",
          "howWeGetYouThere": [
            "Personalisierte Rückmeldungen zu deinen Bewegungs-Videos",
            "Präzisions-Tracking über verschiedene Übungen hinweg",
            "Kontinuierliche Tipps und Insights für deine Ziele"
          ]
        },
        "howWeGetYouThereTitle": "So bringen wir dich dorthin"
      },
      "saveProgress": {
        "title": "Konto erstellen"
      }
    },
    "months": {
      "january": "Januar",
      "february": "Februar",
      "march": "März",
      "april": "April",
      "may": "Mai",
      "june": "Juni",
      "july": "Juli",
      "august": "August",
      "september": "September",
      "october": "Oktober",
      "november": "November",
      "december": "Dezember",
      "array": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    },
    "progress": {
      "title": "Deine Reise beginnt hier",
      "subtitle": "Sieh dir an, wie Nutzer mit FormAI Technik und Leistung verbessern",
      "chartTitle": "Verbesserung des Form-Scores im Zeitverlauf",
      "week": "Woche",
      "score": "Form-Score",
      "formImprovement": "Form-Verbesserung",
      "weeksToExcellence": "Wochen bis zur Exzellenz"
    },
    "liftingGoal": {
      "title": "Was ist dein Ziel?",
      "subtitle": "Wir passen die KI an deinen Hebestil an.",
      "muscleBuilding": "Muskelaufbau",
      "powerlifting": "Powerlifting",
      "toning": "Definition",
      "strength": "Kraft",
      "weightLoss": "Gewichtsverlust"
    },
    "formBarrier": {
      "title": "Was hindert dich daran, deine Technik zu perfektionieren?",
      "subtitle": "Hilf uns, deine Herausforderungen zu verstehen",
      "expensiveTrainers": "Personal Trainer sind zu teuer",
      "gymAdviceScary": "Ich scheue mich, nach Rat zu fragen",
      "noTime": "Ich habe keine Zeit, meine Technik zu perfektionieren",
      "other": "Andere"
    },
    "home": {
      "addTestLift": "Test-Lift hinzufügen",
      "dailyAccuracyLevel": "Tägliche Präzision",
      "noLiftsToday": "Heute keine Lifts",
      "allTimeAccuracy": "Präzision insgesamt",
      "earnByReferring": "Durch Empfehlungen verdienen!",
      "yourVideoLibrary": "Deine Videobibliothek",
      "lifts": "Neueste Lifts",
      "seeAll": "Alle anzeigen",
      "noRecordedLifts": "Keine Lifts an diesem Datum",
      "startAnalyzingWorkout": "Starte die Analyse deines Trainings mit einem kurzen Video",
      "dayStreak": "{{count}}-Tage-Serie",
      "onFireMessage": "Du bist richtig stark unterwegs! Halte deine Serie am Leben.",
      "zeroDayStreak": "0-Tage-Serie",
      "noStreakMessage": "Noch keine Serie. Nimm an aufeinanderfolgenden Tagen auf, um zu starten.",
      "continue": "Weiter"
    },
    "performance": {
      "title": "Fortschritt",
      "editDateRange": "Zeitraum bearbeiten",
      "from": "Von",
      "to": "Bis",
      "reset": "Zurücksetzen",
      "apply": "Anwenden",
      "filterLifts": "Lifts filtern",
      "timeRanges": {
        "ninetyDays": "90 Tage",
        "sixMonths": "6 Monate",
        "oneYear": "1 Jahr",
        "allTime": "Gesamte Zeit",
      },
      "chartTitles": {
        "accuracyPerWeight": "Präzision pro Gewicht",
        "accuracyOverTime": "Präzision im Zeitverlauf",
        "loading": "Wird geladen...",
        "noDataAvailable": "Keine Daten verfügbar"
      },
      "info": {
        "accuracyPerWeight": {
          "title": "Präzision pro Gewicht",
          "message": "Zeigt die durchschnittliche Formpräzision für jedes gehobene Gewicht einer Bewegung. Höhere Gewichte fordern die Technik. Berechnung: Mittelwert der Präzisionswerte je Gewicht."
        },
        "accuracyOverTime": {
          "title": "Präzision im Zeitverlauf",
          "message": "Zeigt, wie sich deine Formpräzision über die Zeit für eine Bewegung verändert. Durchschnitt pro Tag, über die Daten hinweg dargestellt."
        },
        "accuracy": {
          "title": "Präzision",
          "message": "Deine durchschnittliche Präzision im gewählten Zeitraum. Mittelwert aller Präzisionswerte."
        },
        "improvement": {
          "title": "Verbesserung",
          "message": "Veränderung deiner Form im Zeitraum: Vergleich des ersten Drittels deiner Lifts mit dem letzten Drittel."
        }
      },
      "metricsFeedback": {
        "title": "Weitere Kennzahlen gewünscht? Sag es uns!",
        "subtitle": "Hilf uns, deine Erfahrung zu verbessern"
      }
    },
    "library": {
      "title": "Bibliothek",
      "editDateRange": "Zeitraum bearbeiten",
      "from": "Von",
      "to": "Bis",
      "reset": "Zurücksetzen",
      "apply": "Anwenden",
      "all": "Alle",
      "favourites": "Favoriten",
      "noLiftsAnalysed": "Keine Lifts analysiert",
      "noFavouriteLifts": "Keine Favoriten-Lifts",
      "noLiftsFound": "Keine Lifts gefunden",
      "startAnalysingWorkout": "Starte die Analyse des heutigen Trainings mit einem kurzen Video",
      "markLiftsAsFavourites": "Markiere Lifts als Favoriten, um sie hier zu sehen",
      "tryAdjustingFilters": "Versuche, die Filter anzupassen",
      "lifts": "Lifts",
      "lift": "Lift",
      "noLifts": "0",
      "selectDateRange": "Zeitraum wählen",
      "allLifts": "Alle Lifts",
      "oneLift": "1",
      "search": "Suchen",
      "liftsCount": "{{count}} Lifts",
      "filterByMovement": "Nach Bewegung filtern",
      "searchMovements": "Bewegungen suchen...",
      "allMovements": "Alle Bewegungen",
      "searchAnalysis": {
        "analysisFound": "Analyse gefunden",
        "analysisFoundNotFavourited": "Analyse gefunden, aber nicht favorisiert.",
        "continueToLift": "Zum Lift fortfahren",
        "noAnalysisFound": "Keine Analyse gefunden",
        "noAnalysisFoundMessage": "Keine Analyse für dieses Video. Bitte stelle sicher, dass es analysiert wurde.",
        "analyse": "Analysieren",
        "permissionRequired": "Berechtigung erforderlich",
        "permissionMessage": "Bitte erlaube den Zugriff auf deine Fotomediathek, um Videos zu suchen.",
        "error": "Fehler",
        "errorMessage": "Video konnte nicht ausgewählt werden. Bitte erneut versuchen."
      }
    },
    "liftCard": {
      "accuracy": "Präzision"
    },
    "loadingLift": {
      "uploadingVideo": "Video wird hochgeladen...",
      "checkingVideo": "Video wird geprüft...",
      "estimatingPose": "Pose wird geschätzt...",
      "analyzingVideo": "Video wird analysiert...",
      "analyzingForm": "Form wird analysiert...",
      "analysisFailed": "Analyse fehlgeschlagen",
      "processing": "Wird verarbeitet...",
      "errorOccurred": "Es ist ein Fehler aufgetreten",
      "pleaseTryAgain": "Bitte versuche es erneut",
      "tapToRetry": "Zum Wiederholen tippen",
      "notifyWhenDone": "Wir benachrichtigen dich, sobald wir fertig sind!",
      "noLiftFound": {
        "title": "Kein Lift gefunden",
        "subtitle": "Wir können keinen Lift erkennen"
      },
      "liftMismatch": {
        "title": "Lift stimmt nicht überein",
        "subtitle": "Die ausgewählte Bewegung passt nicht zum Video",
        "detectedMovement": "Wir erkennen dich nicht bei: {{movement}}"
      }
    },
    "feedback": {
      "liftDetails": "Lift-Details",
      "rangeOfMotionAcrossReps": "Bewegungsumfang über deine Wiederholungen",
      "benchPress": "Bankdrücken",
      "formAccuracyAcrossReps": "Formpräzision über deine Wiederholungen",
      "weight": "Gewicht",
      "reps": "Wiederholungen",
      "reviewFeedback": "Feedback ansehen",
      "favourite": "Favorit",
      "manualDeleteLiftCardData": "Lift löschen",
      "deleteLiftTitle": "Lift löschen",
      "deleteLiftMessage": "Möchtest du diesen Lift wirklich löschen? Das kann nicht rückgängig gemacht werden.",
      "cancel": "Abbrechen",
      "delete": "Löschen",
      "howItWorks": "So funktioniert’s",
      "viewFeedback": "Feedback anzeigen",
      "step1": "Unsere KI erkennt bestimmte Momente in deinem Lift, in denen du die Form verbessern kannst.",
      "step2": "Danach wird erklärt, was nicht optimal war.",
      "step3": "Anschließend erhältst du Sicherheits- und Verbesserungs-Tipps!",
      "step4": "Jetzt bist du dran: verbessere deine Form und prüfe sie in einer Woche erneut.",
      "accuracy": "Präzision",
      "accuracyScore": "Präzisions-Score",
      "improvements": "Verbesserungen",
      "noVideoAvailable": "Kein Video verfügbar",
      "deleteLiftConfirmation": "Möchtest du diesen Lift wirklich löschen? Das kann nicht rückgängig gemacht werden.",
      "lbs": "lbs",
      "kg": "kg",
      "updateFailed": {
        "weight": "Gewicht konnte nicht aktualisiert werden",
        "message": "Bitte später erneut versuchen"
      }
    },
    "common": {
      "accuracy": "Präzision",
      "averageAccuracy": "Durchschnittliche Präzision",
      "averageFormImprovement": "Durchschnittliche Formverbesserung",
      "noData": "Keine Daten",
      "selectDateRange": "Zeitraum auswählen",
      "allLifts": "Alle Lifts",
      "oneLift": "1 Lift",
      "lifts": "Lifts",
      "noLiftsFound": "Keine Lifts gefunden"
    },
    "tutorial": {
      "buttons": {
        "previous": "Zurück",
        "next": "Weiter",
        "complete": "Fertig",
        "skipGuide": "Tutorial überspringen",
        "close": "Schließen"
      },
      "addButton": {
        "title": "Lift hinzufügen",
        "description": "Mit der Schaltfläche „Hinzufügen“ startest du eine neue Lift-Analyse."
      },
      "addOptionsUpload": {
        "title": "Video importieren & aufnehmen",
        "description": "Hier kannst du ein Video importieren oder ein neues in der App aufnehmen – es wird auch in deiner Fotomediathek gespeichert.\n\nFür diese Tour importieren wir ein Demovideo."
      },
      "uploadPracticesCta": {
        "title": "Tipps & Upload",
        "description": "Hier findest du allgemeine Hinweise zur Videoqualität und wie du die besten Ergebnisse erzielst.\n\nDer nächste Schritt würde deine Mediathek öffnen, wird für die Demo aber übersprungen."
      },
      "videoPreviewContinue": {
        "title": "Video-Vorschau",
        "description": "Wenn das Video gut aussieht, wähle als Nächstes die Lift-Art."
      },
      "movementSelectionContinue": {
        "title": "Bewegung auswählen",
        "description": "Wähle eine genaue Bewegung, damit wir deine Form richtig analysieren können.\n\nFalls du sie nicht findest, schreibe dem Support – wir prüfen eine Integration."
      },
      "weightRepsComplete": {
        "title": "Gewicht & Wiederholungen",
        "description": "Damit verfolgen wir deinen Fortschritt und sehen deine Verbesserung."
      },
      "homeFirstLiftCard": {
        "title": "Tippe hier, um deine Analyse zu sehen",
        "description": "Dein Lift erscheint hier mit Analyse. Tippe für Details oder wische zum Löschen."
      },
      "liftDetailsFormGraph": {
        "title": "Formpräzision über Wiederholungen",
        "description": "Dieses Diagramm zeigt die Präzision bei jeder Wiederholung."
      },
      "liftDetailsDepthGraph": {
        "title": "Bewegungsumfang über Wiederholungen",
        "description": "Dieses Balkendiagramm zeigt die Tiefe deines Lifts über die Wiederholungen."
      },
      "liftDetailsReviewFeedback": {
        "title": "Feedback prüfen",
        "description": "Tippe auf „Feedback ansehen“, um detaillierte Analysen und Tipps zu sehen."
      },
      "howItWorksModal": {
        "title": "So funktioniert’s",
        "description": "Hier siehst du, wie unsere KI-Analyse funktioniert und dich verbessert."
      },
      "feedbackSlideshow": {
        "title": "Dein Feedback",
        "description": "Unsere KI zeigt präzise Momente, die verbessert werden sollten – mit passenden Hinweisen.\n\nTippe auf den rechten Pfeil für den nächsten Punkt."
      },
      "feedbackIssues": {
        "title": "Zu behebende Punkte",
        "description": "Überprüfe die erkannten Probleme in deiner Form.\n\nWische die Überlagerung, um den Video-Screenshot zu sehen."
      },
      "feedbackTips": {
        "title": "Verbesserungs-Tipps",
        "description": "Konkrete Tipps, um Technik und Form zu verbessern.\n\nDu kannst das Panel öffnen/schließen, um den Screenshot zu sehen."
      },
      "homeSeeAllLifts": {
        "title": "Alle deine Lifts ansehen",
        "description": "Hier findest du die Bibliothek mit Filtern, Sortierung und Verlauf."
      },
      "libraryScreen": {
        "title": "Bibliotheksansicht",
        "description": "Deine gesamte Lift-Bibliothek. Wechsle zwischen Alle und Favoriten. Sortiere, filtere und suche!\n\nTippe für Details, wische zum Löschen."
      },
      "homePerformanceIcon": {
        "title": "Deine Leistung",
        "description": "Tippe auf den Tab „Fortschritt“, um Statistiken im Zeitverlauf zu sehen."
      },
      "performanceMetrics": {
        "title": "Präzision & Verbesserung",
        "description": "Verfolge deine Werte, um Fortschritte zu messen."
      },
      "performanceChartsOverWeight": {
        "title": "Präzision pro Gewicht",
        "description": "Zeigt, bei welchen Lasten du am besten performst."
      },
      "performanceChartsOverTime": {
        "title": "Präzision im Zeitverlauf",
        "description": "Visualisiere deinen Fortschritt – typischerweise positiv nach 14 Tagen!"
      },
      "settingsFirstCard": {
        "title": "Persönliche Daten",
        "description": "Wenn sich etwas ändert, bearbeite Daten, Sprache und Einheiten."
      },
      "settingsSupportEmail": {
        "title": "Support erhalten",
        "description": "Braucht du Hilfe? Tippe hier, um den Support per E-Mail zu kontaktieren."
      },
      "completionModal": {
        "title": "Alles bereit",
        "message": "Du bist startklar für FormAI. Schau täglich rein, um deine Serie zu halten.\n\nDu kannst dieses Tutorial jederzeit über die Einstellungen erneut abspielen."
      }
    },
    "upload": {
      "permissionRequired": "Berechtigung erforderlich",
      "permissionMessage": "Bitte erlaube den Zugriff auf deine Fotomediathek.",
      "mediaPermissionTitle": "Zugriff auf Medienbibliothek erlauben",
      "mediaPermissionDialogText": "FormAI möchte auf deine Medienbibliothek zugreifen.",
      "allow": "Zulassen",
      "dontAllow": "Nicht zulassen",
      "videoTooLong": "Video zu lang",
      "videoTooLongMessage": "Bitte wähle ein Video unter 90 Sekunden.",
      "videoTooShort": "Video zu kurz",
      "videoTooShortMessage": "Bitte wähle ein Video mit mindestens 3 Sekunden.",
      "error": "Fehler",
      "failedToSelectVideo": "Videoauswahl fehlgeschlagen. Bitte erneut versuchen.",
      "failedToGenerateThumbnail": "Miniaturbild konnte nicht erstellt werden. Bitte erneut versuchen.",
      "uploadVideo": "Video hochladen",
      "selectNewVideo": "Neues Video",
      "duplicateVideo": "Doppeltes Video",
      "duplicateVideoMessage": "Dieses Video wurde bereits analysiert. Bitte wähle ein anderes.",
      "selectDifferentVideo": "Anderes Video auswählen",
      "viewAnalysis": "Analyse ansehen",
      "tips": {
        "goodLighting": "Sorge für gute Beleuchtung",
        "stableVideo": "Stabile Aufnahme sicherstellen",
        "sideView": "Seitliche Perspektive wählen"
      },
      "ok": "OK",
      "recordingFailed": "Aufnahme fehlgeschlagen. Bitte erneut versuchen.",
      "failedToStartRecording": "Aufnahme konnte nicht gestartet werden. Bitte erneut versuchen.",
      "failedToFinishRecording": "Aufnahme konnte nicht beendet werden. Bitte erneut versuchen.",
      "stopRecording": "Aufnahme stoppen?",
      "stopRecordingMessage": "Möchtest du die Aufnahme wirklich stoppen?",
      "cancel": "Abbrechen",
      "stop": "Stoppen",
      "accessibility": {
        "flipCamera": "Kamera wechseln",
        "toggleTorch": "Taschenlampe umschalten",
        "toggleMic": "Mikrofon umschalten",
        "countdown": "Countdown"
      }
    }
  },
  fr: {
    "loading": "Chargement…",
    "getStarted": "Commencer",
    "signIn": "Se connecter",
    "dontHaveAccount": "Vous n'avez pas de compte ?",
    "startToday": "Commencer aujourd'hui",
    "alreadyHaveAccount": "Vous avez déjà un compte ?",
    "next": "Continuer",
    "back": "Retour",
    "tabs": {
      "home": "Accueil",
      "progress": "Progression",
      "settings": "Paramètres"
    },
    "settings": {
      "personalDetails": "Informations personnelles",
      "language": "Langue",
      "selectLanguage": "Choisir la langue",
      "units": "Changer les unités",
      "appTheme": "Thème de l’app",
      "whyLowQualityVideos": "Pourquoi mes vidéos sont-elles de faible qualité ?",
      "referFriends": "Parrainer des amis",
      "growStrongerTogether": "Devenez plus forts ensemble !",
      "currentBalance": "Solde actuel",
      "shareNow": "Partager maintenant",
      "sharePageTitle": "Partager FormAI",
      "termsAndConditions": "Conditions d’utilisation",
      "privacyPolicy": "Politique de confidentialité",
      "supportEmail": "E-mail d’assistance",
      "replayTutorial": "Revoir le tutoriel",
      "leaveRating": "Laisser une note",
      "deleteAccount": "Supprimer le compte",
      "logout": "Se déconnecter",
      "save": "Enregistrer",
      "deleteAccountTitle": "Supprimer le compte ?",
      "deleteAccountMessage": "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes les données seront supprimées.",
      "deleteAccountSubscriptionWarning": "Supprimer votre compte Form AI dans l’app n’annule pas votre abonnement. Pensez à l’annuler dans les réglages d’abonnements de votre appareil pour éviter toute facturation.",
      "iAcknowledge": "Je reconnais",
      "deleteAccountButton": "Supprimer le compte",
      "logoutTitle": "Se déconnecter ?",
      "logoutMessage": "Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.",
      "no": "Non",
      "yes": "Oui",
      "editFailed": {
        "gender": "Échec de modification du genre",
        "height": "Échec de modification de la taille",
        "dateOfBirth": "Échec de modification de la date de naissance",
        "currentWeight": "Échec de modification du poids",
        "unitSystem": "Échec de mise à jour des unités",
        "language": "Échec de mise à jour de la langue",
        "message": "Veuillez réessayer plus tard"
      }
    },
    "share": {
      "referYourFriends": "Parrainez vos amis",
      "empowerYourFriends": "Aidez vos amis à progresser",
      "yourPersonalPromoCode": "Votre code promo personnel",
      "share": "Partager",
      "howItWorks": "Comment ça marche",
      "step1": "Partagez le code avec vos amis",
      "step2": "Gagnez 5 $ par ami qui s’abonne au plan annuel avec votre code",
      "copied": "Copié !",
      "promoCodeCopied": "Code promo copié dans le presse-papiers",
      "error": "Erreur",
      "failedToCopy": "Échec de la copie du code promo",
      "failedToShare": "Échec de l’ouverture de la fenêtre de partage",
      "shareMessage": "Salut ! Télécharge cette app et utilise ce code promo :",
      "shareTitle": "Téléchargez FormAI !"
    },
    "personalDetails": {
      "currentWeight": "Poids actuel",
      "weight": "Poids",
      "height": "Taille",
      "dateOfBirth": "Date de naissance",
      "gender": "Genre",
      "videoQuality": "Qualité vidéo",
      "editCurrentWeight": "Modifier le poids actuel",
      "editHeight": "Modifier la taille",
      "editDateOfBirth": "Modifier la date de naissance",
      "editGender": "Modifier le genre",
      "male": "Homme",
      "female": "Femme"
    },
    "add": {
      "uploadVideo": "Importer une vidéo",
      "recordVideo": "Enregistrer une vidéo",
      "uploadVideoDescription": "Sélectionnez une vidéo depuis votre galerie pour analyser votre technique.",
      "recordVideoDescription": "Enregistrez une nouvelle vidéo pour analyser votre mouvement.",
      "whatExercise": "Quel exercice faisiez-vous ?",
      "back": "Retour",
      "noVideoAvailable": "Aucune vidéo disponible",
      "selectNewVideo": "Nouvelle vidéo",
      "continue": "Continuer",
      "generalTips": "Conseils généraux",
      "searchMovements": "Rechercher des mouvements…",
      "useCustomMovement": "Utiliser",
      "bestRecordingPractices": "Bonnes pratiques d’enregistrement",
      "bodyParts": {
        "all": "Tous",
        "chest": "Poitrine",
        "back": "Dos",
        "shoulders": "Épaules",
        "arms": "Bras",
        "legs": "Jambes"
      },
      "movements": {
        "Flat Barbell Bench Press": "Développé couché barre",
        "Incline Barbell Bench Press": "Développé incliné barre",
        "Decline Barbell Bench Press": "Développé décliné barre",
        "Flat Dumbbell Chest Press": "Développé couché haltères",
        "Incline Dumbbell Chest Press": "Développé incliné haltères",
        "Decline Dumbbell Chest Press": "Développé décliné haltères",
        "Dumbbell Chest Fly (Incline)": "Écarté haltères (incliné)",
        "Dumbbell Chest Fly (Flat)": "Écarté haltères (couché)",
        "Dumbbell Chest Fly (Decline)": "Écarté haltères (décliné)",
        "Deadlift": "Soulevé de terre",
        "Barbell Row": "Rowing barre",
        "Pendlay Row": "Rowing Pendlay",
        "T-Bar Row": "Rowing T-bar",
        "Dumbbell Row": "Rowing haltère",
        "Single Arm Dumbbell Row": "Rowing unilatéral haltère",
        "Overhead Barbell Press": "Développé militaire barre",
        "Seated Dumbbell Shoulder Press": "Développé épaules assis haltères",
        "Arnold Press": "Développé Arnold",
        "Lateral Raise (Dumbbell)": "Élévations latérales (haltères)",
        "Front Raise (Dumbbell)": "Élévations frontales (haltères)",
        "Upright Row": "Tirage menton",
        "Barbell Curl": "Curl barre",
        "EZ-Bar Curl": "Curl barre EZ",
        "Dumbbell Curl": "Curl haltères",
        "Hammer Curl": "Curl marteau",
        "Incline Dumbbell Curl": "Curl incliné haltères",
        "Cable Curl": "Curl à la poulie",
        "Preacher Curl": "Curl pupitre",
        "Skullcrusher (Barbell or EZ-Bar)": "Barre au front (barre ou EZ)",
        "Dumbbell Overhead Triceps Extension": "Extension triceps au-dessus de la tête (haltère)",
        "Barbell Back Squat": "Back squat barre",
        "Barbell Front Squat": "Front squat barre",
        "Goblet Squat": "Goblet squat",
        "Dumbbell Back Squat": "Back squat haltères",
        "Romanian Deadlift (Barbell or Dumbbell)": "Soulevé de terre roumain (barre ou haltères)",
        "Stiff-Leg Deadlift": "Soulevé de terre jambes tendues",
        "Good Morning": "Good morning",
        "Push Ups": "Pompes"
      },
      "recordingTips": [
        "Assurez un bon éclairage et une caméra stable",
        "Essayez de vous filmer de profil"
      ],
      "countdown": {
        "title": "Compte à rebours",
        "off": "Désactivé",
        "fiveSeconds": "5 s",
        "tenSeconds": "10 s"
      }
    },
    "welcome": {
      "title": "FormAI",
      "subtitle": "Une technique parfaite, toujours",
      "modal": {
        "title": "Bienvenue",
        "message": "Merci de faire confiance à Form AI. Nous sommes ravis de vous aider à atteindre vos objectifs.",
        "ctaButton": "Faisons une visite"
      }
    },
    "onboarding": {
      "language": {
        "title": "Langue",
        "subtitle": "Vous pourrez toujours changer plus tard",
        "selectLanguage": "Sélectionnez une langue"
      },
      "units": {
        "title": "Unités",
        "subtitle": "Vous pourrez toujours changer plus tard",
        "metric": "Métrique",
        "imperial": "Impériales",
        "metricDescription": "Kilogrammes et centimètres",
        "imperialDescription": "Livres, pieds, pouces"
      },
      "gender": {
        "title": "Genre biologique",
        "subtitle": "Cela nous aide à trouver la biomécanique optimale pour vous",
        "male": "Homme",
        "female": "Femme",
        "other": "Autre"
      },
      "goal": {
        "title": "Quel est votre objectif ?",
        "subtitle": "Cela nous aide à générer un plan calorique.",
        "loseWeight": "Perdre du poids",
        "maintain": "Maintenir",
        "gainWeight": "Prendre du poids"
      },
      "workouts": {
        "title": "Combien d’entraînements faites-vous par semaine ?",
        "subtitle": "Votre fréquence détermine vos progrès.",
        "zeroToTwo": "0–2",
        "zeroToTwoDescription": "Séances occasionnelles",
        "threeToFive": "3–5",
        "threeToFiveDescription": "Quelques fois par semaine",
        "SixPlus": "6+",
        "SixPlusDescription": "Athlète discipliné"
      },
      "discovery": {
        "title": "Comment nous avez-vous découverts ?",
        "subtitle": "Aidez-nous à comprendre comment vous avez trouvé FormAI",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "facebook": "Facebook",
        "google": "Google",
        "appStore": "App Store",
        "playStore": "Play Store",
        "twitter": "X (Twitter)",
        "youtube": "YouTube",
        "friends": "Amis & famille",
        "other": "Autre"
      },
      "personalTrainer": {
        "title": "Avez-vous un coach personnel ?",
        "subtitle": "Cela nous aide à personnaliser votre expérience",
        "yes": "Oui",
        "no": "Non"
      },
      "trainingReason": {
        "title": "Pourquoi vous entraînez-vous avant tout ?",
        "subtitle": "Nous adapterons l’analyse à votre objectif.",
        "buildStrength": "Développer la force",
        "improvePhysique": "Améliorer la silhouette",
        "preventInjury": "Prévenir les blessures",
        "trainForSport": "S’entraîner pour un sport",
        "stayActiveHealthy": "Rester actif et en bonne santé"
      },
      "gymChallenge": {
        "title": "Votre plus grand défi en salle ?",
        "subtitle": "Concentrons-nous sur l’essentiel pour vous.",
        "unsureForm": "Je ne suis pas sûr de ma technique",
        "noResults": "Je ne vois pas de résultats",
        "worriedInjury": "J’ai peur de me blesser",
        "strugglingMotivation": "Manque de motivation",
        "other": "Autre"
      },
      "lifterType": {
        "title": "Comment vous voyez-vous en tant que pratiquant ?",
        "subtitle": "Votre niveau guide nos conseils.",
        "beginner": "Débutant, j’apprends les bases",
        "intermediate": "Intermédiaire, je peaufine la technique",
        "advanced": "Avancé, je vise la performance",
        "returningAfterBreak": "Reprise après une pause",
        "injuryRehab": "Rééducation"
      },
      "perfectFormGoal": {
        "title": "Avec une technique parfaite, que réaliseriez-vous plus vite ?",
        "subtitle": "Projetez votre progression sans obstacles.",
        "liftHeavierSafely": "Soulever plus lourd en sécurité",
        "buildMuscleEfficiently": "Construire du muscle efficacement",
        "avoidInjuries": "Éviter les blessures",
        "boostConfidence": "Gagner en confiance",
        "trainLongerWithoutSetbacks": "S’entraîner plus longtemps sans contretemps"
      },
      "formConfidence": {
        "title": "Quel est votre niveau de confiance technique ?",
        "subtitle": "Soyez honnête, nous viserons 100 %.",
        "zeroToTwentyFive": "0 % - 25 %",
        "twentyFiveToFifty": "25 % - 50 %",
        "fiftyToSeventyFive": "50 % - 75 %",
        "seventyFiveToHundred": "75 % - 100 %"
      },
      "threeMonthGoal": {
        "title": "Dans 3 mois, où voulez-vous être ?",
        "subtitle": "Votre parcours commence avec l’analyse d’aujourd’hui.",
        "liftingHeavier": "Soulever plus lourd",
        "lookingLeaner": "Paraître plus sec",
        "feelingStrongerInjuryFree": "Plus fort et sans blessure",
        "moreConsistent": "Plus régulier",
        "moreConfident": "Plus confiant"
      },
      "measurements": {
        "title": "Taille & poids",
        "subtitle": "Cela nous aide à personnaliser nos recommandations",
        "height": "Taille",
        "weight": "Poids",
        "metric": "Métrique",
        "imperial": "Impériales",
        "cm": "cm",
        "ft": "pi",
        "in": "po",
        "kg": "kg",
        "lbs": "lb"
      },
      "birthDate": {
        "title": "Quand êtes-vous né(e) ?",
        "subtitle": "Pour des recommandations adaptées à l’âge",
        "month": "Mois",
        "day": "Jour",
        "year": "Année"
      },
      "rating": {
        "title": "Donnez-nous une note",
        "subtitle": "Aidez-nous à nous améliorer",
        "skip": "Ignorer",
        "middleText": "FormAI est fait pour les passionnés de salle comme vous !"
      },
      "referralCode": {
        "title": "Saisir un code de parrainage (optionnel)",
        "subtitle": "Vous pouvez passer cette étape.",
        "placeholder": "Code de parrainage",
        "skip": "Ignorer",
        "submit": "Valider",
        "success": "Code de parrainage appliqué avec succès",
        "error": "Code invalide. Veuillez réessayer."
      },
      "allDone": {
        "title": "C’est terminé !",
        "allDone": "C’est terminé !",
        "thankYou": "Merci pour votre confiance",
        "privacy": "Nous garderons toujours vos informations privées et sécurisées."
      },
      "trainSafer": {
        "title": "3 fois moins de risque de blessure avec Form AI que seul",
        "withoutFormAI": "Sans Form AI",
        "withFormAI": "Avec Form AI",
        "description": "FormAI facilite une technique parfaite et votre assiduité."
      },
      "notificationPermission": {
        "title": "Atteignez vos objectifs avec les notifications",
        "dialogText": "FormAI souhaite vous envoyer des notifications",
        "allow": "Autoriser",
        "dontAllow": "Ne pas autoriser"
      },
      "setupLoading": {
        "title": "",
        "mainTitle": "Nous préparons tout pour vous",
        "step1": "Configuration de votre profil…",
        "step2": "Presque prêt…"
      },
      "freeTrial": {
        "title": "Essayez FormAI gratuitement.",
        "noPaymentDue": "Aucun paiement maintenant",
        "tryForFree": "Essayer pour 0,00 $",
        "pricing": "Seulement 39,99 $ / an (3,33 $/mois)"
      },
      "notificationReminder": {
        "title": "Nous vous enverrons\nun rappel avant la fin\nde votre essai",
        "noPaymentDue": "Aucun paiement maintenant",
        "continueForFree": "Continuer GRATUITEMENT",
        "pricing": "Seulement 39,99 $ / an (3,33 $/mois)"
      },
      "subscriptionSelection": {
        "title": "Commencez votre essai GRATUIT de 3 jours pour continuer.",
        "titleMonthly": "Débloquez FormAI pour atteindre vos objectifs plus vite",
        "today": "Aujourd’hui",
        "todayDescription": "Débloquez toutes les fonctionnalités comme l’analyse IA de la technique.",
        "reminder": "Dans 2 jours - Rappel",
        "reminderDescription": "Nous vous rappellerons la fin prochaine de l’essai.",
        "billing": "Dans 3 jours - Début de la facturation",
        "billingDescription": "Vous serez facturé le {{billingDate}} sauf annulation avant.",
        "monthly": "Mensuel",
        "monthlyPrice": "9,99 $/mois",
        "yearly": "Annuel",
        "yearlyPrice": "3,33 $/mois",
        "freeTag": "3 JOURS OFFERTS",
        "noPaymentDue": "Aucun paiement maintenant",
        "cancelAnytime": "Annulable à tout moment - Sans engagement",
        "startTrial": "Démarrer mon essai gratuit de 3 jours",
        "startToday": "Commencer aujourd’hui",
        "yearlyPricing": "3 jours offerts, puis 39,99 $ / an (3,33 $/mois)",
        "monthlyPricing": "Seulement 9,99 $/mois (120 $/an)",
        "monthlyFeature1": "Analyse simple de la technique",
        "monthlyFeature1Description": "Analysez n’importe quel mouvement avec une simple vidéo",
        "monthlyFeature2": "Atteignez vos objectifs",
        "monthlyFeature2Description": "Se remettre en forme n’a jamais été aussi simple",
        "monthlyFeature3": "Suivez votre progression",
        "monthlyFeature3Description": "Restez sur la bonne voie avec des analyses et des rappels"
      },
      "createAccount": {
        "title": "Créer un compte",
        "signInWithApple": "Se connecter avec Apple",
        "signInWithGoogle": "Se connecter avec Google"
      },
      "cameraPermission": {
        "title": "Autoriser l’accès à la caméra",
        "subtitle": "L’accès caméra est requis pour FormAI.",
        "dialogText": "FormAI souhaite accéder à votre caméra.",
        "allow": "Autoriser",
        "dontAllow": "Ne pas autoriser"
      },
      "perfectFormGoalMessage": {
        "highlighted": {
          "liftHeavierSafely": "Soulever plus lourd en sécurité",
          "buildMuscleEfficiently": "Construire du muscle",
          "avoidInjuries": "Éviter les blessures",
          "boostConfidence": "Votre confiance va décoller",
          "trainLongerWithoutSetbacks": "S’entraîner sans contretemps",
          "default": "Vos objectifs"
        },
        "rest": " est un objectif garanti. Ce n’est pas difficile du tout !",
        "restRealistic": " est un objectif réaliste. Ce n’est pas difficile du tout !",
        "restFantastic": " est un objectif fantastique. Ce n’est pas difficile du tout !",
        "restAfter": " ensuite. Ce n’est pas difficile du tout !",
        "restNormal": " deviendra normal. Ce n’est pas difficile du tout !",
        "restAchievable": " sont atteignables avec Form AI. Ce n’est pas difficile du tout !",
        "subtitle": "95 % des utilisateurs constatent un changement net après avoir utilisé Form AI."
      },
      "potentialGraph": {
        "title": "Vous avez un potentiel incroyable pour atteindre votre objectif",
        "chartTitle": "Transition de votre précision",
        "subtitle": "D’après les données historiques de Form AI, l’amélioration est lente au début, puis après 14 jours vous devenez très régulier !"
      },
      "costComparison": {
        "title": "Une technique parfaite pour une fraction du coût d’un coach",
        "personalTrainer": "Coach personnel",
        "withFormAI": "Avec Form AI",
        "costLess": "99 % moins cher",
        "description": "S’entraîner en sécurité avec une technique parfaite ne devrait pas coûter une fortune."
      },
      "gymChallengeInfo": {
        "noResults": {
          "headline": "Les résultats prennent du temps, mais vous êtes plus proche que vous ne le pensez.",
          "message": "Nous vous guiderons avec les bons retours pour valoriser vos efforts.",
          "howWeGetYouThere": [
            "Analyse de la technique pour que chaque rep compte",
            "Retours vidéo pour mettre en évidence ce qui freine",
            "Suivi de précision pour mesurer le progrès réel"
          ]
        },
        "unsureForm": {
          "headline": "La technique avant tout.",
          "message": "Nous vous donnerons des retours clairs pour vous entraîner en sécurité et efficacement, à chaque séance.",
          "howWeGetYouThere": [
            "Décomposition instantanée de la technique depuis vos vidéos",
            "Conseils actionnables pour corriger rapidement",
            "Scores de précision pour suivre l’amélioration"
          ]
        },
        "worriedInjury": {
          "headline": "Entraînez-vous en sécurité. Entraînez-vous fort.",
          "message": "Nous détectons les mouvements risqués avant qu’ils ne causent une blessure.",
          "howWeGetYouThere": [
            "Retours vidéo sur les positions dangereuses",
            "Recommandations techniques plus sûres et personnalisées",
            "Suivi de précision pour une constance durable"
          ]
        },
        "strugglingMotivation": {
          "headline": "La motivation est plus facile à plusieurs.",
          "message": "Nous vous impliquons en rendant vos progrès visibles et en célébrant chaque amélioration.",
          "howWeGetYouThere": [
            "Scores de précision lisibles après chaque séance",
            "Améliorations visibles avec tendances de progression",
            "Conseils motivants pour rester régulier"
          ]
        },
        "other": {
          "headline": "Nous sommes là pour votre parcours.",
          "message": "Quel que soit votre défi, nous vous donnons l’accompagnement pour le dépasser.",
          "howWeGetYouThere": [
            "Retours personnalisés sur vos vidéos de mouvement",
            "Suivi de la précision selon les types d’exercices",
            "Conseils et insights continus pour vos objectifs"
          ]
        },
        "howWeGetYouThereTitle": "Voici comment nous allons y parvenir"
      },
      "saveProgress": {
        "title": "Créer un compte"
      }
    },
    "months": {
      "january": "Janvier",
      "february": "Février",
      "march": "Mars",
      "april": "Avril",
      "may": "Mai",
      "june": "Juin",
      "july": "Juillet",
      "august": "Août",
      "september": "Septembre",
      "october": "Octobre",
      "november": "Novembre",
      "december": "Décembre",
      "array": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    },
    "progress": {
      "title": "Votre parcours commence ici",
      "subtitle": "Voyez comment les utilisateurs améliorent leur technique et leurs performances avec FormAI",
      "chartTitle": "Amélioration du score de technique dans le temps",
      "week": "Semaine",
      "score": "Score de technique",
      "formImprovement": "Amélioration de la technique",
      "weeksToExcellence": "Semaines vers l’excellence"
    },
    "liftingGoal": {
      "title": "Quel est votre objectif ?",
      "subtitle": "Nous adaptons l’IA à votre style de levée.",
      "muscleBuilding": "Prise de muscle",
      "powerlifting": "Powerlifting",
      "toning": "Tonicité",
      "strength": "Force",
      "weightLoss": "Perte de poids"
    },
    "formBarrier": {
      "title": "Qu’est-ce qui vous empêche de parfaire votre technique ?",
      "subtitle": "Aidez-nous à comprendre vos difficultés",
      "expensiveTrainers": "Les coachs personnels sont trop chers",
      "gymAdviceScary": "Demander des conseils me met mal à l’aise",
      "noTime": "Je n’ai pas le temps de perfectionner ma technique",
      "other": "Autre"
    },
    "home": {
      "addTestLift": "Ajouter un test de levée",
      "dailyAccuracyLevel": "Précision quotidienne",
      "noLiftsToday": "Aucune levée aujourd’hui",
      "allTimeAccuracy": "Précision historique",
      "earnByReferring": "Gagnez en parrainant !",
      "yourVideoLibrary": "Votre bibliothèque vidéo",
      "lifts": "Levées récentes",
      "seeAll": "Voir tout",
      "noRecordedLifts": "Aucune levée enregistrée à cette date",
      "startAnalyzingWorkout": "Commencez l’analyse de votre séance avec une courte vidéo",
      "dayStreak": "Série de {{count}} jours",
      "onFireMessage": "Vous êtes en feu ! Continuez votre belle série.",
      "zeroDayStreak": "Série de 0 jour",
      "noStreakMessage": "Pas encore de série. Enregistrez sur des jours consécutifs pour démarrer.",
      "continue": "Continuer"
    },
    "performance": {
      "title": "Progression",
      "editDateRange": "Modifier la période",
      "from": "Du",
      "to": "Au",
      "reset": "Réinitialiser",
      "apply": "Appliquer",
      "filterLifts": "Filtrer les levées",
      "timeRanges": {
        "ninetyDays": "90 Jours",
        "sixMonths": "6 Mois",
        "oneYear": "1 An",
        "allTime": "Tout le temps",
      },
      "chartTitles": {
        "accuracyPerWeight": "Précision par poids",
        "accuracyOverTime": "Précision dans le temps",
        "loading": "Chargement…",
        "noDataAvailable": "Aucune donnée disponible"
      },
      "info": {
        "accuracyPerWeight": {
          "title": "Précision par poids",
          "message": "Affiche la précision moyenne pour chaque poids soulevé pour un mouvement donné. Les charges plus lourdes peuvent mettre la technique à l’épreuve. Calcul : moyenne des scores pour chaque poids."
        },
        "accuracyOverTime": {
          "title": "Précision dans le temps",
          "message": "Montre l’évolution de votre précision pour un mouvement. Moyenne par jour, tracée sur la période."
        },
        "accuracy": {
          "title": "Précision",
          "message": "Votre précision moyenne sur la période sélectionnée. Moyenne des scores de toutes les levées."
        },
        "improvement": {
          "title": "Amélioration",
          "message": "Évolution de votre technique sur la période : comparaison du premier tiers de levées avec le dernier tiers."
        }
      },
      "metricsFeedback": {
        "title": "Envie d’autres métriques ? Dites-le nous !",
        "subtitle": "Aidez-nous à améliorer votre expérience"
      }
    },
    "library": {
      "title": "Bibliothèque",
      "editDateRange": "Modifier la période",
      "from": "Du",
      "to": "Au",
      "reset": "Réinitialiser",
      "apply": "Appliquer",
      "all": "Tous",
      "favourites": "Favoris",
      "noLiftsAnalysed": "Aucune levée analysée",
      "noFavouriteLifts": "Aucune levée favorite",
      "noLiftsFound": "Aucune levée trouvée",
      "startAnalysingWorkout": "Commencez l’analyse d’aujourd’hui avec une courte vidéo",
      "markLiftsAsFavourites": "Marquez des levées en favori pour les voir ici",
      "tryAdjustingFilters": "Essayez d’ajuster les filtres",
      "lifts": "levées",
      "lift": "levée",
      "noLifts": "0",
      "selectDateRange": "Sélectionner une période",
      "allLifts": "Toutes les levées",
      "oneLift": "1",
      "search": "Rechercher",
      "liftsCount": "{{count}} levées",
      "filterByMovement": "Filtrer par mouvement",
      "searchMovements": "Rechercher des mouvements…",
      "allMovements": "Tous les mouvements",
      "searchAnalysis": {
        "analysisFound": "Analyse trouvée",
        "analysisFoundNotFavourited": "Analyse trouvée mais non ajoutée aux favoris.",
        "continueToLift": "Aller à la levée",
        "noAnalysisFound": "Aucune analyse trouvée",
        "noAnalysisFoundMessage": "Aucune analyse pour cette vidéo. Assurez-vous qu'elle a été analysée.",
        "analyse": "Analyser",
        "permissionRequired": "Autorisation requise",
        "permissionMessage": "Veuillez autoriser l'accès à votre photothèque pour rechercher des vidéos.",
        "error": "Erreur",
        "errorMessage": "Échec de la sélection de la vidéo. Réessayez."
      }
    },
    "liftCard": {
      "accuracy": "Précision"
    },
    "loadingLift": {
      "uploadingVideo": "Téléversement de la vidéo…",
      "checkingVideo": "Vérification de la vidéo…",
      "estimatingPose": "Estimation de la posture…",
      "analyzingVideo": "Analyse de la vidéo…",
      "analyzingForm": "Analyse de la technique…",
      "analysisFailed": "Échec de l’analyse",
      "processing": "Traitement…",
      "errorOccurred": "Une erreur est survenue",
      "pleaseTryAgain": "Veuillez réessayer",
      "tapToRetry": "Touchez pour réessayer",
      "notifyWhenDone": "Nous vous avertirons une fois terminé !",
      "noLiftFound": {
        "title": "Aucune levée détectée",
        "subtitle": "Nous ne pouvons pas détecter de levée"
      },
      "liftMismatch": {
        "title": "Incohérence de mouvement",
        "subtitle": "Le mouvement sélectionné ne correspond pas à la vidéo",
        "detectedMovement": "Nous ne vous détectons pas en train de réaliser : {{movement}}"
      }
    },
    "feedback": {
      "liftDetails": "Détails de la levée",
      "rangeOfMotionAcrossReps": "Amplitude sur vos répétitions",
      "benchPress": "Développé couché",
      "formAccuracyAcrossReps": "Précision sur vos répétitions",
      "weight": "Poids",
      "reps": "Répétitions",
      "reviewFeedback": "Consulter les retours",
      "favourite": "Favori",
      "manualDeleteLiftCardData": "Supprimer la levée",
      "deleteLiftTitle": "Supprimer la levée",
      "deleteLiftMessage": "Êtes-vous sûr de vouloir supprimer cette levée ? Action irréversible.",
      "cancel": "Annuler",
      "delete": "Supprimer",
      "howItWorks": "Comment ça marche",
      "viewFeedback": "Voir les retours",
      "step1": "Notre IA repère des moments précis de votre levée où améliorer la technique.",
      "step2": "Elle explique ensuite ce qui n’était pas optimal.",
      "step3": "Des conseils de sécurité et d’amélioration sont fournis !",
      "step4": "À vous de progresser puis de revoir dans une semaine.",
      "accuracy": "Précision",
      "accuracyScore": "Score de précision",
      "improvements": "Améliorations",
      "noVideoAvailable": "Aucune vidéo disponible",
      "deleteLiftConfirmation": "Confirmez la suppression de cette levée. Action irréversible.",
      "lbs": "lb",
      "kg": "kg",
      "updateFailed": {
        "weight": "Échec de mise à jour du poids",
        "message": "Veuillez réessayer plus tard"
      }
    },
    "common": {
      "accuracy": "Précision",
      "averageAccuracy": "Précision moyenne",
      "averageFormImprovement": "Amélioration moyenne de la technique",
      "noData": "Aucune donnée",
      "selectDateRange": "Sélectionnez une période",
      "allLifts": "Toutes les levées",
      "oneLift": "1 levée",
      "lifts": "Levées",
      "noLiftsFound": "Aucune levée trouvée"
    },
    "tutorial": {
      "buttons": {
        "previous": "Précédent",
        "next": "Continuer",
        "complete": "Terminer",
        "skipGuide": "Ignorer le tutoriel",
        "close": "Fermer"
      },
      "addButton": {
        "title": "Ajouter une levée",
        "description": "Utilisez le bouton Ajouter pour lancer une nouvelle analyse."
      },
      "addOptionsUpload": {
        "title": "Importer & enregistrer une vidéo",
        "description": "Ici, vous pouvez importer une vidéo ou en enregistrer une nouvelle via l’app, elle sera aussi enregistrée dans votre photothèque.\n\nPour cette démonstration, nous importerons une vidéo d’exemple."
      },
      "uploadPracticesCta": {
        "title": "Conseils & import",
        "description": "Trouvez ici des conseils sur la qualité vidéo et comment obtenir les meilleurs résultats.\n\nL’étape suivante ouvrirait votre photothèque, mais nous allons la passer pour la démo."
      },
      "videoPreviewContinue": {
        "title": "Aperçu vidéo",
        "description": "Si la vidéo vous convient, continuez pour choisir le type de mouvement."
      },
      "movementSelectionContinue": {
        "title": "Choisir un mouvement",
        "description": "Sélectionnez un mouvement précis pour nous aider à analyser votre technique.\n\nSi vous ne trouvez pas un mouvement, écrivez à l’assistance et nous envisagerons de l’ajouter."
      },
      "weightRepsComplete": {
        "title": "Poids & répétitions",
        "description": "Servent à suivre votre progression et vos améliorations."
      },
      "homeFirstLiftCard": {
        "title": "Touchez ici pour voir votre analyse",
        "description": "Votre levée apparaît ici avec l’analyse. Touchez pour plus de détails ou balayez pour supprimer."
      },
      "liftDetailsFormGraph": {
        "title": "Précision par répétition",
        "description": "Ce graphique montre la variation de votre précision sur chaque répétition."
      },
      "liftDetailsDepthGraph": {
        "title": "Amplitude par répétition",
        "description": "Ce diagramme en barres montre la profondeur de votre levée par répétition."
      },
      "liftDetailsReviewFeedback": {
        "title": "Consultez vos retours",
        "description": "Touchez « Consulter les retours » pour voir l’analyse détaillée et les conseils d’amélioration."
      },
      "howItWorksModal": {
        "title": "Comment ça marche",
        "description": "Découvrez comment notre analyse IA fonctionne et vous aide à progresser."
      },
      "feedbackSlideshow": {
        "title": "Vos retours",
        "description": "Notre IA souligne des instants précis à améliorer. Les problèmes et conseils liés à ce moment s’affichent ici.\n\nBalayez vers la droite pour le point suivant."
      },
      "feedbackIssues": {
        "title": "Points à corriger",
        "description": "Examinez les problèmes détectés dans votre technique.\n\nBalayez la superposition pour voir la capture vidéo."
      },
      "feedbackTips": {
        "title": "Conseils d’amélioration",
        "description": "Des conseils concrets pour améliorer votre technique.\n\nVous pouvez ouvrir/fermer le panneau pour voir la capture du problème."
      },
      "homeSeeAllLifts": {
        "title": "Voir toutes vos levées",
        "description": "Accédez à la bibliothèque pour filtrer, trier et revoir votre historique."
      },
      "libraryScreen": {
        "title": "Écran Bibliothèque",
        "description": "Votre bibliothèque regroupe toutes vos levées. Utilisez les onglets pour Tous/Favoris. Triez, filtrez et cherchez !\n\nTouchez une levée pour le détail, balayez pour supprimer."
      },
      "homePerformanceIcon": {
        "title": "Votre progression",
        "description": "Touchez l’onglet Progression pour vos stats dans le temps."
      },
      "performanceMetrics": {
        "title": "Précision & amélioration",
        "description": "Suivez vos métriques pour mesurer vos progrès."
      },
      "performanceChartsOverWeight": {
        "title": "Précision par poids",
        "description": "Comprenez votre progression et à quelles charges vous performez le mieux."
      },
      "performanceChartsOverTime": {
        "title": "Précision dans le temps",
        "description": "Visualisez votre progression. Nous attendons une tendance positive sous 14 jours !"
      },
      "settingsFirstCard": {
        "title": "Informations personnelles",
        "description": "Si quelque chose change, modifiez vos infos, langue et unités."
      },
      "settingsSupportEmail": {
        "title": "Obtenir de l’aide",
        "description": "Besoin d’aide ? Touchez ici pour contacter le support par e-mail."
      },
      "completionModal": {
        "title": "Tout est prêt",
        "message": "Vous êtes prêt à utiliser FormAI. Revenez chaque jour pour garder votre série et rester constant.\n\nVous pouvez rejouer ce tutoriel à tout moment depuis les paramètres."
      }
    },
    "upload": {
      "permissionRequired": "Autorisation requise",
      "permissionMessage": "Veuillez accorder l’accès à votre photothèque.",
      "mediaPermissionTitle": "Autoriser l’accès à la médiathèque",
      "mediaPermissionDialogText": "FormAI souhaite accéder à votre médiathèque.",
      "allow": "Autoriser",
      "dontAllow": "Ne pas autoriser",
      "videoTooLong": "Vidéo trop longue",
      "videoTooLongMessage": "Choisissez une vidéo de moins de 90 secondes.",
      "videoTooShort": "Vidéo trop courte",
      "videoTooShortMessage": "Choisissez une vidéo d’au moins 3 secondes.",
      "error": "Erreur",
      "failedToSelectVideo": "Échec de la sélection. Réessayez.",
      "failedToGenerateThumbnail": "Échec de la miniature. Réessayez.",
      "uploadVideo": "Importer une vidéo",
      "selectNewVideo": "Nouvelle vidéo",
      "duplicateVideo": "Vidéo dupliquée",
      "duplicateVideoMessage": "Cette vidéo a déjà été analysée. Veuillez en choisir une autre.",
      "selectDifferentVideo": "Choisir une autre vidéo",
      "viewAnalysis": "Voir l’analyse",
      "tips": {
        "goodLighting": "Assurez un bon éclairage",
        "stableVideo": "Stabilisez la vidéo",
        "sideView": "Filmez-vous de profil"
      },
      "ok": "OK",
      "recordingFailed": "Échec de l’enregistrement. Réessayez.",
      "failedToStartRecording": "Impossible de démarrer l’enregistrement. Réessayez.",
      "failedToFinishRecording": "Impossible de terminer l’enregistrement. Réessayez.",
      "stopRecording": "Arrêter l’enregistrement ?",
      "stopRecordingMessage": "Voulez-vous vraiment arrêter l’enregistrement ?",
      "cancel": "Annuler",
      "stop": "Arrêter",
      "accessibility": {
        "flipCamera": "Inverser la caméra",
        "toggleTorch": "Activer/Désactiver la lampe",
        "toggleMic": "Activer/Désactiver le micro",
        "countdown": "Compte à rebours"
      }
    }
  },
  ar: {
    "loading": "جارٍ التحميل...",
    "getStarted": "ابدأ",
    "signIn": "تسجيل الدخول",
    "dontHaveAccount": "ليس لديك حساب؟",
    "startToday": "ابدأ اليوم",
    "alreadyHaveAccount": "لديك حساب بالفعل؟",
    "next": "متابعة",
    "back": "رجوع",
    "tabs": {
      "home": "الرئيسية",
      "progress": "التقدم",
      "settings": "الإعدادات"
    },
    "settings": {
      "personalDetails": "البيانات الشخصية",
      "language": "اللغة",
      "selectLanguage": "اختر اللغة",
      "units": "تغيير الوحدات",
      "appTheme": "سمة التطبيق",
      "whyLowQualityVideos": "لماذا جودة الفيديو منخفضة؟",
      "referFriends": "دعوة الأصدقاء",
      "growStrongerTogether": "لنصبح أقوى معًا!",
      "currentBalance": "الرصيد الحالي",
      "shareNow": "شارك الآن",
      "sharePageTitle": "شارك FormAI",
      "termsAndConditions": "شروط الاستخدام",
      "privacyPolicy": "سياسة الخصوصية",
      "supportEmail": "البريد الداعم",
      "replayTutorial": "إعادة تشغيل الدليل",
      "leaveRating": "اترك تقييماً",
      "deleteAccount": "حذف الحساب",
      "logout": "تسجيل الخروج",
      "save": "حفظ",
      "deleteAccountTitle": "حذف الحساب؟",
      "deleteAccountMessage": "هل أنت متأكد أنك تريد حذف حسابك نهائيًا؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات.",
      "deleteAccountSubscriptionWarning": "حذف حساب Form AI من خلال التطبيق لا يلغي اشتراكك. يرجى تذكر إلغاء الاشتراك من إعدادات اشتراكات جهازك حتى لا تُحاسب مرة أخرى.",
      "iAcknowledge": "أقر بذلك",
      "deleteAccountButton": "احذف الحساب",
      "logoutTitle": "تسجيل الخروج؟",
      "logoutMessage": "هل أنت متأكد أنك تريد تسجيل الخروج؟ ستحتاج لتسجيل الدخول مجددًا للوصول إلى حسابك.",
      "no": "لا",
      "yes": "نعم",
      "editFailed": {
        "gender": "فشل تعديل الجنس",
        "height": "فشل تعديل الطول",
        "dateOfBirth": "فشل تعديل تاريخ الميلاد",
        "currentWeight": "فشل تعديل الوزن",
        "unitSystem": "فشل تحديث نظام الوحدات",
        "language": "فشل تحديث اللغة",
        "message": "يرجى المحاولة لاحقًا"
      }
    },
    "share": {
      "referYourFriends": "ادعُ أصدقاءك",
      "empowerYourFriends": "مكّن أصدقاءك",
      "yourPersonalPromoCode": "رمزك الترويجي الشخصي",
      "share": "مشاركة",
      "howItWorks": "كيف تعمل",
      "step1": "شارك الرمز مع الأصدقاء",
      "step2": "اربح 5$ عن كل صديق يشترك في الخطة السنوية باستخدام رمزك",
      "copied": "تم النسخ!",
      "promoCodeCopied": "تم نسخ الرمز الترويجي إلى الحافظة",
      "error": "خطأ",
      "failedToCopy": "فشل نسخ الرمز الترويجي",
      "failedToShare": "فشل فتح نافذة المشاركة",
      "shareMessage": "مرحبًا! حمّل هذا التطبيق واستخدم هذا الرمز:",
      "shareTitle": "حمّل FormAI!"
    },
    "personalDetails": {
      "currentWeight": "الوزن الحالي",
      "weight": "الوزن",
      "height": "الطول",
      "dateOfBirth": "تاريخ الميلاد",
      "gender": "الجنس",
      "videoQuality": "جودة الفيديو",
      "editCurrentWeight": "تعديل الوزن الحالي",
      "editHeight": "تعديل الطول",
      "editDateOfBirth": "تعديل تاريخ الميلاد",
      "editGender": "تعديل الجنس",
      "male": "ذكر",
      "female": "أنثى"
    },
    "add": {
      "uploadVideo": "رفع فيديو",
      "recordVideo": "تسجيل فيديو",
      "uploadVideoDescription": "اختر فيديو من معرضك لتحليل أدائك.",
      "recordVideoDescription": "سجل فيديو جديد لتحليل أدائك في التمرين.",
      "whatExercise": "ما التمرين الذي قمت به؟",
      "back": "رجوع",
      "noVideoAvailable": "لا يوجد فيديو",
      "selectNewVideo": "فيديو جديد",
      "continue": "متابعة",
      "generalTips": "نصائح عامة",
      "searchMovements": "ابحث عن الحركات...",
      "useCustomMovement": "استخدام",
      "bestRecordingPractices": "أفضل ممارسات التصوير",
      "bodyParts": {
        "all": "الكل",
        "chest": "الصدر",
        "back": "الظهر",
        "shoulders": "الكتفان",
        "arms": "الذراعان",
        "legs": "الساقان"
      },
      "movements": {
        "Flat Barbell Bench Press": "بنش برس مستقيم بالبار",
        "Incline Barbell Bench Press": "بنش برس مائل لأعلى بالبار",
        "Decline Barbell Bench Press": "بنش برس مائل لأسفل بالبار",
        "Flat Dumbbell Chest Press": "ضغط صدر مستقيم بالدَمبل",
        "Incline Dumbbell Chest Press": "ضغط صدر مائل لأعلى بالدَمبل",
        "Decline Dumbbell Chest Press": "ضغط صدر مائل لأسفل بالدَمبل",
        "Dumbbell Chest Fly (Incline)": "تفتيح صدر بالدَمبل (مائل لأعلى)",
        "Dumbbell Chest Fly (Flat)": "تفتيح صدر بالدَمبل (مستقيم)",
        "Dumbbell Chest Fly (Decline)": "تفتيح صدر بالدَمبل (مائل لأسفل)",
        "Deadlift": "ديدلفت",
        "Barbell Row": "سحب بار منحني",
        "Pendlay Row": "سحب بندلاي",
        "T-Bar Row": "سحب تي-بار",
        "Dumbbell Row": "سحب دَمبل",
        "Single Arm Dumbbell Row": "سحب دَمبل بذراع واحدة",
        "Overhead Barbell Press": "ضغط كتف فوق الرأس بالبار",
        "Seated Dumbbell Shoulder Press": "ضغط كتف جالس بالدَمبل",
        "Arnold Press": "ضغط أرنولد",
        "Lateral Raise (Dumbbell)": "رفع جانبي (دَمبل)",
        "Front Raise (Dumbbell)": "رفع أمامي (دَمبل)",
        "Upright Row": "سحب علوي ضيق",
        "Barbell Curl": "تفليكس بار",
        "EZ-Bar Curl": "تفليكس إي-زد بار",
        "Dumbbell Curl": "تفليكس دَمبل",
        "Hammer Curl": "تفليكس مطرقة",
        "Incline Dumbbell Curl": "تفليكس دَمبل على بنش مائل",
        "Cable Curl": "تفليكس حبل/كابل",
        "Preacher Curl": "تفليكس بريتشر",
        "Skullcrusher (Barbell or EZ-Bar)": "سكول كراشر (بار أو إي-زد)",
        "Dumbbell Overhead Triceps Extension": "تمديد ترايسبس فوق الرأس بالدَمبل",
        "Barbell Back Squat": "سكوات خلفي بالبار",
        "Barbell Front Squat": "سكوات أمامي بالبار",
        "Goblet Squat": "جوبلت سكوات",
        "Dumbbell Back Squat": "سكوات خلفي بالدَمبل",
        "Romanian Deadlift (Barbell or Dumbbell)": "ديدلفت روماني (بار أو دَمبل)",
        "Stiff-Leg Deadlift": "ديدلفت بساقين مستقيمتين",
        "Good Morning": "جود مورنينغ",
        "Push Ups": "ضغط"
      },
      "recordingTips": [
        "تأكد من إضاءة جيدة وثبات الكاميرا",
        "حاول تصوير نفسك من الجانب"
      ],
      "countdown": {
        "title": "العد التنازلي",
        "off": "إيقاف",
        "fiveSeconds": "5 ث",
        "tenSeconds": "10 ث"
      }
    },
    "welcome": {
      "title": "FormAI",
      "subtitle": "أداء مثالي دائمًا",
      "modal": {
        "title": "مرحبًا",
        "message": "شكرًا لثقتك بـ Form AI. متحمسون لمساعدتك على تحقيق أهدافك.",
        "ctaButton": "دعنا نريك جولة"
      }
    },
    "onboarding": {
      "language": {
        "title": "اللغة",
        "subtitle": "يمكنك تغييرها لاحقًا",
        "selectLanguage": "اختر لغة"
      },
      "units": {
        "title": "الوحدات",
        "subtitle": "يمكنك تغييرها لاحقًا",
        "metric": "متري",
        "imperial": "إنجليزي",
        "metricDescription": "كيلوغرام وسنتيمتر",
        "imperialDescription": "رطل، قدم، بوصة"
      },
      "gender": {
        "title": "الجنس البيولوجي",
        "subtitle": "سنستخدمه لمساعدة أنظمتنا على إيجاد الشكل الحيوي الأمثل لك",
        "male": "ذكر",
        "female": "أنثى",
        "other": "آخر"
      },
      "goal": {
        "title": "ما هدفك؟",
        "subtitle": "يساعدنا هذا في توليد خطة للسعرات.",
        "loseWeight": "خسارة الوزن",
        "maintain": "المحافظة",
        "gainWeight": "زيادة الوزن"
      },
      "workouts": {
        "title": "كم تمرينًا تقوم به أسبوعيًا؟",
        "subtitle": "تكرار تدريبك يشكل تقدمك.",
        "zeroToTwo": "0–2",
        "zeroToTwoDescription": "تمارين متفرقة",
        "threeToFive": "3–5",
        "threeToFiveDescription": "عدة مرات أسبوعيًا",
        "SixPlus": "6+",
        "SixPlusDescription": "رياضي منضبط"
      },
      "discovery": {
        "title": "كيف سمعت عنا؟",
        "subtitle": "ساعدنا على فهم كيفية عثورك على FormAI",
        "instagram": "إنستغرام",
        "tiktok": "تيك توك",
        "facebook": "فيسبوك",
        "google": "جوجل",
        "appStore": "متجر التطبيقات",
        "playStore": "متجر جوجل بلاي",
        "twitter": "إكس (تويتر)",
        "youtube": "يوتيوب",
        "friends": "الأصدقاء والعائلة",
        "other": "أخرى"
      },
      "personalTrainer": {
        "title": "هل لديك مدرب شخصي؟",
        "subtitle": "يساعدنا هذا في تخصيص تجربتك",
        "yes": "نعم",
        "no": "لا"
      },
      "trainingReason": {
        "title": "ما السبب الأول لتدريبك؟",
        "subtitle": "سنخصص تحليل الأداء لهدفك.",
        "buildStrength": "بناء القوة",
        "improvePhysique": "تحسين القوام",
        "preventInjury": "الوقاية من الإصابة",
        "trainForSport": "التدريب لرياضة",
        "stayActiveHealthy": "البقاء نشيطًا وبصحة"
      },
      "gymChallenge": {
        "title": "ما أكبر تحدٍ تواجهه في الجيم؟",
        "subtitle": "لنركّز على ما يهمك أكثر.",
        "unsureForm": "غير متأكد من صحة أدائي",
        "noResults": "لا أرى نتائج",
        "worriedInjury": "أخشى الإصابة",
        "strugglingMotivation": "أعاني من التحفيز",
        "other": "أخرى"
      },
      "lifterType": {
        "title": "كيف ترى نفسك كرافِع؟",
        "subtitle": "مستوى خبرتك يشكل إرشاداتنا.",
        "beginner": "مبتدئ، يتعلم الأساسيات",
        "intermediate": "متوسط، يصقل التقنية",
        "advanced": "متقدم، يسعى للأداء النخبوي",
        "returningAfterBreak": "عائد بعد انقطاع",
        "injuryRehab": "تأهيل إصابة"
      },
      "perfectFormGoal": {
        "title": "إذا كان أداؤك دائمًا مثاليًا، ماذا ستحقق أسرع؟",
        "subtitle": "تخيل تقدمك دون عوائق.",
        "liftHeavierSafely": "رفع أوزان أثقل بأمان",
        "buildMuscleEfficiently": "بناء العضلات بكفاءة",
        "avoidInjuries": "تجنب الإصابات",
        "boostConfidence": "تعزيز الثقة",
        "trainLongerWithoutSetbacks": "التدريب أطول دون انتكاسات"
      },
      "formConfidence": {
        "title": "ما مدى ثقتك بأدائك الآن؟",
        "subtitle": "كن صادقًا، سنوصلك لـ 100٪.",
        "zeroToTwentyFive": "0% - 25%",
        "twentyFiveToFifty": "25% - 50%",
        "fiftyToSeventyFive": "50% - 75%",
        "seventyFiveToHundred": "75% - 100%"
      },
      "threeMonthGoal": {
        "title": "بعد 3 أشهر، أين تريد أن تكون؟",
        "subtitle": "رحلتك تبدأ بفحص الأداء اليوم.",
        "liftingHeavier": "رفع أوزان أثقل",
        "lookingLeaner": "مظهر أنحف",
        "feelingStrongerInjuryFree": "أقوى وبدون إصابات",
        "moreConsistent": "أكثر التزامًا",
        "moreConfident": "أكثر ثقة"
      },
      "measurements": {
        "title": "الطول والوزن",
        "subtitle": "يساعدنا هذا على تقديم توصيات مخصصة",
        "height": "الطول",
        "weight": "الوزن",
        "metric": "متري",
        "imperial": "إنجليزي",
        "cm": "سم",
        "ft": "قدم",
        "in": "بوصة",
        "kg": "كغ",
        "lbs": "رطل"
      },
      "birthDate": {
        "title": "متى وُلدت؟",
        "subtitle": "يساعدنا هذا على تقديم توصيات مناسبة للعمر",
        "month": "الشهر",
        "day": "اليوم",
        "year": "السنة"
      },
      "rating": {
        "title": "امنحنا تقييمًا",
        "subtitle": "ساعدنا على التحسن بمشاركة تجربتك",
        "skip": "تخطي",
        "middleText": "تم إنشاء FormAI لعشّاق الجيم مثلك!"
      },
      "referralCode": {
        "title": "أدخل رمز الإحالة (اختياري)",
        "subtitle": "يمكنك تخطي هذه الخطوة.",
        "placeholder": "رمز الإحالة",
        "skip": "تخطي",
        "submit": "إرسال",
        "success": "تم تطبيق رمز الإحالة بنجاح",
        "error": "رمز الإحالة غير صالح. حاول مرة أخرى."
      },
      "allDone": {
        "title": "تم كل شيء!",
        "allDone": "تم كل شيء!",
        "thankYou": "شكرًا لثقتك بنا",
        "privacy": "نعدك بالحفاظ على خصوصية معلوماتك وأمانها دائمًا."
      },
      "trainSafer": {
        "title": "درّب مع احتمال إصابة أقل بثلاث مرات مع Form AI مقارنة بالتدريب بمفردك",
        "withoutFormAI": "بدون Form AI",
        "withFormAI": "مع Form AI",
        "description": "يجعل FormAI تحسين الأداء سهلًا ويبقيك ملتزمًا."
      },
      "notificationPermission": {
        "title": "بلّغ أهدافك مع الإشعارات",
        "dialogText": "يريد FormAI إرسال إشعارات.",
        "allow": "سماح",
        "dontAllow": "عدم السماح"
      },
      "setupLoading": {
        "title": "",
        "mainTitle": "نُعد كل شيء لك",
        "step1": "جارٍ إعداد ملفك...",
        "step2": "اقتربنا من الانتهاء..."
      },
      "freeTrial": {
        "title": "نريدك أن تجرب FormAI مجانًا.",
        "noPaymentDue": "لا يوجد دفع الآن",
        "tryForFree": "جرّب بـ 0.00$",
        "pricing": "فقط 39.99$ سنويًا (3.33$/شهريًا)"
      },
      "notificationReminder": {
        "title": "سنُرسل لك\nتذكيرًا قبل\nانتهاء الفترة التجريبية",
        "noPaymentDue": "لا يوجد دفع الآن",
        "continueForFree": "تابع مجانًا",
        "pricing": "فقط 39.99$ سنويًا (3.33$/شهريًا)"
      },
      "subscriptionSelection": {
        "title": "ابدأ تجربتك المجانية لمدة 3 أيام للمتابعة.",
        "titleMonthly": "افتح FormAI لتصل لأهدافك أسرع",
        "today": "اليوم",
        "todayDescription": "افتح جميع ميزات التطبيق مثل تحليل الأداء بالذكاء الاصطناعي والمزيد.",
        "reminder": "بعد يومين - تذكير",
        "reminderDescription": "سنرسل لك تذكيرًا بقرب انتهاء الفترة التجريبية.",
        "billing": "بعد 3 أيام - يبدأ الفوترة",
        "billingDescription": "سيتم الخصم في {{billingDate}} ما لم تُلغِ قبل ذلك.",
        "monthly": "شهري",
        "monthlyPrice": "9.99$ /شهر",
        "yearly": "سنوي",
        "yearlyPrice": "3.33$ /شهر",
        "freeTag": "3 أيام مجانًا",
        "noPaymentDue": "لا يوجد دفع الآن",
        "cancelAnytime": "إلغاء في أي وقت - بدون التزام",
        "startTrial": "ابدأ تجربتي المجانية 3 أيام",
        "startToday": "ابدأ اليوم",
        "yearlyPricing": "3 أيام مجانًا، ثم 39.99$ سنويًا (3.33$/شهر)",
        "monthlyPricing": "فقط 9.99$/شهر (120$/سنة)",
        "monthlyFeature1": "تحليل أداء بسيط",
        "monthlyFeature1Description": "حلّل أداءك لأي حركة بواسطة فيديو فقط",
        "monthlyFeature2": "حقق أهدافك في الجيم",
        "monthlyFeature2Description": "لم يكن الوصول للياقة أسهل من قبل",
        "monthlyFeature3": "تتبّع تقدمك",
        "monthlyFeature3Description": "ابقَ على المسار الصحيح بالتحليلات والتذكيرات"
      },
      "createAccount": {
        "title": "إنشاء حساب",
        "signInWithApple": "تسجيل الدخول عبر Apple",
        "signInWithGoogle": "تسجيل الدخول عبر Google"
      },
      "cameraPermission": {
        "title": "السماح بالوصول للكاميرا",
        "subtitle": "الوصول للكاميرا مطلوب لـ FormAI.",
        "dialogText": "يريد FormAI الوصول إلى الكاميرا.",
        "allow": "سماح",
        "dontAllow": "عدم السماح"
      },
      "perfectFormGoalMessage": {
        "highlighted": {
          "liftHeavierSafely": "رفع أثقل بأمان",
          "buildMuscleEfficiently": "بناء العضلات",
          "avoidInjuries": "تجنب الإصابات",
          "boostConfidence": "ثقتك ستحلّق",
          "trainLongerWithoutSetbacks": "التدريب بلا انتكاسات",
          "default": "أهدافك"
        },
        "rest": " هدف مضمون. ليس صعبًا إطلاقًا!",
        "restRealistic": " هدف واقعي. ليس صعبًا إطلاقًا!",
        "restFantastic": " هدف رائع. ليس صعبًا إطلاقًا!",
        "restAfter": " بعد ذلك. ليس صعبًا إطلاقًا!",
        "restNormal": " سيكون أمرًا عاديًا. ليس صعبًا إطلاقًا!",
        "restAchievable": " قابلة للتحقق مع Form AI. ليس صعبًا إطلاقًا!",
        "subtitle": "95% من المستخدمين يقولون إن التغيير واضح بعد استخدام Form AI."
      },
      "potentialGraph": {
        "title": "لديك إمكانات مذهلة لسحق هدفك",
        "chartTitle": "تحوّل دقة أدائك",
        "subtitle": "استنادًا إلى بيانات Form AI التاريخية، يتحسن الأداء ببطء أولًا، لكن بعد 14 يومًا ستصبح شديد الثبات!"
      },
      "costComparison": {
        "title": "أداء مثالي بجزء بسيط من تكلفة المدربين",
        "personalTrainer": "مدرب شخصي",
        "withFormAI": "مع Form AI",
        "costLess": "أقل 99%",
        "description": "لا ينبغي أن يكلفك الأداء الآمن والمثالي ثروة."
      },
      "gymChallengeInfo": {
        "noResults": {
          "headline": "النتائج تحتاج وقتًا، لكنك أقرب مما تظن.",
          "message": "سنرشدك بالتغذية الراجعة المناسبة ليؤتي جهدك ثماره.",
          "howWeGetYouThere": [
            "تحليل الأداء لضمان أن كل عدة تُحتسب",
            "ملاحظات بالفيديو لتحديد ما يعيق تقدمك",
            "تتبّع الدقة لقياس التقدم الحقيقي بمرور الوقت"
          ]
        },
        "unsureForm": {
          "headline": "الأداء أولًا.",
          "message": "سنقدم ملاحظات واضحة لتتدرب بأمان وفعالية كل مرة.",
          "howWeGetYouThere": [
            "تفكيك فوري للأداء من مقاطعك",
            "نصائح قابلة للتنفيذ لإصلاح الأخطاء بسرعة",
            "تسجيل درجات الدقة لتتبّع التحسن"
          ]
        },
        "worriedInjury": {
          "headline": "تدرّب بأمان. تدرّب بقوة.",
          "message": "سنساعدك على الرفع بثقة عبر رصد الحركات الخطرة قبل أن تصبح إصابة.",
          "howWeGetYouThere": [
            "ملاحظات بالفيديو لتسليط الضوء على الوضعيات غير الآمنة",
            "توصيات تقنية أكثر أمانًا مخصصة لك",
            "تتبّع الدقة لضمان الثبات طويل الأمد"
          ]
        },
        "strugglingMotivation": {
          "headline": "التحفيز أسهل عندما لا تكون وحدك.",
          "message": "نبقيك منخرطًا عبر إظهار تقدمك والاحتفال بكل تحسن.",
          "howWeGetYouThere": [
            "درجات دقة سهلة القراءة بعد كل تمرين",
            "تحسينات مرئية مع اتجاهات التقدم",
            "نصائح مشجعة تساعدك على الاستمرارية"
          ]
        },
        "other": {
          "headline": "نحن هنا من أجل رحلتك.",
          "message": "أيًا كان تحديك، سنقدم الإرشاد والدعم لتتغلب عليه.",
          "howWeGetYouThere": [
            "ملاحظات مخصصة على فيديوهات حركتك",
            "تتبّع الدقة عبر أنواع التمارين",
            "نصائح ورؤى مستمرة لدعم أهدافك"
          ]
        },
        "howWeGetYouThereTitle": "هكذا سنوصلك لهدفك"
      },
      "saveProgress": {
        "title": "إنشاء حساب"
      }
    },
    "months": {
      "january": "يناير",
      "february": "فبراير",
      "march": "مارس",
      "april": "أبريل",
      "may": "مايو",
      "june": "يونيو",
      "july": "يوليو",
      "august": "أغسطس",
      "september": "سبتمبر",
      "october": "أكتوبر",
      "november": "نوفمبر",
      "december": "ديسمبر",
      "array": ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    },
    "progress": {
      "title": "رحلتك تبدأ هنا",
      "subtitle": "شاهد كيف يحسن المستخدمون أداءهم مع FormAI",
      "chartTitle": "تحسن درجة الأداء بمرور الوقت",
      "week": "الأسبوع",
      "score": "درجة الأداء",
      "formImprovement": "تحسن الأداء",
      "weeksToExcellence": "أسابيع لإتقان الأداء"
    },
    "liftingGoal": {
      "title": "ما هو هدفك؟",
      "subtitle": "سنضبط الذكاء الاصطناعي لفهم أسلوبك في الرفع.",
      "muscleBuilding": "بناء العضلات",
      "powerlifting": "رفع أثقال قوى",
      "toning": "تنسيق الجسم",
      "strength": "القوة",
      "weightLoss": "إنقاص الوزن"
    },
    "formBarrier": {
      "title": "ما الذي يمنعك من إتقان أدائك؟",
      "subtitle": "ساعدنا على فهم تحدياتك",
      "expensiveTrainers": "المدربون الشخصيون باهظون",
      "gymAdviceScary": "أخشى طلب النصيحة",
      "noTime": "لا وقت لدي لإتقان الأداء",
      "other": "أخرى"
    },
    "home": {
      "addTestLift": "أضف رفعًا تجريبيًا",
      "dailyAccuracyLevel": "مستوى الدقة اليومي",
      "noLiftsToday": "لا رفعات اليوم",
      "allTimeAccuracy": "الدقة طوال الوقت",
      "earnByReferring": "اكسب بدعوة الأصدقاء!",
      "yourVideoLibrary": "مكتبة الفيديو الخاصة بك",
      "lifts": "الرفعات الأخيرة",
      "seeAll": "عرض الكل",
      "noRecordedLifts": "لا توجد رفعات مسجلة لهذا التاريخ",
      "startAnalyzingWorkout": "ابدأ تحليل تمرينك بتصوير سريع",
      "dayStreak": "سلسلة {{count}} أيام",
      "onFireMessage": "أنت رائع! واصل عملك الممتاز مع سلسلة أيامك.",
      "zeroDayStreak": "سلسلة 0 يوم",
      "noStreakMessage": "لا توجد سلسلة بعد. صوّر في أيام متتالية لبدء السلسلة.",
      "continue": "متابعة"
    },
    "performance": {
      "title": "التقدم",
      "editDateRange": "تعديل النطاق الزمني",
      "from": "من",
      "to": "إلى",
      "reset": "إعادة ضبط",
      "apply": "تطبيق",
      "filterLifts": "تصفية الرفعات",
      "timeRanges": {
        "ninetyDays": "90 يوم",
        "sixMonths": "6 أشهر",
        "oneYear": "سنة واحدة",
        "allTime": "كل الوقت",
      },
      "chartTitles": {
        "accuracyPerWeight": "الدقة حسب الوزن",
        "accuracyOverTime": "الدقة بمرور الوقت",
        "loading": "جارٍ التحميل...",
        "noDataAvailable": "لا توجد بيانات"
      },
      "info": {
        "accuracyPerWeight": {
          "title": "الدقة حسب الوزن",
          "message": "تُظهر متوسط دقة الأداء لكل وزن رفعته لحركة معينة. قد تتحدّى الأوزان العالية الأداء. تُحسب بمتوسط درجات الدقة لجميع الرفعات عند كل وزن."
        },
        "accuracyOverTime": {
          "title": "الدقة بمرور الوقت",
          "message": "تُظهر كيف تتغير دقة الأداء بمرور الوقت لحركة ما. نحسب متوسط الدقة لكل يوم ونرسمها عبر التواريخ."
        },
        "accuracy": {
          "title": "الدقة",
          "message": "متوسط دقة أدائك ضمن النطاق الزمني المحدد. تُحسب كمتوسط درجات الدقة لجميع الرفعات."
        },
        "improvement": {
          "title": "التحسن",
          "message": "كيف تغير أداؤك خلال النطاق المحدد. نقارن الثلث الأول من رفعاتك بالثلث الأخير ونُظهر الفرق في متوسط الدقة."
        }
      },
      "metricsFeedback": {
        "title": "تريد مقاييس أخرى؟ أخبرنا!",
        "subtitle": "ساعدنا على تحسين تجربتك"
      }
    },
    "library": {
      "title": "المكتبة",
      "editDateRange": "تعديل النطاق الزمني",
      "from": "من",
      "to": "إلى",
      "reset": "إعادة ضبط",
      "apply": "تطبيق",
      "all": "الكل",
      "favourites": "المفضلة",
      "noLiftsAnalysed": "لا توجد رفعات محلّلة",
      "noFavouriteLifts": "لا رفعات مفضلة",
      "noLiftsFound": "لا توجد رفعات",
      "startAnalysingWorkout": "ابدأ تحليل تمرين اليوم بتصوير سريع",
      "markLiftsAsFavourites": "علّم الرفعات كمفضلة لتظهر هنا",
      "tryAdjustingFilters": "جرّب تعديل المرشحات",
      "lifts": "رفعات",
      "lift": "رفعة",
      "noLifts": "0",
      "selectDateRange": "اختر نطاقًا زمنيًا",
      "allLifts": "كل الرفعات",
      "oneLift": "1",
      "search": "بحث",
      "liftsCount": "{{count}} رفعات",
      "filterByMovement": "تصفية حسب الحركة",
      "searchMovements": "ابحث عن الحركات...",
      "allMovements": "كل الحركات",
      "searchAnalysis": {
        "analysisFound": "تم العثور على تحليل",
        "analysisFoundNotFavourited": "تم العثور على تحليل لكن لم يُضاف للمفضلة.",
        "continueToLift": "المتابعة إلى الرفعة",
        "noAnalysisFound": "لم يُعثر على تحليل",
        "noAnalysisFoundMessage": "لا يوجد تحليل لهذا الفيديو. يرجى التأكد من أنه تم تحليله مسبقًا.",
        "analyse": "حلّل",
        "permissionRequired": "الإذن مطلوب",
        "permissionMessage": "يرجى السماح بالوصول إلى مكتبة الصور للبحث عن الفيديوهات.",
        "error": "خطأ",
        "errorMessage": "فشل اختيار الفيديو. حاول مرة أخرى."
      }
    },
    "liftCard": {
      "accuracy": "الدقة"
    },
    "loadingLift": {
      "uploadingVideo": "جارٍ رفع الفيديو...",
      "checkingVideo": "جارٍ فحص الفيديو...",
      "estimatingPose": "جارٍ تقدير الوضعية...",
      "analyzingVideo": "جارٍ تحليل الفيديو...",
      "analyzingForm": "جارٍ تحليل الأداء...",
      "analysisFailed": "فشل التحليل",
      "processing": "جارٍ المعالجة...",
      "errorOccurred": "حدث خطأ",
      "pleaseTryAgain": "يرجى المحاولة مجددًا",
      "tapToRetry": "اضغط لإعادة المحاولة",
      "notifyWhenDone": "سنخطرك عند الانتهاء!",
      "noLiftFound": {
        "title": "لم يتم العثور على رفعة",
        "subtitle": "لا يمكننا اكتشاف رفعة"
      },
      "liftMismatch": {
        "title": "عدم تطابق الرفعة",
        "subtitle": "الحركة المحددة لا تطابق الفيديو",
        "detectedMovement": "لا يمكننا اكتشاف أدائك لـ: {{movement}}"
      }
    },
    "feedback": {
      "liftDetails": "تفاصيل الرفعة",
      "rangeOfMotionAcrossReps": "مدى الحركة عبر العدّات",
      "benchPress": "بنش برس",
      "formAccuracyAcrossReps": "دقة الأداء عبر العدّات",
      "weight": "الوزن",
      "reps": "العدّات",
      "reviewFeedback": "مراجعة الملاحظات",
      "favourite": "مفضلة",
      "manualDeleteLiftCardData": "حذف الرفعة",
      "deleteLiftTitle": "حذف الرفعة",
      "deleteLiftMessage": "هل أنت متأكد من حذف هذه الرفعة؟ لا يمكن التراجع.",
      "cancel": "إلغاء",
      "delete": "حذف",
      "howItWorks": "كيف تعمل",
      "viewFeedback": "عرض الملاحظات",
      "step1": "يحدد الذكاء الاصطناعي لحظات محددة أثناء رفعتك يمكن تحسين الأداء فيها.",
      "step2": "ثم يشرح ما لم يكن أمثل.",
      "step3": "ستُعرض نصائح للسلامة والتحسين!",
      "step4": "ثم يعود الأمر لك لتحسين الأداء والمراجعة بعد أسبوع.",
      "accuracy": "الدقة",
      "accuracyScore": "درجة الدقة",
      "improvements": "التحسينات",
      "noVideoAvailable": "لا يوجد فيديو",
      "deleteLiftConfirmation": "هل أنت متأكد من حذف هذه الرفعة؟ لا يمكن التراجع.",
      "lbs": "رطل",
      "kg": "كغ",
      "updateFailed": {
        "weight": "فشل تحديث الوزن",
        "message": "يرجى المحاولة لاحقًا"
      }
    },
    "common": {
      "accuracy": "الدقة",
      "averageAccuracy": "متوسط الدقة",
      "averageFormImprovement": "متوسط تحسّن الأداء",
      "noData": "لا توجد بيانات",
      "selectDateRange": "اختر نطاقًا زمنيًا",
      "allLifts": "كل الرفعات",
      "oneLift": "رفعة واحدة",
      "lifts": "رفعات",
      "noLiftsFound": "لم يتم العثور على رفعات"
    },
    "tutorial": {
      "buttons": {
        "previous": "السابق",
        "next": "متابعة",
        "complete": "إنهاء",
        "skipGuide": "تخطي الدليل",
        "close": "إغلاق"
      },
      "addButton": {
        "title": "أضف رفعة",
        "description": "استخدم زر الإضافة لبدء تحليل رفعة جديدة."
      },
      "addOptionsUpload": {
        "title": "رفع وتسجيل فيديو",
        "description": "هنا يمكنك رفع فيديو أو تسجيل واحد جديد عبر التطبيق وسيُحفظ أيضًا في مكتبة الصور.\n\nلهذه الجولة الإرشادية سنرفع فيديو تجريبي."
      },
      "uploadPracticesCta": {
        "title": "نصائح ورفع",
        "description": "ستجد هنا إرشادات عامة حول جودة الفيديو وكيفية الحصول على أفضل النتائج.\n\nالخطوة التالية ستفتح مكتبة الصور لكن سنتخطى ذلك في العرض التجريبي."
      },
      "videoPreviewContinue": {
        "title": "معاينة الفيديو",
        "description": "إذا بدا الفيديو جيدًا، تابع لاختيار نوع الرفعة."
      },
      "movementSelectionContinue": {
        "title": "اختر نوع الرفعة",
        "description": "يرجى اختيار نوع رفعة دقيق ليساعدنا في تحليل أدائك.\n\nإذا لم تجد الرفعة، راسل دعمنا وسنعمل على إضافتها."
      },
      "weightRepsComplete": {
        "title": "الوزن والعدّات",
        "description": "سنستخدمهما لتتبّع تقدمك ومعرفة تحسنك بمرور الوقت."
      },
      "homeFirstLiftCard": {
        "title": "اضغط هنا لتجد تحليلك",
        "description": "تظهر رفعتك هنا مع التحليل. اضغط لرؤية ملاحظات مفصلة أو اسحب للحذف."
      },
      "liftDetailsFormGraph": {
        "title": "دقة الأداء عبر العدّات",
        "description": "يعرض هذا المخطط كيف تتغير دقة أدائك عبر كل عدة."
      },
      "liftDetailsDepthGraph": {
        "title": "مدى الحركة عبر العدّات",
        "description": "يوضح هذا المخطط الشريطي عمق رفعتك عبر العدّات."
      },
      "liftDetailsReviewFeedback": {
        "title": "راجع ملاحظاتك",
        "description": "اضغط زر \"مراجعة الملاحظات\" لرؤية تحليل مفصل ونصائح لتحسين الأداء."
      },
      "howItWorksModal": {
        "title": "كيف تعمل",
        "description": "يوضح هذا كيف يعمل تحليل الذكاء الاصطناعي وكيف يساعدك على تحسين أدائك."
      },
      "feedbackSlideshow": {
        "title": "ملاحظاتك",
        "description": "تُظهر أنظمتنا نقاطًا محددة أثناء رفعتك تحتاج لتحسين وستظهر القضايا والنصائح لتلك اللحظة بالضبط.\n\nاضغط السهم الأيمن لرؤية النقطة التالية."
      },
      "feedbackIssues": {
        "title": "مشكلات需 المعالجة",
        "description": "راجع المشكلات المحددة في أدائك التي تحتاج انتباهًا.\n\nاسحب التراكب لرؤية لقطة الفيديو."
      },
      "feedbackTips": {
        "title": "نصائح للتحسين",
        "description": "هنا نصائح محددة لمساعدتك على تحسين أدائك وتقنيتك.\n\nتذكر أنه يمكنك فتح/إغلاق لوحة الملاحظات لرؤية لقطة المشكلة."
      },
      "homeSeeAllLifts": {
        "title": "عرض جميع رفعاتك",
        "description": "اضغط هنا لرؤية كل رفعاتك في المكتبة حيث يمكنك التصفية والفرز والمراجعة."
      },
      "libraryScreen": {
        "title": "شاشة المكتبة",
        "description": "هذه مكتبتك حيث يمكنك رؤية كل الرفعات. استخدم التبويبات للتبديل بين الكل والمفضلة. صفّ، رشّح وابحث أيضًا!\n\nاضغط على رفعة للتفاصيل واسحب للحذف."
      },
      "homePerformanceIcon": {
        "title": "أداؤك",
        "description": "اضغط تبويب \"التقدم\" لعرض تقدمك وإحصاءاتك بمرور الوقت."
      },
      "performanceMetrics": {
        "title": "الدقة والتحسن",
        "description": "اعرض مقاييس الدقة والتحسن لتتبّع تقدمك بمرور الوقت."
      },
      "performanceChartsOverWeight": {
        "title": "الدقة حسب الوزن",
        "description": "يعرض هذا المخطط دقتك حسب الوزن لمساعدتك على فهم تقدمك والوزن الذي تؤدي عنده بأفضل شكل."
      },
      "performanceChartsOverTime": {
        "title": "الدقة بمرور الوقت",
        "description": "يعرض هذا المخطط دقتك بمرور الوقت لمساعدتك على فهم تقدمك. نتوقع معدل تحسّن إيجابي خلال 14 يومًا!"
      },
      "settingsFirstCard": {
        "title": "البيانات الشخصية",
        "description": "إذا تغير شيء، عدّل بياناتك الشخصية واللغة والوحدات المفضلة."
      },
      "settingsSupportEmail": {
        "title": "الحصول على الدعم",
        "description": "هل تحتاج مساعدة؟ اضغط هنا في أي وقت لمراسلة فريق الدعم عبر البريد."
      },
      "completionModal": {
        "title": "تم كل شيء",
        "message": "أنت جاهز لاستخدام FormAI. تحقق يوميًا لتحافظ على سلسلة أيامك وتظل ملتزمًا.\n\nتذكر أنه يمكنك دائمًا إعادة تشغيل هذا الدليل من قائمة الإعدادات."
      }
    },
    "upload": {
      "permissionRequired": "الإذن مطلوب",
      "permissionMessage": "يرجى منح الإذن للوصول إلى مكتبة الصور.",
      "mediaPermissionTitle": "السماح بالوصول لمكتبة الوسائط",
      "mediaPermissionDialogText": "يريد FormAI الوصول إلى مكتبة الوسائط.",
      "allow": "سماح",
      "dontAllow": "عدم السماح",
      "videoTooLong": "الفيديو طويل جدًا",
      "videoTooLongMessage": "يرجى اختيار فيديو أقل من 90 ثانية.",
      "videoTooShort": "الفيديو قصير جدًا",
      "videoTooShortMessage": "يرجى اختيار فيديو لا يقل عن 3 ثوانٍ.",
      "error": "خطأ",
      "failedToSelectVideo": "فشل اختيار الفيديو. حاول مرة أخرى.",
      "failedToGenerateThumbnail": "فشل إنشاء صورة مصغرة للفيديو. حاول مرة أخرى.",
      "uploadVideo": "رفع فيديو",
      "selectNewVideo": "فيديو جديد",
      "duplicateVideo": "فيديو مكرر",
      "duplicateVideoMessage": "تم تحليل هذا الفيديو مسبقًا. يرجى اختيار فيديو مختلف.",
      "selectDifferentVideo": "اختر فيديو مختلف",
      "viewAnalysis": "عرض التحليل",
      "tips": {
        "goodLighting": "تأكد من إضاءة جيدة",
        "stableVideo": "تأكد من ثبات الفيديو",
        "sideView": "التقط الفيديو من الجانب"
      },
      "ok": "حسنًا",
      "recordingFailed": "فشل التسجيل. حاول مرة أخرى.",
      "failedToStartRecording": "فشل بدء التسجيل. حاول مرة أخرى.",
      "failedToFinishRecording": "فشل إنهاء التسجيل. حاول مرة أخرى.",
      "stopRecording": "إيقاف التسجيل؟",
      "stopRecordingMessage": "هل أنت متأكد من رغبتك في إيقاف التسجيل؟",
      "cancel": "إلغاء",
      "stop": "إيقاف",
      "accessibility": {
        "flipCamera": "تبديل الكاميرا",
        "toggleTorch": "تشغيل/إطفاء المصباح",
        "toggleMic": "تشغيل/إيقاف الميكروفون",
        "countdown": "عد تنازلي"
      }
    }
  }
});

// Initialize i18n with fallback
i18n.enableFallback = true;

// Function to initialize language from AsyncStorage or device settings
async function initializeLanguage() {
  try {
    // First try to get saved language from AsyncStorage
    const savedLanguage = await getSelectedLanguage();
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
      return;
    }
    
    // Fallback to device language
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    i18n.locale = deviceLanguage;
  } catch (error) {
    console.warn('Error initializing language:', error);
    // Final fallback to English
    i18n.locale = 'en';
  }
}

// Initialize language on startup
initializeLanguage();

// Function to update language (can be called from components)
export function setLanguage(language: string) {
  i18n.locale = language;
}

export default i18n; 