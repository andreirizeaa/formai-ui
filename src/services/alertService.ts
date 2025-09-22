import { Alert } from 'react-native';
import { track } from './analytics';
import { hapticFeedback } from '../utils/haptic';

export function showAlert(
  title: string, 
  message?: string,
  onPress?: () => void,
  errorId?: string,
  errorDetails?: any
): void {
  // Track error if errorId is provided
  if (errorId) {
    track('Errors', {
      error_id: errorId,
      details: errorDetails ? JSON.stringify(errorDetails) : undefined
    });
  }
  hapticFeedback.error();
  Alert.alert(title, message, [{ text: 'OK', onPress }]);
}

