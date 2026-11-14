import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase-admin";
import { gymClientAccess } from "@/lib/server/gymClientAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const noCache = { "Cache-Control": "private, no-store" };
const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: noCache });

async function uidFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    return (await adminAuth.verifyIdToken(header.slice(7).trim(), true)).uid;
  } catch {
    return null;
  }
}

function detectImage(bytes: Buffer) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return { type: "image/png" };
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return { type: "image/jpeg" };
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP") {
    return { type: "image/webp" };
  }
  return null;
}

async function canRead(request: Request, actorUid: string, targetUid: string) {
  if (actorUid === targetUid) return true;
  const [actorSnap, targetSnap] = await Promise.all([
    adminDb.collection("users").doc(actorUid).get(),
    adminDb.collection("users").doc(targetUid).get(),
  ]);
  if (!actorSnap.exists || !targetSnap.exists) return false;
  const actor = actorSnap.data() ?? {};
  const target = targetSnap.data() ?? {};
  const gymId = typeof actor.gymId === "string" ? actor.gymId.trim() : "";
  const targetGymId = typeof target.gymId === "string" ? target.gymId.trim() : "";

  if ((actor.role === "gym_owner" || actor.role === "trainer") && target.role === "client") {
    return (await gymClientAccess(request, targetUid, [actor.role])).ok;
  }

  if (actor.role === "gym_owner" && target.role === "trainer" && gymId && gymId === targetGymId) {
    const [gymSnap, memberSnap] = await Promise.all([
      adminDb.collection("gyms").doc(gymId).get(),
      adminDb.collection("gymMembers").doc(gymId).collection("members").doc(targetUid).get(),
    ]);
    const member = memberSnap.data() ?? {};
    return gymSnap.data()?.ownerId === actorUid && memberSnap.exists &&
      (member.gymRole ?? member.role) === "trainer" && member.gymId === gymId;
  }

  if (actor.role === "client" && gymId && gymId === targetGymId &&
      (target.role === "trainer" || target.role === "gym_owner")) {
    const clientSnap = await adminDb.collection("clients").doc(actorUid).get();
    const client = clientSnap.data() ?? {};
    if (!clientSnap.exists || client.trainerId !== targetUid || client.gymId !== gymId) return false;
    if (target.role === "gym_owner") {
      const gymSnap = await adminDb.collection("gyms").doc(gymId).get();
      return gymSnap.data()?.ownerId === targetUid;
    }
    const memberSnap = await adminDb.collection("gymMembers").doc(gymId).collection("members").doc(targetUid).get();
    const member = memberSnap.data() ?? {};
    return memberSnap.exists && (member.gymRole ?? member.role) === "trainer" && member.gymId === gymId;
  }
  return false;
}

export async function GET(request: Request) {
  const uid = await uidFromRequest(request);
  if (!uid) return reply({ error: "Prijava je potrebna." }, 401);
  const targetUid = new URL(request.url).searchParams.get("uid")?.trim() || uid;
  if (targetUid.length > 128 || targetUid.includes("/")) return reply({ error: "Neispravan ID." }, 400);
  try {
    if (!(await canRead(request, uid, targetUid))) return reply({ error: "Fotografija nije dostupna." }, 403);
    const userSnap = await adminDb.collection("users").doc(targetUid).get();
    const path = userSnap.data()?.profilePhotoPath;
    if (path !== "profile-photos/" + targetUid + "/avatar") return reply({ error: "Slika nije dodana." }, 404);
    const file = adminStorage.bucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return reply({ error: "Slika nije pronađena." }, 404);
    const [[bytes], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
    const type = typeof metadata.contentType === "string" ? metadata.contentType : "";
    if (!["image/jpeg","image/png","image/webp"].includes(type)) return reply({ error: "Datoteka nije slika." }, 415);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: { ...noCache, "Content-Type": type, "Content-Length": String(bytes.byteLength), "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("Dohvat profilne slike nije uspio:", error);
    return reply({ error: "Firebase Storage trenutačno nije dostupan." }, 503);
  }
}

export async function POST(request: Request) {
  const uid = await uidFromRequest(request);
  if (!uid) return reply({ error: "Prijava je potrebna." }, 401);
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const user = userSnap.data() ?? {};
    if (!userSnap.exists || !["client","trainer","gym_owner"].includes(String(user.role))) {
      return reply({ error: "Ovaj račun ne može spremiti profilnu sliku." }, 403);
    }
    if (user.role === "client") {
      const clientSnap = await adminDb.collection("clients").doc(uid).get();
      if (!clientSnap.exists || clientSnap.data()?.gymId !== user.gymId) return reply({ error: "Klijentski profil nije dostupan." }, 403);
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string" || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
      return reply({ error: "Odaberi sliku do 4 MB." }, 400);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const image = detectImage(bytes);
    if (!image) return reply({ error: "Koristi JPG, PNG ili WebP sliku." }, 415);
    const path = "profile-photos/" + uid + "/avatar";
    await adminStorage.bucket().file(path).save(bytes, {
      resumable: false,
      metadata: { contentType: image.type, cacheControl: "private, no-store", metadata: { ownerUid: uid } },
    });
    await userRef.set({
      profilePhotoPath: path,
      profilePhotoContentType: image.type,
      profilePhotoUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return reply({ ok: true, uid });
  } catch (error) {
    console.error("Spremanje profilne slike nije uspjelo:", error);
    return reply({ error: "Slika nije spremljena. Provjeri je li Firebase Storage aktivan." }, 503);
  }
}

export async function DELETE(request: Request) {
  const uid = await uidFromRequest(request);
  if (!uid) return reply({ error: "Prijava je potrebna." }, 401);
  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists || userSnap.data()?.role !== "client") {
      return reply({ error: "Fotografiju mogu ukloniti samo klijenti." }, 403);
    }
    await adminStorage.bucket().file("profile-photos/" + uid + "/avatar").delete({ ignoreNotFound: true });
    await userRef.set({
      profilePhotoPath: FieldValue.delete(),
      profilePhotoContentType: FieldValue.delete(),
      profilePhotoUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return reply({ ok: true });
  } catch (error) {
    console.error("Brisanje profilne slike nije uspjelo:", error);
    return reply({ error: "Slika nije uklonjena." }, 503);
  }
}