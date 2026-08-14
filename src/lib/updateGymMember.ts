import {
  auth,
} from "@/lib/firebase";

import type {
  ClientGender,
} from "@/lib/createClientForTrainer";


export type UpdateGymMemberData = {
  memberId: string;

  name: string;

  email: string;

  phone: string;

  gender: ClientGender;

  note: string;

  trainerId:
    string | null;
};


export type UpdateGymMemberResult = {
  ok: true;

  member: {
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

    trainerId:
      string | null;

    note: string;
  };
};


export async function updateGymMember(
  data: UpdateGymMemberData
): Promise<UpdateGymMemberResult> {
  const currentUser =
    auth.currentUser;


  if (!currentUser) {
    throw new Error(
      "Moraš biti prijavljen."
    );
  }


  const memberId =
    data.memberId.trim();


  const name =
    data.name.trim();


  const email =
    data.email
      .trim()
      .toLowerCase();


  const phone =
    data.phone.trim();


  const note =
    data.note.trim();


  const trainerId =
    data.trainerId?.trim() ||
    null;


  if (!memberId) {
    throw new Error(
      "Član nije odabran."
    );
  }


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
      `/api/gym/members/${encodeURIComponent(
        memberId
      )}`,
      {
        method:
          "PATCH",

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

              phone,

              gender:
                data.gender,

              note,

              trainerId,
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
      "Podatke člana trenutno nije moguće spremiti."
    );
  }


  if (
    !result?.ok ||
    !result?.member
  ) {
    throw new Error(
      "Server nije vratio ažurirane podatke člana."
    );
  }


  return result as
    UpdateGymMemberResult;
}