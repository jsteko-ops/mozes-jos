import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { gymClientAccess, str } from "@/lib/server/gymClientAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clientId: string }> };
const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function GET(request: Request, context: Context) {
  const { clientId } = await context.params;
  try {
    const access = await gymClientAccess(request, clientId, ["gym_owner", "trainer"]);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const trainerSnap = access.trainerId
      ? await adminDb.collection("users").doc(access.trainerId).get()
      : null;
    const trainerData = trainerSnap?.data() ?? {};
    return reply({
      client: {
        id: clientId, name: str(access.clientData.name),
        email: str(access.clientData.email), phone: str(access.clientData.phone),
        note: str(access.clientData.note), goal: str(access.clientData.goal),
        gender: str(access.clientData.gender),
      },
      trainer: access.trainerId ? {
        uid: access.trainerId,
        name: str(trainerData.name) || [str(trainerData.firstName),str(trainerData.lastName)].filter(Boolean).join(" "),
        displayName: str(trainerData.displayName),
        email: str(trainerData.email),
      } : null,
      gym: { id: access.gymId, name: str(access.gymData.name) },
    });
  } catch (error) {
    console.error("Dohvat klijentskog profila nije uspio:", error);
    return reply({ error: "Profil trenutačno nije dostupan." }, 500);
  }
}

const fields = ["name", "email", "phone", "note", "goal", "gender"] as const;
const maxLengths: Record<string, number> = {
  name: 160, email: 254, phone: 60, note: 5000, goal: 1500, gender: 40,
};
function parseProfileUpdate(input: unknown):
  | { ok: true; data: Record<string,string> }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Neispravan zahtjev." };
  }
  const body = input as Record<string,unknown>;
  if (Object.keys(body).some(key => !(fields as readonly string[]).includes(key))) {
    return { ok: false, error: "Nedopušteno polje." };
  }
  const data: Record<string,string> = {};
  for (const field of fields) {
    const raw = body[field];
    if (typeof raw !== "string" || raw.length > maxLengths[field] * 2) {
      return { ok: false, error: `Neispravno polje: ${field}.` };
    }
    const value = raw.trim();
    if (value.length > maxLengths[field]) {
      return { ok: false, error: `Polje ${field} je predugo.` };
    }
    data[field] = value;
  }
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, error: "Ime i e-mail moraju biti valjani." };
  }
  if (!["male", "female", "prefer_not_to_say"].includes(data.gender)) {
    return { ok: false, error: "Odaberi spol klijenta." };
  }
  return { ok: true, data };
}

export async function PATCH(request: Request, context: Context) {
  const { clientId } = await context.params;
  try {
    const access = await gymClientAccess(request, clientId, ["gym_owner", "trainer"]);
    if (access.ok === false) return reply({ error: access.error }, access.status);
    const raw = await request.text();
    if (raw.length > 12000) return reply({ error: "Zahtjev je prevelik." }, 413);
    let body: unknown;
    try { body = JSON.parse(raw); }
    catch { return reply({ error: "Neispravan JSON." }, 400); }
    const parsed = parseProfileUpdate(body);
    if (parsed.ok === false) return reply({ error: parsed.error }, 400);
    // Kontaktni e-mail, ne mijenja adresu za Firebase prijavu.
    await adminDb.collection("clients").doc(clientId).update(parsed.data);
    return reply({ ok: true, clientId });
  } catch (error) {
    console.error("Ažuriranje klijenta nije uspjelo:", error);
    return reply({ error: "Klijenta trenutačno nije moguće ažurirati." }, 500);
  }
}
