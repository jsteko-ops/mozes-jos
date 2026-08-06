"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useParams,
} from "next/navigation";

import {
  db,
} from "@/lib/firebase";

import {
  useAuth,
} from "@/components/auth/AuthProvider";

import ClientTabs from "@/components/clients/ClientTabs";

import Card from "@/components/ui/Card";


type Client = {
  id: string;
  name: string;
  email?: string;
  goal?: string;
  trainerId?: string;
};


export default function ClientProfilePage() {

  const {
    user,
    loading:
      authLoading,
  } = useAuth();


  const params =
    useParams();


  const clientId =
    typeof params.id ===
      "string"
      ? params.id
      : "";


  const [
    client,
    setClient,
  ] = useState<
    Client | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const fetchClient =
    useCallback(
      async () => {

        if (
          !user ||
          !clientId
        ) {

          setLoading(
            false
          );

          return;

        }


        setLoading(
          true
        );

        setErrorMessage(
          ""
        );


        try {

          const clientReference =
            doc(
              db,
              "clients",
              clientId
            );


          const clientSnapshot =
            await getDoc(
              clientReference
            );


          if (
            !clientSnapshot.exists()
          ) {

            setClient(
              null
            );

            setErrorMessage(
              "Klijent ne postoji."
            );

            return;

          }


          const data =
            clientSnapshot.data();


          if (
            data.trainerId !==
            user.uid
          ) {

            setClient(
              null
            );

            setErrorMessage(
              "Nemaš pristup ovom klijentu."
            );

            return;

          }


          setClient({
            id:
              clientSnapshot.id,

            name:
              typeof data.name ===
                "string"
                ? data.name
                : "Klijent",

            email:
              typeof data.email ===
                "string"
                ? data.email
                : "",

            goal:
              typeof data.goal ===
                "string"
                ? data.goal
                : "",

            trainerId:
              typeof data.trainerId ===
                "string"
                ? data.trainerId
                : "",
          });

        } catch (
          error
        ) {

          console.error(
            "Greška kod učitavanja klijenta:",
            error
          );


          setClient(
            null
          );

          setErrorMessage(
            "Klijenta trenutačno nije moguće učitati."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        clientId,
        user,
      ]
    );


  useEffect(() => {

    if (
      !authLoading
    ) {

      void fetchClient();

    }

  }, [
    authLoading,
    fetchClient,
  ]);


  if (
    authLoading ||
    loading
  ) {

    return (

      <div className="p-6">

        Učitavanje klijenta...

      </div>

    );

  }


  if (
    errorMessage ||
    !client
  ) {

    return (

      <Card>

        <p className="font-semibold text-red-700">

          {errorMessage ||
            "Klijent ne postoji."}

        </p>

      </Card>

    );

  }


  return (

    <div className="space-y-6">


      <Card>


        <div className="space-y-2">


          <h1 className="text-2xl font-bold">

            {client.name}

          </h1>


          <p className="text-gray-600">

            {client.email ||
              "E-mail nije dodan"}

          </p>


          <p className="text-sm text-gray-500">

            Cilj:{" "}

            {client.goal ||
              "Nije postavljen"}

          </p>


        </div>


      </Card>


      <ClientTabs
        client={
          client
        }
      />


    </div>

  );

}