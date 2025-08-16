import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'user_id';

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