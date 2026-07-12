import { AppUser } from "@/types/appUser";

export function canAccessFeature(
  user: AppUser | null,
  feature: string
) {
  if (!user) return false;

  if (user.isPremium) {
    return true;
  }

  const freeLimits: Record<string, boolean> = {
    analytics: false,
    clients: true,
    reports: false,
  };

  return freeLimits[feature] ?? false;
}