export const gymMovements = [
  { name: 'Flat Barbell Bench Press', bodyPart: 'chest' },
  { name: 'Incline Barbell Bench Press', bodyPart: 'chest' },
  { name: 'Decline Barbell Bench Press', bodyPart: 'chest' },
  { name: 'Flat Dumbbell Chest Press', bodyPart: 'chest' },
  { name: 'Incline Dumbbell Chest Press', bodyPart: 'chest' },
  { name: 'Decline Dumbbell Chest Press', bodyPart: 'chest' },
  { name: 'Dumbbell Chest Fly (Incline)', bodyPart: 'chest' },
  { name: 'Dumbbell Chest Fly (Flat)', bodyPart: 'chest' },
  { name: 'Dumbbell Chest Fly (Decline)', bodyPart: 'chest' },

  { name: 'Deadlift', bodyPart: 'back' },
  { name: 'Barbell Row', bodyPart: 'back' },
  { name: 'Pendlay Row', bodyPart: 'back' },
  { name: 'T-Bar Row', bodyPart: 'back' },
  { name: 'Dumbbell Row', bodyPart: 'back' },
  { name: 'Single Arm Dumbbell Row', bodyPart: 'back' },

  { name: 'Overhead Barbell Press', bodyPart: 'shoulders' },
  { name: 'Seated Dumbbell Shoulder Press', bodyPart: 'shoulders' },
  { name: 'Arnold Press', bodyPart: 'shoulders' },
  { name: 'Lateral Raise (Dumbbell)', bodyPart: 'shoulders' },
  { name: 'Front Raise (Dumbbell)', bodyPart: 'shoulders' },
  { name: 'Upright Row', bodyPart: 'shoulders' },
  
  { name: 'Barbell Curl', bodyPart: 'arms' },
  { name: 'EZ-Bar Curl', bodyPart: 'arms' },
  { name: 'Dumbbell Curl', bodyPart: 'arms' },
  { name: 'Hammer Curl', bodyPart: 'arms' },
  { name: 'Incline Dumbbell Curl', bodyPart: 'arms' },
  { name: 'Cable Curl', bodyPart: 'arms' },
  { name: 'Preacher Curl', bodyPart: 'arms' },

  { name: 'Skullcrusher (Barbell or EZ-Bar)', bodyPart: 'arms' },
  { name: 'Dumbbell Overhead Triceps Extension', bodyPart: 'arms' },

  { name: 'Barbell Back Squat', bodyPart: 'legs' },
  { name: 'Barbell Front Squat', bodyPart: 'legs' },
  { name: 'Goblet Squat', bodyPart: 'legs' },
  { name: 'Dumbbell Back Squat', bodyPart: 'legs' },

  { name: 'Romanian Deadlift (Barbell or Dumbbell)', bodyPart: 'legs' },
  { name: 'Stiff-Leg Deadlift', bodyPart: 'legs' },
  { name: 'Good Morning', bodyPart: 'legs' },
  { name: 'Push Ups', bodyPart: 'chest' }
] as const;

export type GymMovement = typeof gymMovements[number];
export type BodyPart = 'all' | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs'; 