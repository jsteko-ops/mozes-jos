"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { addKlijent } from "@/lib/repositories/klijenti.repo";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function NoviKlijentPage() {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 GUARD
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const isPremium = userSnap.exists()
        ? userSnap.data().isPremium
        : false;

      if (isPremium) {
        setAllowed(true);
        return;
      }

      // free user → check limit
      const klijentiSnap = await getDocs(collection(db, "klijenti"));

      if (klijentiSnap.size >= 5) {
        router.push("/dashboard/klijenti");
        return;
      }

      setAllowed(true);
    });

    return () => unsub();
  }, [router]);

  const handleSave = async () => {
    if (!name || !goal) {
      alert("Ime i cilj su obavezni!");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Niste prijavljeni");
      return;
    }

    setLoading(true);

    try {
      await addKlijent({
        name,
        goal,
        email,
        phone,
        userId: user.uid,
      });

      router.push("/dashboard/klijenti");
    } catch (err: any) {
      console.error(err);

      if (err.message === "LIMIT_REACHED") {
        alert(
          "🚫 Dosegnuli ste limit od 5 klijenata na besplatnom planu. Nadogradite na Premium."
        );
      } else {
        alert("Greška pri spremanju klijenta");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) {
    return <p style={{ padding: 20 }}>Provjera pristupa...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>➕ Novi klijent</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
        <input
          placeholder="Ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Cilj"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          placeholder="Email (opcionalno)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Telefon (opcionalno)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button onClick={handleSave} disabled={loading}>
          {loading ? "Spremanje..." : "Spremi klijenta"}
        </button>
      </div>
    </div>
  );
}