import { deleteLift as deleteLiftApi, deleteUserStorage } from './liftService';
import { hapticFeedback } from '../utils/haptic';

/**
 * Simple lift deletion method that handles both loading and final lifts
 * Returns true if successful, false otherwise
 */
export async function deleteLift(
  liftId: string, 
  lift?: any, 
  invalidateUserCheckIns?: () => void
): Promise<boolean> {
  hapticFeedback.selection();

  try {
    // Check if it's a loading lift
    const isLoadingLift = (lift: any) => lift && typeof lift.status !== 'undefined';
    
    if (isLoadingLift(lift)) {
      // Handle loading lift deletion
      const ok = await deleteUserStorage(liftId);
      if (ok) {
        hapticFeedback.success();
        invalidateUserCheckIns?.();
        return true;
      } else {
        hapticFeedback.error();
        return false;
      }
    } else {
      // Handle final lift deletion
      const ok = await deleteLiftApi(liftId);
      if (ok) {
        hapticFeedback.success();
        invalidateUserCheckIns?.();
        return true;
      } else {
        hapticFeedback.error();
        return false;
      }
    }
  } catch (error) {
    hapticFeedback.error();
    return false;
  }
}
