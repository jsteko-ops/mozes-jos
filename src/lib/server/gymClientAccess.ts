import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type GymClientRole = "gym_owner" | "trainer" | "client";
export type GymClientAccess =
  | { ok: false; status: number; error: string }
  | {
      ok: true;
      uid: string;
      role: GymClientRole;
      gymId: string;
      trainerId: string;
      clientId: string;
      clientData: Record<string, unknown>;
      gymData: Record<string, unknown>;
    };

export const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export function validId(value: string): boolean {
  return value.length > 0 && value.length <= 128 &&
    value !== "." && value !== ".." && !value.includes("/");
}

const denied = (error: string, status = 403): GymClientAccess =>
  ({ ok: false, status, error });

export async function gymClientAccess(
  request: Request,
  clientId: string,
  permitted: readonly GymClientRole[]
): Promise<GymClientAccess> {
  if (!validId(clientId)) return denied("Neispravan ID klijenta.", 400);
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return denied("Prijava je potrebna.", 401);
  let uid = "";
  try {
    uid = (await adminAuth.verifyIdToken(token, true)).uid;
  } catch {
    return denied("Prijava nije valjana.", 401);
  }
  if (!validId(uid)) return denied("Prijava nije valjana.", 401);

  const [userSnap, clientSnap] = await Promise.all([
    adminDb.collection("users").doc(uid).get(),
    adminDb.collection("clients").doc(clientId).get(),
  ]);
  if (!userSnap.exists || !clientSnap.exists) return denied("Klijent nije dostupan.");
  const actor = userSnap.data() ?? {};
  const client = clientSnap.data() ?? {};
  const role = str(actor.role);
  const gymId = str(client.gymId);
  const actorGymId = str(actor.gymId);
  const trainerId = str(client.trainerId);
  if (!permitted.includes(role as GymClientRole) || !validId(gymId) ||
      (trainerId && !validId(trainerId)) ||
      (actorGymId && actorGymId !== gymId)) {
    return denied("Pristup nije dopušten.");
  }

  const gym = adminDb.collection("gyms").doc(gymId);
  const members = adminDb.collection("gymMembers").doc(gymId).collection("members");
  const [gymSnap, clientMemberSnap, trainerMemberSnap, trainerUserSnap] = await Promise.all([
    gym.get(),
    members.doc(clientId).get(),
    trainerId ? members.doc(trainerId).get() : Promise.resolve(null),
    trainerId ? adminDb.collection("users").doc(trainerId).get() : Promise.resolve(null),
  ]);
  const gymData = gymSnap.data() ?? {};
  const membership = clientMemberSnap.data() ?? {};
  const assignedTrainer = trainerMemberSnap?.data() ?? {};
  const assignedTrainerUser = trainerUserSnap?.data() ?? {};
  const memberRole = membership.gymRole ?? membership.role;
  const assignedRole = assignedTrainer.gymRole ?? assignedTrainer.role;
  const ownerIsAssignedCoach =
    Boolean(trainerId) &&
    trainerId === str(gymData.ownerId) &&
    assignedTrainerUser.role === "gym_owner" &&
    str(assignedTrainerUser.gymId) === gymId;
  const teamTrainerIsAssigned =
    Boolean(trainerId) &&
    trainerMemberSnap?.exists === true &&
    assignedRole === "trainer" &&
    assignedTrainer.gymId === gymId;
  if (!gymSnap.exists || !validId(str(gymData.ownerId)) ||
      !clientMemberSnap.exists || memberRole !== "client" ||
      membership.gymId !== gymId || str(membership.trainerId) !== trainerId ||
      (trainerId && !ownerIsAssignedCoach && !teamTrainerIsAssigned)) {
    return denied("Članstvo klijenta nije valjano.");
  }

  if (role === "gym_owner") {
    if (gymData.ownerId !== uid || actorGymId !== gymId) {
      return denied("Nisi vlasnik teretane.");
    }
  } else if (role === "trainer") {
    const actorMemberSnap = trainerId === uid ? trainerMemberSnap : await members.doc(uid).get();
    const actorMember = actorMemberSnap?.data() ?? {};
    if (actorGymId !== gymId || uid !== trainerId || !actorMemberSnap?.exists ||
        (actorMember.gymRole ?? actorMember.role) !== "trainer" ||
        actorMember.gymId !== gymId) {
      return denied("Trener nema pristup ovom klijentu.");
    }
  } else if (role === "client") {
    if (uid !== clientId || (actorGymId && actorGymId !== gymId)) {
      return denied("Klijent ne može pristupiti tuđim podatcima.");
    }
  } else {
    return denied("Pristup nije dopušten.");
  }
  return {
    ok: true, uid, role: role as GymClientRole, gymId, clientId, trainerId,
    clientData: client as Record<string, unknown>,
    gymData: gymData as Record<string, unknown>,
  };
}
