export function getPlanLimits(plan: string) {
  const limits: Record<string, any> = {
    free: {
      maxClients: 5,
      analytics: false,
      export: false,
    },
    pro: {
      maxClients: 50,
      analytics: true,
      export: true,
    },
    business: {
      maxClients: Infinity,
      analytics: true,
      export: true,
    },
  };

  return limits[plan || "free"];
}

export function canAddClient(user: any, currentCount: number) {
  const plan = user?.plan || "free";
  const limits = getPlanLimits(plan);

  return currentCount < limits.maxClients;
}

export function canAccessFeature(user: any, feature: string) {
  const plan = user?.plan || "free";
  const limits = getPlanLimits(plan);

  return !!limits[feature];
}