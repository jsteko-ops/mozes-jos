import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

/**
 * Označi usera kao premium (Stripe webhook ili ručno)
 */
export async function setUserPremium(userId: string, stripeSubscriptionId?: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    isPremium: true,
    subscriptionStatus: "active",
    stripeSubscriptionId: stripeSubscriptionId || null,
    updatedAt: new Date()
  });

  return true;
}

/**
 * Ukloni premium status (cancel subscription)
 */
export async function removeUserPremium(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    isPremium: false,
    subscriptionStatus: "inactive",
    stripeSubscriptionId: null,
    updatedAt: new Date()
  });

  return true;
}

/**
 * Dohvati subscription status usera
 */
export async function getUserSubscription(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();

  return {
    isPremium: data.isPremium || false,
    status: data.subscriptionStatus || "inactive",
    stripeSubscriptionId: data.stripeSubscriptionId || null
  };
}