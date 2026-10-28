export type MeasurementInput = {
  weight?: number;
  bodyFat?: number | null;
  notes?: string;
  height?: number;
  waist?: number;
  chest?: number;
  arm?: number;
};

const ranges: Record<string, [number, number]> = {
  weight: [20, 400],
  bodyFat: [0, 100],
  height: [50, 300],
  waist: [20, 350],
  chest: [20, 350],
  arm: [5, 150],
};

export function parseMeasurementInput(
  value: unknown,
  creating: boolean
): { ok: true; data: MeasurementInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Neispravni podaci mjerenja." };
  }
  const body = value as Record<string, unknown>;
  const result: MeasurementInput = {};
  const allowed = new Set(["weight", "bodyFat", "notes", "height", "waist", "chest", "arm"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return { ok: false, error: "Nedopušteno polje mjerenja." };
  }
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const raw = body[key];
    if (raw === undefined) continue;
    if (key === "bodyFat" && raw === null) {
      result.bodyFat = null;
      continue;
    }
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw < min || raw > max) {
      return { ok: false, error: `Neispravna vrijednost: ${key}.` };
    }
    (result as Record<string, unknown>)[key] = raw;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string" || body.notes.length > 2000) {
      return { ok: false, error: "Bilješka je preduga ili neispravna." };
    }
    result.notes = body.notes.trim();
  }
  if (creating && result.weight === undefined) {
    return { ok: false, error: "Težina je obavezna." };
  }
  if (Object.keys(result).length === 0) {
    return { ok: false, error: "Nema podataka za spremanje." };
  }
  return { ok: true, data: result };
}
