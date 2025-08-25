import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getUserId } from '../services/storageService';
import { favouriteLift as favouriteLiftApi } from '../services/liftService';

export interface ILiftData {
  id: string;
  isFavourite: boolean;
  liftType: string;
  liftDate: string;
  weightValue: number;
  reps: number;
  rawVideoURL: any;
  poseVideoURL: any;
  thumbnailURL?: any;
  analysis: {
    accuracy: number;
    lineGraphValues: number[];
    feedback: Array<{
      imageURL: any;
      flaws: string[];
      improvement: string[];
    }>;
  };
}

interface LiftDataContextType {
  liftData: ILiftData[];
  addLift: (lift: ILiftData) => void;
  updateLift: (id: string, updatedLift: Partial<ILiftData>) => void;
  removeLift: (id: string) => void;
  toggleFavourite: (id: string) => void;
  getLiftById: (id: string) => ILiftData | undefined;
  getFavouriteLifts: () => ILiftData[];
  getLiftsByType: (liftType: string) => ILiftData[];
  getLiftsByDate: (date: Date) => ILiftData[];
  getLiftsByDateString: (dateString: string) => ILiftData[];
  clearAllLifts: () => void;
  formatDateForLift: (date: Date) => string;
  refreshLifts: () => Promise<void>;
  favouriteLiftAndRefresh: (id: string) => Promise<void>;
  isLiftDataLoaded: boolean;
}

const LiftDataContext = createContext<LiftDataContextType | undefined>(undefined);

const initialLiftData: ILiftData[] = [];

interface LiftDataProviderProps {
  children: ReactNode;
}

