export const gymMovements = [
  'Flat Barbell Bench Press',
  'Incline Barbell Bench Press',
  'Decline Barbell Bench Press',
  'Flat Dumbbell Chest Press',
  'Incline Dumbbell Chest Press',
  'Decline Dumbbell Chest Press',
  'Dumbbell Chest Fly (Incline)',
  'Dumbbell Chest Fly (Flat)',
  'Dumbbell Chest Fly (Decline)',

  'Deadlift',
  'Barbell Row',
  'Pendlay Row',
  'T-Bar Row',
  'Dumbbell Row',
  'Single Arm Dumbbell Row',

  'Overhead Barbell Press',
  'Seated Dumbbell Shoulder Press',
  'Arnold Press',
  'Lateral Raise (Dumbbell)',
  'Front Raise (Dumbbell)',
  'Upright Row',
  
  'Barbell Curl',
  'EZ-Bar Curl',
  'Dumbbell Curl',
  'Hammer Curl',
  'Incline Dumbbell Curl',
  'Cable Curl',
  'Preacher Curl',

  'Skullcrusher (Barbell or EZ-Bar)',
  'Dumbbell Overhead Triceps Extension',

  'Barbell Back Squat',
  'Barbell Front Squat',
  'Goblet Squat',
  'Dumbbell Back Squat',

  'Romanian Deadlift (Barbell or Dumbbell)',
  'Stiff-Leg Deadlift',
  'Good Morning',
] as const;

export type GymMovement = typeof gymMovements[number]; 