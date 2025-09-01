import { Alert } from 'react-native';

export function showEditFailedAlert(
  title: string, 
  message?: string,
  onPress?: () => void
): void {
  Alert.alert(title, message, [{ text: 'OK', onPress }]);
}

export function showAlert(
  title: string, 
  message?: string,
  onPress?: () => void
): void {
  Alert.alert(title, message, [{ text: 'OK', onPress }]);
}

export default showEditFailedAlert;
