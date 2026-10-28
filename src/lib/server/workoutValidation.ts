export type WorkoutBody = { title: string; exercises: string };
export type WorkoutParse =
  | { ok: true; data: WorkoutBody }
  | { ok: false; error: string };

export function parseWorkoutBody(value: unknown): WorkoutParse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Neispravan zahtjev." };
  }
  const input = value as Record<string, unknown>;
  if (typeof input.title !== "string" || typeof input.exercises !== "string") {
    return { ok: false, error: "Naziv i vježbe moraju biti tekst." };
  }
  const title = input.title.trim();
  const exercises = input.exercises.trim();
  if (title.length < 1 || title.length > 120 || exercises.length < 1 || exercises.length > 30000) {
    return { ok: false, error: "Neispravan naziv ili sadržaj trening plana." };
  }
  return { ok: true, data: { title, exercises } };
}
