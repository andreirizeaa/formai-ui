import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../src/lib/supabase'

const SWEEP_TASK = 'LIFT_SWEEP_TASK'
const PENDING_KEY = 'pendingLiftCompletions'
const INFLIGHT_KEY = 'inflightAssetIds'

TaskManager.defineTask(SWEEP_TASK, async () => {
  try {
    const inflight: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]')
    if (!Array.isArray(inflight) || inflight.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData
    }
    for (const assetId of inflight) {
      const { data: lift } = await supabase
        .from('lifts')
        .select('id,asset_id,analysis,thumbnail_url,lift_type,lift_date,lift_time,weight_value,reps,user_id')
        .eq('asset_id', assetId)
        .maybeSingle()
      if (lift) {
        const pending = JSON.parse((await AsyncStorage.getItem(PENDING_KEY)) || '[]')
        pending.push({ assetId, lift, savedAt: Date.now() })
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending))
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export async function initBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(SWEEP_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    })
  } catch (_) {
    // ignore
  }
}



