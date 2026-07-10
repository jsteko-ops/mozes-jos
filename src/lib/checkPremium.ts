import { adminDb } from "@/lib/firebase-admin";

export async function checkPremium(userId: string) {
  try {
    const userDoc = await adminDb
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return false;
    }

    const user = userDoc.data();

    return (
      user?.isPremium === true &&
      user?.subscriptionStatus === "active"
    );
  } catch (error) {
    console.error("Premium check error:", error);
    return false;
  }
}