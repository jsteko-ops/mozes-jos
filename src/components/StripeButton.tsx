"use client";

import {
  useState,
} from "react";

import {
  useAuth,
} from "@/components/auth/AuthProvider";


export default function StripeButton({
  plan,
}: {
  plan: "pro";
}) {
  const {
    user,
  } = useAuth();


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  async function upgrade() {
    if (!user) {
      setError(
        "Moraš biti prijavljen kako bi aktivirao Pro plan."
      );

      return;
    }


    try {
      setLoading(
        true
      );

      setError(
        ""
      );


      /*
       * Backend više ne vjeruje
       * userId-u poslanom iz browsera.
       * Identitet korisnika potvrđuje
       * Firebase ID tokenom.
       */
      const token =
        await user.getIdToken();


      const response =
        await fetch(
          "/api/stripe/checkout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                plan,
              }),
          }
        );


      let data: {
        url?: string;
        error?: string;
      } = {};


      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (
        !response.ok ||
        data.error
      ) {
        setError(
          data.error ||
            "Checkout trenutno nije moguće pokrenuti."
        );

        return;
      }


      if (!data.url) {
        setError(
          "Stripe nije vratio poveznicu za plaćanje."
        );

        return;
      }


      window.location.href =
        data.url;
    } catch (
      checkoutError
    ) {
      console.error(
        "Stripe checkout error:",
        checkoutError
      );


      setError(
        "Checkout trenutno nije moguće pokrenuti."
      );
    } finally {
      setLoading(
        false
      );
    }
  }


  return (
    <div className="space-y-3">

      <button
        type="button"
        onClick={
          upgrade
        }
        disabled={
          loading ||
          !user
        }
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          bg-[#C8D52B]
          px-5
          py-4
          text-sm
          font-black
          text-[#111317]
          transition
          hover:bg-[#D7E33A]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading && (
          <span
            className="
              h-4
              w-4
              animate-spin
              rounded-full
              border-2
              border-[#111317]/20
              border-t-[#111317]
            "
          />
        )}


        {loading
          ? "Otvaram sigurnu naplatu..."
          : "Aktiviraj Možeš Još Pro"}
      </button>


      {error && (
        <div
          role="alert"
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              font-semibold
              leading-5
              text-red-700
            "
          >
            {error}
          </p>
        </div>
      )}


      <p
        className="
          text-center
          text-[10px]
          leading-5
          text-white/35
        "
      >
        Plaćanje se nastavlja
        sigurnim Stripe checkoutom.
      </p>

    </div>
  );
}