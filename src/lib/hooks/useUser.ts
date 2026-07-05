import { testUser } from "@/lib/testUser";

export function useUser() {
  return {
    user: testUser,
  };
}