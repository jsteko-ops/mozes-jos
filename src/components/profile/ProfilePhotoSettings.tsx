"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import PrivateProfilePhoto from "@/components/profile/PrivateProfilePhoto";

type Props = { uid?: string; role?: string };

export default function ProfilePhotoSettings({ uid, role }: Props) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const required = role === "trainer";

  async function refresh() {
    const user = auth.currentUser;
    if (!user || !uid) { setLoading(false); return; }
    const token = await user.getIdToken();
    const response = await fetch("/api/profile-photo", {
      headers: { Authorization: "Bearer " + token }, cache: "no-store",
    });
    setHasPhoto(response.ok);
    setLoading(false);
  }

  useEffect(() => { void refresh().catch(() => setLoading(false)); }, [uid]);

  async function upload(file?: File) {
    if (!file) return;
    setMessage("");
    setError("");
    if (file.size > 4 * 1024 * 1024) { setError("Slika mora biti manja od 4 MB."); return; }
    const user = auth.currentUser;
    if (!user || user.uid !== uid) { setError("Prijava nije valjana."); return; }
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/profile-photo", {
        method: "POST", headers: { Authorization: "Bearer " + token }, body: form,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Slika nije spremljena.");
      setHasPhoto(true);
      setMessage("Profilna slika je spremljena.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Slika nije spremljena.");
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile-photo", {
        method: "DELETE", headers: { Authorization: "Bearer " + token },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Slika nije uklonjena.");
      setHasPhoto(false); setMessage("Profilna slika je uklonjena.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Slika nije uklonjena.");
    } finally { setSaving(false); }
  }

  if (!uid || !role) return null;
  const name = String(auth.currentUser?.displayName || auth.currentUser?.email || "Profil");
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <PrivateProfilePhoto uid={uid} name={name} size={76} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#16A6A1]">Profil</p>
          <h2 className="mt-1 text-xl font-black text-[#15171A]">Profilna slika</h2>
          <p className="mt-1 text-sm text-[#667085]">
            {required ? "Obavezna je za trenere prije dodjele klijentima." : "Neobavezna je. Dodaj sliku ako želiš da te trener lakše prepozna."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-[#111317] px-4 py-3 text-sm font-bold text-white hover:bg-black">
            {saving ? "Spremam..." : hasPhoto ? "Promijeni sliku" : "Odaberi sliku"}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
              required={required && !hasPhoto} disabled={saving}
              onChange={(event) => void upload(event.target.files?.[0])} />
          </label>
          {role === "client" && hasPhoto && (
            <button type="button" onClick={() => void remove()} disabled={saving}
              className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-bold text-[#667085] disabled:opacity-50">
              Ukloni sliku
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#667085]">JPG, PNG ili WebP • najviše 4 MB</p>
      {loading && <p className="mt-3 text-sm text-[#667085]">Provjeravam spremljenu sliku…</p>}
      {message && <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
    </section>
  );
}