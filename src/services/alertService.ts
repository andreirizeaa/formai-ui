import { Alert } from 'react-native';
import { track } from './analytics';

export function showAlert(
  title: string, 
  message?: string,
  onPress?: () => void,
  errorType?: string
): void {
  // Track error if errorType is provided
  if (errorType) {
    track('Errors', { type: errorType });
  }
  Alert.alert(title, message, [{ text: 'OK', onPress }]);
}

