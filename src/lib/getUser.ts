import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function getUserFromToken(token: string) {
  const decoded = await adminAuth.verifyIdToken(token);

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const userSnap = await userRef.get();

  return {
    uid: decoded.uid,
    email: decoded.email,
    ...userSnap.data(),
  };
}