export function LiftDataProvider({ children }: LiftDataProviderProps) {
  const [liftData, setLiftData] = useState<ILiftData[]>(initialLiftData);
  const [userId, setUserIdState] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getUserId().then(setUserIdState).catch(() => setUserIdState(null));
    setIsLoaded(false);
  }, []);

  // Helper function to format date consistently
  const formatDateForLift = useCallback((date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const addLift = useCallback((lift: ILiftData) => {
    setLiftData(prev => [...prev, lift]);
  }, []);

  const updateLift = useCallback((id: string, updatedLift: Partial<ILiftData>) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, ...updatedLift } : lift
      )
    );
  }, []);

  const removeLift = useCallback((id: string) => {
    setLiftData(prev => prev.filter(lift => lift.id !== id));
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, isFavourite: !lift.isFavourite } : lift
      )
    );
  }, []);

  const getLiftById = useCallback((id: string): ILiftData | undefined => {
    return liftData.find(lift => lift.id === id);
  }, [liftData]);

  const getFavouriteLifts = useCallback((): ILiftData[] => {
    return liftData.filter(lift => lift.isFavourite);
  }, [liftData]);

  const getLiftsByType = useCallback((liftType: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftType === liftType);
  }, [liftData]);

  const getLiftsByDate = useCallback((date: Date): ILiftData[] => {
    const dateString = formatDateForLift(date);
    return liftData.filter(lift => lift.liftDate === dateString);
  }, [liftData, formatDateForLift]);

  const getLiftsByDateString = useCallback((dateString: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftDate === dateString);
  }, [liftData]);

  const clearAllLifts = useCallback(() => {
    setLiftData([]);
  }, []);

  // Fetch lifts on load and whenever userId changes
  useQuery({
    queryKey: ['lifts-by-user', userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        if (!userId) return [] as ILiftData[];
        const { data, error } = await supabase
        .from('lifts')
        .select('id, is_favourite, lift_type, lift_date, weight_value, reps, raw_video_url, pose_video_url, thumbnail_url, analysis')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        if (error) return [] as ILiftData[];

      async function extractObjectKeyFromUrl(urlOrKey?: string | null): Promise<string | undefined> {
        if (!urlOrKey) return undefined;
        if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
          // Expect formats like /storage/v1/object/public/lifts/<key>
          const marker = '/storage/v1/object/';
          const idx = urlOrKey.indexOf(marker);
          if (idx === -1) return undefined;
          const after = urlOrKey.substring(idx + marker.length); // e.g. 'public/lifts/uid/path...'
          const parts = after.split('/');
          // parts[0] is 'public' or 'sign', parts[1] should be bucket id
          if (parts.length < 3) return undefined;
          const bucketId = parts[1];
          if (bucketId !== 'lifts') return undefined;
          const pathWithQuery = parts.slice(2).join('/');
          const key = pathWithQuery.split('?')[0];
          return key;
        }
        // Already a key
        return urlOrKey;
      }

      async function signPath(key?: string): Promise<string | undefined> {
        
        if (!key) return undefined;
        const { data: signed, error: signError } = await supabase.storage
          .from('lifts')
          .createSignedUrl(key, 60 * 30); // 30 minutes
        if (signError) {
          return undefined;
        }
        return signed?.signedUrl;
      }

      async function mapRowToLift(row: any): Promise<ILiftData> {
        const thumbKey = await extractObjectKeyFromUrl(row.thumbnail_url);
        const rawKey = await extractObjectKeyFromUrl(row.raw_video_url);
        const poseKey = await extractObjectKeyFromUrl(row.pose_video_url);
        const [thumbnailURL, rawVideoURL, poseVideoURL] = await Promise.all([
          signPath(thumbKey),
          signPath(rawKey),
          signPath(poseKey),
        ]);
        const rawFeedback: Array<{ imageURL: any; flaws: any; improvement: any }> = Array.isArray(row.analysis?.feedback) ? row.analysis.feedback : [];
        const signedFeedback = await Promise.all(
          rawFeedback.map(async (f) => {
            const feedbackKey = await extractObjectKeyFromUrl(typeof f.imageURL === 'string' ? f.imageURL : undefined);
            const signedUrl = await signPath(feedbackKey);
            return { ...f, imageURL: signedUrl ?? f.imageURL };
          })
        );
        return {
          id: row.id,
          isFavourite: !!row.is_favourite,
          liftType: row.lift_type,
          liftDate: formatDateForLift(new Date(row.lift_date)),
          weightValue: Number(row.weight_value),
          reps: Number(row.reps),
          rawVideoURL,
          poseVideoURL,
          thumbnailURL,
          analysis: {
            accuracy: Number(row.analysis?.accuracy ?? 0),
            lineGraphValues: Array.isArray(row.analysis?.lineGraphValues) ? row.analysis.lineGraphValues : [],
            feedback: signedFeedback,
          },
        } as ILiftData;
      }

        const mapped: ILiftData[] = await Promise.all(
          (data ?? []).map((row: any) => mapRowToLift(row))
        );

        // Seed per-lift caches keyed by primary key id
        mapped.forEach(lift => {
          queryClient.setQueryData(['lift', lift.id], lift);
        });
        setLiftData(mapped);
        return mapped;
      } finally {
        setIsLoaded(true);
      }
    },
  });

  const refreshLifts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['lifts-by-user', userId] });
  }, [queryClient, userId]);

  const favouriteLiftAndRefresh = useCallback(async (id: string) => {
    try {
      await favouriteLiftApi(id);
    } finally {
      // Fetch only this lift by id and update state
      const { data, error } = await supabase
        .from('lifts')
        .select('id, is_favourite, lift_type, lift_date, weight_value, reps, raw_video_url, pose_video_url, thumbnail_url, analysis')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        const updated = await (async () => {
          // reuse mapping logic
          async function extractObjectKeyFromUrlInner(urlOrKey?: string | null): Promise<string | undefined> {
            if (!urlOrKey) return undefined;
            if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
              const marker = '/storage/v1/object/';
              const idx = urlOrKey.indexOf(marker);
              if (idx === -1) return undefined;
              const after = urlOrKey.substring(idx + marker.length);
              const parts = after.split('/');
              if (parts.length < 3) return undefined;
              const bucketId = parts[1];
              if (bucketId !== 'lifts') return undefined;
              const pathWithQuery = parts.slice(2).join('/');
              const key = pathWithQuery.split('?')[0];
              return key;
            }
            return urlOrKey;
          }
          async function signPathInner(key?: string): Promise<string | undefined> {
            if (!key) return undefined;
            const { data: signed, error: signError } = await supabase.storage
              .from('lifts')
              .createSignedUrl(key, 60 * 30);
            if (signError) return undefined;
            return signed?.signedUrl;
          }
          // Use existing helpers via closures
          const thumbKey = await extractObjectKeyFromUrlInner(data.thumbnail_url);
          const rawKey = await extractObjectKeyFromUrlInner(data.raw_video_url);
          const poseKey = await extractObjectKeyFromUrlInner(data.pose_video_url);
          const [thumbnailURL, rawVideoURL, poseVideoURL] = await Promise.all([
            signPathInner(thumbKey),
            signPathInner(rawKey),
            signPathInner(poseKey),
          ]);
          const rawFeedback: Array<{ imageURL: any; flaws: any; improvement: any }> = Array.isArray(data.analysis?.feedback) ? data.analysis.feedback : [];
          const signedFeedback = await Promise.all(
            rawFeedback.map(async (f) => {
              const feedbackKey = await extractObjectKeyFromUrlInner(typeof f.imageURL === 'string' ? f.imageURL : undefined);
              const signedUrl = await signPathInner(feedbackKey);
              return { ...f, imageURL: signedUrl ?? f.imageURL };
            })
          );
          const mappedLift: ILiftData = {
            id: data.id,
            isFavourite: !!data.is_favourite,
            liftType: data.lift_type,
            liftDate: formatDateForLift(new Date(data.lift_date)),
            weightValue: Number(data.weight_value),
            reps: Number(data.reps),
            rawVideoURL,
            poseVideoURL,
            thumbnailURL,
            analysis: {
              accuracy: Number(data.analysis?.accuracy ?? 0),
              lineGraphValues: Array.isArray(data.analysis?.lineGraphValues) ? data.analysis.lineGraphValues : [],
              feedback: signedFeedback,
            },
          };
          return mappedLift;
        })();
        setLiftData(prev => prev.map(l => l.id === id ? updated : l));
        queryClient.setQueryData(['lift', id], updated);
      }
    }
  }, [queryClient, userId]);

  const value = useMemo(() => ({
    liftData,
    addLift,
    updateLift,
    removeLift,
    toggleFavourite,
    getLiftById,
    getFavouriteLifts,
    getLiftsByType,
    getLiftsByDate,
    getLiftsByDateString,
    clearAllLifts,
    formatDateForLift,
    refreshLifts,
    favouriteLiftAndRefresh,
    isLiftDataLoaded: isLoaded,
  }), [
    liftData,
    addLift,
    updateLift,
    removeLift,
    toggleFavourite,
    getLiftById,
    getFavouriteLifts,
    getLiftsByType,
    getLiftsByDate,
    getLiftsByDateString,
    clearAllLifts,
    formatDateForLift,
    refreshLifts,
    favouriteLiftAndRefresh,
    isLoaded,
  ]);

  // Expose clearAllLifts globally for tutorial completion
  React.useEffect(() => {
    global.clearTemporaryLifts = clearAllLifts;
    return () => {
      global.clearTemporaryLifts = undefined;
    };
  }, [clearAllLifts]);

  return (
    <LiftDataContext.Provider value={value}>
      {children}
    </LiftDataContext.Provider>
  );
}

