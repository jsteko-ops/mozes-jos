export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  rest?: number;
  notes?: string;
  order: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  active: boolean;

  trainerId: string;
  clientId: string;

  exercises: Exercise[];

  createdAt?: Date;
  updatedAt?: Date;
}