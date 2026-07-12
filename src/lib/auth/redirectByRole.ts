import { AppUser } from "@/types/appUser";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function redirectByRole(
  userProfile: AppUser,
  router: AppRouterInstance
) {
  switch (userProfile.role) {
    case "trainer":
      router.replace("/dashboard/trainer");
      break;

    case "client":
      router.replace("/dashboard/client");
      break;

    case "gym_owner":
      router.replace("/dashboard/owner");
      break;

    case "admin":
      router.replace("/dashboard");
      break;

    default:
      router.replace("/dashboard");
  }
}