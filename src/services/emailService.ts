import * as MailComposer from 'expo-mail-composer';
import { Platform } from 'react-native';
import { showAlert } from './alertService';
import { getUserId } from './storageService';

export interface EmailOptions {
  recipients: string[];
  subject: string;
  body: string;
}

export async function openEmailComposer(options: EmailOptions): Promise<void> {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      showAlert('Email Not Available', 'No email app is available on this device.');
      return;
    }

    await MailComposer.composeAsync(options);
  } catch (error) {
    console.error('Error opening email composer:', error);
    showAlert('Error', 'Failed to open email composer. Please try again.');
  }
}

export async function openSupportEmail(): Promise<void> {
  const userId = await getUserId();
  
  const options: EmailOptions = {
    recipients: ['support@formai.com'],
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
    recipients: ['support@formai.com'],
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
