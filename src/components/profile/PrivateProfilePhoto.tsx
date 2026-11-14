"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

type Props = { uid?: string | null; name: string; size?: number };

export default function PrivateProfilePhoto({ uid, name, size = 48 }: Props) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    async function load() {
      const user = auth.currentUser;
      if (!uid || !user) { setSrc(""); return; }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/profile-photo?uid=" + encodeURIComponent(uid), {
          headers: { Authorization: "Bearer " + token }, cache: "no-store",
        });
        if (!response.ok) { if (active) setSrc(""); return; }
        objectUrl = URL.createObjectURL(await response.blob());
        if (active) setSrc(objectUrl);
      } catch {
        if (active) setSrc("");
      }
    }
    void load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uid]);

  return (
    <div aria-label={name} className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A6A1] font-black text-white"
      style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.32)) }}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (name.trim().charAt(0).toUpperCase() || "•")}
    </div>
  );
}