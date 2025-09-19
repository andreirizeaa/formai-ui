import * as MailComposer from 'expo-mail-composer';
import { Platform, Alert } from 'react-native';
import { showAlert } from './alertService';
import { getUserId } from './storageService';

export interface EmailOptions {
  recipients: string[];
  subject: string;
  body: string;
}

const supportEmail = 'support@useformai.com';

export async function openEmailComposer(options: EmailOptions): Promise<void> {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      showAlert('Email Not Available', 'No email app is available on this device.');
      return;
    }

    await MailComposer.composeAsync(options);
  } catch (error) {
    Alert.alert('Error', 'Failed to open email composer. Please try again.');
    showAlert('Error', 'Failed to open email composer. Please try again.');
  }
}

export async function openSupportEmail(): Promise<void> {
  const userId = await getUserId();
  
  const options: EmailOptions = {
    recipients: [supportEmail],
    subject: 'FormAI Support Request',
    body: `Hello FormAI Support Team,



        

              Meta data (Please do not remove this as it will help us identify your account)

              - Platform: ${Platform.OS}
              - Device Version: ${Platform.Version}
              - User ID: ${userId}
          `,
  };

  await openEmailComposer(options);
}

export async function openMetricsFeedbackEmail(): Promise<void> {
  const userId = await getUserId();

  const options: EmailOptions = {
    recipients: [supportEmail],
    subject: 'Performance Metrics Feedback',
    body: `Hello FormAI Support Team,

I'd like to suggest the following metrics for the Performance screen:




              Meta data (Please do not remove this as it will help us identify your account)

              - Platform: ${Platform.OS}
              - Device Version: ${Platform.Version}
              - User ID: ${userId}
          `,
  };

  await openEmailComposer(options);
}

export async function openCancellationEmail(): Promise<void> {
  const userId = await getUserId();

  const options: EmailOptions = {
    recipients: [supportEmail],
    subject: 'FormAI Subscription Cancellation Feedback',
    body: `Hello FormAI Support Team,

I recently cancelled my subscription and wanted to provide feedback:




              Meta data (Please do not remove this as it will help us identify your account)

              - Platform: ${Platform.OS}
              - Device Version: ${Platform.Version}
              - User ID: ${userId}
          `,
  };

  await openEmailComposer(options);
}
