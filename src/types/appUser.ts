import { UserRole } from "./roles";

export interface AppUser {
  uid: string;

  email: string;

  firstName?: string;
  lastName?: string;

  role: UserRole;

  isPremium: boolean;

  subscriptionStatus?: string;

  trainerId?: string | null;

  gymId?: string | null;
}