export function useLiftData() {
  const context = useContext(LiftDataContext);
  if (context === undefined) {
    throw new Error('useLiftData must be used within a LiftDataProvider');
  }
  return context;
} 

// Expose a helper for tutorial to inject a dummy lift quickly
declare global {
  var addDummyLift: (() => void) | undefined;
}

export function TutorialLiftSeeder() {
  const { addLift, formatDateForLift } = useLiftData();
  React.useEffect(() => {
    global.addDummyLift = () => {
      const today = new Date();
      const id = `demo-${today.getTime()}`;
      addLift({
        id,
        isFavourite: false,
        liftType: 'Barbell Front Squat',
        liftDate: formatDateForLift(today),
        weightValue: 60,
        reps: 1,
        rawVideoURL: require('../../assets/tutorial/formai-example-video.mp4'),
        poseVideoURL: require('../../assets/tutorial/formai-example-pose.mp4'),
        thumbnailURL: require('../../assets/tutorial/formai-example-video-thumbnail.jpg'),
        analysis: {
          accuracy: 67,
          lineGraphValues: [67],
          feedback: [
            {
              imageURL: require('../../assets/tutorial/formai-example-feedback.png'),
              flaws: [
                "Right knee is caving inward compared to the left, showing knee valgus.",
                "Right ankle angle suggests the heel may be lifting more than the left.",
                "Torso is leaning forward excessively, which stresses the lower back.",
                "Barbell path is slightly forward of mid-foot, reducing lifting efficiency.",
                "Hip angle indicates possible butt wink or pelvic tuck at the bottom."
              ],
              improvement: [
                "Actively push knees out and think 'spread the floor' with your feet to prevent valgus.",
                "Improve ankle dorsiflexion with stretches and banded mobilizations to keep heels grounded.",
                "Brace your core harder using the Valsalva maneuver to maintain an upright torso.",
                "Keep the bar over mid-foot and adjust grip width to tighten the upper back.",
                "Strengthen glutes and hamstrings with RDLs, hip thrusts, and pause squats to control hip position.",
                "Consider weightlifting shoes with a heel lift if ankle mobility limits squat depth."
            ],
            },
          ],
        },
      });
    };
    return () => { if (global.addDummyLift) delete global.addDummyLift; };
  }, [addLift, formatDateForLift]);
  return null;
} 