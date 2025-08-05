import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  submitOnboardingData, 
  formatOnboardingDataForAPI, 
  validateOnboardingData,
  getOnboardingAnalytics 
} from '../utils/onboardingAPI';

interface UseOnboardingAPIResult {
  submitData: (apiEndpoint: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  isLoading: boolean;
  error: string | null;
  analytics: ReturnType<typeof getOnboardingAnalytics>;
  isValid: boolean;
}

export function useOnboardingAPI(): UseOnboardingAPIResult {
  const { preferences } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitData = async (apiEndpoint: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate data first
      if (!validateOnboardingData(preferences)) {
        throw new Error('Onboarding data is incomplete');
      }

      // Format data for API
      const apiPayload = formatOnboardingDataForAPI(preferences);

      // Submit to API
      const result = await submitOnboardingData(apiPayload, apiEndpoint);

      if (!result.success) {
        setError(result.error || 'Failed to submit onboarding data');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const analytics = getOnboardingAnalytics(preferences);
  const isValid = validateOnboardingData(preferences);

  return {
    submitData,
    isLoading,
    error,
    analytics,
    isValid,
  };
}

// Example usage in a component:
/*
import { useOnboardingAPI } from '../hooks/useOnboardingAPI';

function OnboardingCompleteScreen() {
  const { submitData, isLoading, error, analytics, isValid } = useOnboardingAPI();

  const handleSubmit = async () => {
    const result = await submitData('https://api.yourapp.com/onboarding');
    
    if (result.success) {
      console.log('Onboarding data submitted successfully:', result.data);
      // Navigate to main app or show success message
    } else {
      console.error('Failed to submit onboarding data:', result.error);
      // Show error message to user
    }
  };

  return (
    <View>
      <Text>Progress: {analytics.progress}%</Text>
      <Text>Completed: {analytics.completedSteps}/{analytics.totalSteps}</Text>
      
      {!isValid && (
        <Text>Missing fields: {analytics.missingFields.join(', ')}</Text>
      )}
      
      <Button 
        title={isLoading ? 'Submitting...' : 'Complete Onboarding'} 
        onPress={handleSubmit}
        disabled={!isValid || isLoading}
      />
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
*/ 