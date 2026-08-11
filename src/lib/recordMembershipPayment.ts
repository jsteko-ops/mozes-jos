import {
  auth,
} from "@/lib/firebase";

import type {
  MembershipDuration,
  PaymentMethod,
} from "@/lib/createClientForTrainer";


export type RecordMembershipPaymentData = {
  memberId: string;

  membershipStart: string;

  membershipDuration:
    MembershipDuration;

  amount: number;

  paymentMethod:
    PaymentMethod;

  note?: string;
};


export type RecordMembershipPaymentResult = {
  payment: {
    id: string;

    amount: number;

    method:
      PaymentMethod;

    durationMonths:
      MembershipDuration;

    periodFrom: string;

    periodUntil: string;
  };

  membership: {
    state: "active";

    amount: number;

    validUntil: string;
  };
};


export async function recordMembershipPayment(
  data: RecordMembershipPaymentData
): Promise<RecordMembershipPaymentResult> {
  const currentUser =
    auth.currentUser;


  if (!currentUser) {
    throw new Error(
      "Moraš biti prijavljen."
    );
  }


  const memberId =
    data.memberId.trim();


  if (!memberId) {
    throw new Error(
      "Član nije odabran."
    );
  }


  if (
    !Number.isFinite(
      data.amount
    ) ||
    data.amount <= 0
  ) {
    throw new Error(
      "Upiši ispravan iznos uplate."
    );
  }


  const token =
    await currentUser
      .getIdToken();


  const response =
    await fetch(
      `/api/gym/members/${encodeURIComponent(
        memberId
      )}/payments`,
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
              membershipStart:
                data.membershipStart,

              membershipDuration:
                data.membershipDuration,

              amount:
                data.amount,

              paymentMethod:
                data.paymentMethod,

              note:
                data.note?.trim() ??
                "",
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
        "Uplatu nije moguće evidentirati."
    );
  }


  if (
    !result?.payment?.id ||
    !result?.membership
  ) {
    throw new Error(
      "Server nije vratio podatke uplate."
    );
  }


  return result as
    RecordMembershipPaymentResult;
}