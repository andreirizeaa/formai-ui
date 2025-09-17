import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'user_id';
const SELECTED_DATE_KEY = 'selectedDate';
const LOADING_LIFTS_KEY = 'loadingLifts';
const PENDING_LIFT_COMPLETIONS_KEY = 'pendingLiftCompletions';
const PENDING_LIFT_FAILURES_KEY = 'pendingLiftFailures';
const INFLIGHT_ASSET_IDS_KEY = 'inflightAssetIds';

export async function setUserId(userId: string): Promise<void> {
	const value = await AsyncStorage.getItem(USER_ID_KEY);
	if (value) {
		await AsyncStorage.removeItem(USER_ID_KEY);
	}
	await AsyncStorage.setItem(USER_ID_KEY, userId);
}

export async function getUserId(): Promise<string | null> {
	const value = await AsyncStorage.getItem(USER_ID_KEY);
	return value;
}

export async function removeUserId(): Promise<void> {
	await AsyncStorage.removeItem(USER_ID_KEY);
}

/**
 * Clears all user data from AsyncStorage and memory when account is deleted
 */
export async function clearAllUserData(): Promise<void> {
	try {
		// Clear all AsyncStorage keys related to user data
		const keysToRemove = [
			USER_ID_KEY,
			SELECTED_DATE_KEY,
			LOADING_LIFTS_KEY,
			PENDING_LIFT_COMPLETIONS_KEY,
			PENDING_LIFT_FAILURES_KEY,
			INFLIGHT_ASSET_IDS_KEY,
		];

		await Promise.all(
			keysToRemove.map(key => AsyncStorage.removeItem(key))
		);

		('All user data cleared from AsyncStorage');
	} catch (error) {
		Alert.alert('Error', 'An error occurred while clearing your data. Please try again.');
		throw error;
	}
} 