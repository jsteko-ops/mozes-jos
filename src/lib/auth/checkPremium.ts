export function canAccessFeature(user: any, feature: string) {
  if (user?.isPremium) return true;

  const freeLimits: Record<string, boolean> = {
    analytics: false,
    clients: true,
    reports: false,
  };

  return freeLimits[feature] ?? false;
}