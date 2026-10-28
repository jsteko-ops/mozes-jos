import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type NutritionRole = "client" | "trainer" | "gym_owner";

type AccessResult =
  | { ok: true; uid: string; clientId: string; gymId: string; role: NutritionRole }
  | { ok: false; status: number; error: string };

export function validDocumentId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/")
  );
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function memberRole(value: Record<string, unknown> | undefined): string {
  return str(value?.gymRole ?? value?.role);
}

export async function nutritionAccess(
  request: Request,
  clientId: string,
  write: boolean
): Promise<AccessResult> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Prijava je potrebna." };
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(
      authorization.slice(7).trim(),
      true
    );
    uid = decoded.uid;
  } catch {
    return { ok: false, status: 401, error: "Prijava nije valjana." };
  }

  if (!validDocumentId(uid) || !validDocumentId(clientId)) {
    return { ok: false, status: 400, error: "Neispravan ID." };
  }

  const [userSnap, clientSnap] = await Promise.all([
    adminDb.collection("users").doc(uid).get(),
    adminDb.collection("clients").doc(clientId).get(),
  ]);

  const user = userSnap.data();
  const client = clientSnap.data();
  const gymId = str(client?.gymId);
  const trainerId = str(client?.trainerId);
  const role = str(user?.role);

  if (
    !userSnap.exists || !clientSnap.exists ||
    !validDocumentId(gymId) ||
    str(user?.gymId) !== gymId ||
    !["client", "trainer", "gym_owner"].includes(role)
  ) {
    return { ok: false, status: 403, error: "Pristup nije dopušten." };
  }

  const [gymSnap, clientMemberSnap] = await Promise.all([
    adminDb.collection("gyms").doc(gymId).get(),
    adminDb.collection("gymMembers").doc(gymId)
      .collection("members").doc(clientId).get(),
  ]);
  const gym = gymSnap.data();
  const clientMember = clientMemberSnap.data();

  if (
    !gymSnap.exists || !validDocumentId(str(gym?.ownerId)) ||
    !clientMemberSnap.exists ||
    memberRole(clientMember) !== "client" ||
    str(clientMember?.gymId) !== gymId ||
    str(clientMember?.trainerId) !== trainerId
  ) {
    return { ok: false, status: 403, error: "Članstvo nije valjano." };
  }

  if (role === "gym_owner") {
    if (str(gym?.ownerId) !== uid) {
      return { ok: false, status: 403, error: "Niste vlasnik teretane." };
    }
    return { ok: true, uid, clientId, gymId, role: "gym_owner" };
  }

  if (role === "trainer") {
    if (trainerId !== uid) {
      return { ok: false, status: 403, error: "Klijent nije dodijeljen treneru." };
    }
    const trainerSnap = await adminDb.collection("gymMembers").doc(gymId)
      .collection("members").doc(uid).get();
    if (
      !trainerSnap.exists || memberRole(trainerSnap.data()) !== "trainer" ||
      str(trainerSnap.data()?.gymId) !== gymId
    ) {
      return { ok: false, status: 403, error: "Trener nije član teretane." };
    }
    return { ok: true, uid, clientId, gymId, role: "trainer" };
  }

  if (role === "client") {
    if (write || uid !== clientId) {
      return { ok: false, status: 403, error: "Klijent može samo čitati svoje planove." };
    }
    if (!validDocumentId(trainerId)) {
      return { ok: false, status: 403, error: "Trener nije dodijeljen." };
    }
    const [trainerMemberSnap, trainerUserSnap] = await Promise.all([
      adminDb.collection("gymMembers").doc(gymId).collection("members").doc(trainerId).get(),
      adminDb.collection("users").doc(trainerId).get(),
    ]);
    if (
      !trainerMemberSnap.exists || !trainerUserSnap.exists ||
      memberRole(trainerMemberSnap.data()) !== "trainer" ||
      str(trainerMemberSnap.data()?.gymId) !== gymId ||
      trainerUserSnap.data()?.role !== "trainer" ||
      str(trainerUserSnap.data()?.gymId) !== gymId
    ) {
      return { ok: false, status: 403, error: "Dodjela trenera nije valjana." };
    }
    return { ok: true, uid, clientId, gymId, role: "client" };
  }

  return { ok: false, status: 403, error: "Pristup nije dopušten." };
}
