import {
  auth,
} from "@/lib/firebase";


export type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer";


export type MembershipDuration =
  | 1
  | 3
  | 6
  | 12;


export type CreateClientData = {
  name: string;

  email?: string;

  password?: string;

  phone?: string;

  goal?: string;

  note?: string;

  gender: ClientGender;

  trainerId?: string | null;

  hasInitialPayment?: boolean;

  membershipStart?: string;

  membershipDuration?:
    MembershipDuration;

  amount?: number | string;

  paymentMethod?:
    PaymentMethod;
};


export type CreatedClient = {
  uid: string;

  authUid:
    string | null;

  name: string;

  email:
    string | null;

  phone:
    string | null;

  gender:
    ClientGender;

  gymId:
    string | null;

  trainerId:
    string | null;

  membershipState:
    string;

  membershipValidFrom:
    string | null;

  membershipValidUntil:
    string | null;

  membershipAmount:
    number | null;

  membershipDurationMonths:
    number | null;
};


export type CreateClientResult = {
  ok: true;

  client:
    CreatedClient;

  payment:
    {
      id: string;

      amount:
        number;

      method:
        PaymentMethod;
    } | null;

  accountCreated:
    boolean;
};


export async function createClient(
  data: CreateClientData
): Promise<CreateClientResult> {
  const currentUser =
    auth.currentUser;


  if (!currentUser) {
    throw new Error(
      "Moraš biti prijavljen."
    );
  }


  const name =
    data.name.trim();


  const email =
    data.email?.trim() ??
    "";


  const phone =
    data.phone?.trim() ??
    "";


  const goal =
    data.goal?.trim() ??
    "";


  const note =
    data.note?.trim() ??
    "";


  const trainerId =
    data.trainerId?.trim() ??
    "";


  if (!name) {
    throw new Error(
      "Upiši ime i prezime člana."
    );
  }


  const token =
    await currentUser
      .getIdToken();


  const response =
    await fetch(
      "/api/clients",
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
          JSON.stringify(
            {
              name,

              email,

              password:
                data.password ??
                "",

              phone,

              goal,

              note,

              gender:
                data.gender,

              trainerId,

              hasInitialPayment:
                data.hasInitialPayment ===
                true,

              membershipStart:
                data.membershipStart ??
                "",

              membershipDuration:
                data.membershipDuration ??
                null,

              amount:
                data.amount ??
                null,

              paymentMethod:
                data.paymentMethod ??
                null,
            }
          ),
      }
    );


  const result =
    await response
      .json()
      .catch(
        () => null
      );


  if (!response.ok) {
    throw new Error(
      result?.error ||
        "Člana nije moguće stvoriti."
    );
  }


  if (
    !result?.client?.uid
  ) {
    throw new Error(
      "Server nije vratio podatke novog člana."
    );
  }


  return result as
    CreateClientResult;
}


/*
 * Kompatibilnost sa starim
 * dijelovima aplikacije.
 *
 * Stari pozivi mogu nastaviti
 * koristiti createClientForTrainer()
 * bez promjene.
 */

type LegacyCreateClientData = {
  name: string;

  email: string;

  password: string;

  goal: string;

  gender:
    ClientGender;
};


export async function createClientForTrainer(
  data: LegacyCreateClientData
) {
  const result =
    await createClient(
      {
        name:
          data.name,

        email:
          data.email,

        password:
          data.password,

        goal:
          data.goal,

        gender:
          data.gender,

        hasInitialPayment:
          false,
      }
    );


  return result.client.uid;
}