import {
  auth,
} from "@/lib/firebase";

import type {
  ClientGender,
  MembershipDuration,
  PaymentMethod,
} from "@/lib/createClientForTrainer";


export type MembershipPayment = {
  id: string;

  amount: number | null;

  method:
    PaymentMethod | null;

  status: string | null;

  durationMonths:
    MembershipDuration | null;

  periodFrom:
    string | null;

  periodUntil:
    string | null;

  paidAt:
    string | null;

  note: string;

  recordedBy:
    string | null;

  recordedByRole:
    "gym_owner" |
    "gym_staff" |
    null;

  recordedByName:
    string | null;
};


export type MembershipMember = {
  uid: string;

  name:
    string | null;

  displayName:
    string | null;

  email:
    string | null;

  phone:
    string | null;

  gender:
    ClientGender | null;

  note:
    string;

  trainerId:
    string | null;

trainerName: string | null;

  membershipState:
    string | null;

  membershipStatus:
    string | null;

  membershipAmount:
    number | null;

  membershipDurationMonths:
    number | null;

  membershipValidFrom:
    string | null;

  membershipValidUntil:
    string | null;
};


export type GetMembershipPaymentsResult = {
  member:
    MembershipMember;

  payments:
    MembershipPayment[];
};


export async function getMembershipPayments(
  memberId: string
): Promise<GetMembershipPaymentsResult> {
  const currentUser =
    auth.currentUser;


  if (!currentUser) {
    throw new Error(
      "Moraš biti prijavljen."
    );
  }


  const cleanMemberId =
    memberId.trim();


  if (!cleanMemberId) {
    throw new Error(
      "Član nije odabran."
    );
  }


  const token =
    await currentUser
      .getIdToken();


  const response =
    await fetch(
      `/api/gym/members/${encodeURIComponent(
        cleanMemberId
      )}/payments`,
      {
        method:
          "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        cache:
          "no-store",
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
      "Povijest uplata trenutno nije moguće učitati."
    );
  }


  if (
    !result?.member ||
    !Array.isArray(
      result?.payments
    )
  ) {
    throw new Error(
      "Server nije vratio podatke člana."
    );
  }


  return result as
    GetMembershipPaymentsResult;
}