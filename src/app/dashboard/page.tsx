import { adminDb } from "@/lib/firebaseAdmin";

export default async function Dashboard() {
  const userId = "test-user-123";

  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();

  const data = userSnap.data();

  if (!data?.isPremium) {
    return (
      <div>
        <h1>🚫 Nema pristupa</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>✅ Premium Dashboard</h1>
    </div>
  );
}