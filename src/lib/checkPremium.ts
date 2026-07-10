import { adminDb } from "@/lib/firebase-admin";

export async function checkPremium(userId: string) {
  const userRef = adminDb
    .collection("users")
    .doc(userId);

  const snap = await userRef.get();

  if (!snap.exists) {
    return false;
  }

  const data = snap.data();

  return (
    data?.isPremium === true &&
    data?.subscriptionStatus === "active"
  );
}