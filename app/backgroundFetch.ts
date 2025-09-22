import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../src/lib/supabase'

const BACKGROUND_FETCH_TASK = 'LIFT_BACKGROUND_FETCH'
const PENDING_KEY = 'pendingLiftCompletions'
const INFLIGHT_KEY = 'inflightAssetIds'

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const inflight: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]')
    if (!Array.isArray(inflight) || inflight.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData
    }

    let hasNewData = false
    for (const assetId of inflight) {
      const { data: lift } = await supabase
        .from('lifts')
        .select('id,asset_id,analysis,thumbnail_url,lift_type,lift_date,lift_time,metric_weight,reps,user_id')
        .eq('asset_id', assetId)
        .maybeSingle()

      if (lift) {
        const pending = JSON.parse((await AsyncStorage.getItem(PENDING_KEY)) || '[]')
        pending.push({ assetId, lift, savedAt: Date.now() })
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending))
        hasNewData = true
      }
    }

    return hasNewData
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export async function initBackgroundFetch() {
  try {
    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes in seconds
      stopOnTerminate: false, // Continue running when app is terminated
      startOnBoot: true, // Start when device boots
    })
  } catch (error) {
    // Silently fail - background fetch is optional
  }
}

// Function to check if background fetch is available and set up
export async function getBackgroundFetchStatus() {
  try {
    const status = await BackgroundFetch.getStatusAsync()
    return status
  } catch (error) {
    return BackgroundFetch.BackgroundFetchStatus.Denied
  }
}



