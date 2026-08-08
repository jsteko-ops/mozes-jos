"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  db,
} from "@/lib/firebase";


export default function NaplataPage() {
  const {
    user,
  } = useAuth();


  const [
    premium,
    setPremium,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    activatedAt,
    setActivatedAt,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    async function loadSubscription() {
      if (!user) {
        return;
      }

      try {
        setLoading(true);

        const snap =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );

        if (snap.exists()) {
          const data =
            snap.data();

          setPremium(
            data.isPremium === true
          );

          setStatus(
            data.subscriptionStatus || ""
          );

          if (data.premiumActivatedAt) {
            const date =
              data.premiumActivatedAt.toDate
                ? data.premiumActivatedAt.toDate()
                : new Date(
                    data.premiumActivatedAt
                  );

            setActivatedAt(
              date.toLocaleDateString(
                "hr-HR"
              )
            );
          } else {
            setActivatedAt("");
          }
        }
      } catch (error) {
        console.error(
          "Greška kod učitavanja pretplate:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user]);


  async function startCheckout() {
    if (!user) {
      alert(
        "Nema prijavljenog korisnika"
      );

      return;
    }

    try {
      const token =
        await user.getIdToken();

      const res =
        await fetch(
          "/api/stripe/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                plan: "pro",
              }),
          }
        );

      const data =
        await res.json();

      if (!res.ok || data.error) {
        alert(
          data.error ||
            "Checkout nije moguće pokrenuti."
        );

        return;
      }

      if (data.url) {
        window.location.href =
          data.url;
      }
    } catch (error) {
      console.error(
        "Checkout greška:",
        error
      );

      alert(
        "Checkout nije moguće pokrenuti."
      );
    }
  }


  async function openPortal() {
    if (!user) {
      alert(
        "Nema prijavljenog korisnika"
      );

      return;
    }

    try {
      const token =
        await user.getIdToken();

      const res =
        await fetch(
          "/api/stripe/portal",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok || data.error) {
        alert(
          data.error ||
            "Portal pretplate nije moguće otvoriti."
        );

        return;
      }

      if (data.url) {
        window.location.href =
          data.url;
      }
    } catch (error) {
      console.error(
        "Portal greška:",
        error
      );

      alert(
        "Portal pretplate nije moguće otvoriti."
      );
    }
  }


  return (
    <RoleGuard
      allowedRoles={[
        "trainer",
      ]}
    >
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">
          💳 Naplata
        </h1>

        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold">
            Možeš Još Pro
          </h2>

          <p className="mt-2 text-gray-600">
            Profesionalni alati za trenere.
          </p>

          {loading ? (
            <p className="mt-5">
              Učitavanje...
            </p>
          ) : premium ? (
            <div className="mt-6 space-y-3">
              <p className="text-green-600 font-bold text-lg">
                ✅ Aktivna pretplata
              </p>

              <p>
                Status:
                <span className="font-bold ml-2">
                  {status}
                </span>
              </p>

              {activatedAt && (
                <p>
                  Aktivirano:
                  <span className="font-bold ml-2">
                    {activatedAt}
                  </span>
                </p>
              )}

              <div className="mt-5 rounded-lg bg-gray-100 p-4">
                <p className="font-semibold">
                  Vaš Pro račun je aktivan.
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Možete koristiti sve dostupne Pro funkcije.
                </p>
              </div>

              <button
                type="button"
                className="mt-5 bg-gray-900 text-white px-6 py-3 rounded-lg"
                onClick={openPortal}
              >
                ⚙️ Upravljaj pretplatom
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <p>
                Trenutno nemate aktivnu pretplatu.
              </p>

              <button
                type="button"
                className="mt-5 bg-black text-white px-6 py-3 rounded-lg"
                onClick={startCheckout}
              >
                Aktiviraj Pro plan
              </button>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}