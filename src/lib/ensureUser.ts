import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function ensureUser(user: {
  uid: string;
  email: string | null;
}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return;

  await setDoc(ref, {
    email: user.email || "",
    role: "trainer", // DEFAULT ROLE
    createdAt: serverTimestamp(),
  });

  console.log("🔥 User created:", user.uid);
}