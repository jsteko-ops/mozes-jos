import { UserRole } from "./roles";

export interface AppUser {
  uid: string;

  email: string;

  firstName?: string;
  lastName?: string;

  role: UserRole;

  premium: boolean;

  subscriptionStatus?: string;

  trainerId?: string | null;

  gymId?: string | null;
}