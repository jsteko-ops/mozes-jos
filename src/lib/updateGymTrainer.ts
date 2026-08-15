import {
  auth,
} from "@/lib/firebase";


export type UpdateGymTrainerData = {
  trainerId: string;

  name: string;

  email: string;

  phone: string;
};


export type UpdateGymTrainerResult = {
  ok: true;

  trainer: {
    uid: string;

    name: string;

    email: string;

    phone:
      string | null;

    gymId: string;

    role:
      "trainer";
  };
};


export async function updateGymTrainer(
  data: UpdateGymTrainerData
): Promise<UpdateGymTrainerResult> {
  const currentUser =
    auth.currentUser;


  if (!currentUser) {
    throw new Error(
      "Moraš biti prijavljen."
    );
  }


  const trainerId =
    data.trainerId.trim();

  const name =
    data.name.trim();

  const email =
    data.email
      .trim()
      .toLowerCase();

  const phone =
    data.phone.trim();


  if (!trainerId) {
    throw new Error(
      "Trener nije odabran."
    );
  }


  if (!name) {
    throw new Error(
      "Upiši ime i prezime trenera."
    );
  }


  if (!email) {
    throw new Error(
      "Upiši e-mail adresu trenera."
    );
  }


  const token =
    await currentUser
      .getIdToken();


  const response =
    await fetch(
      `/api/gym/trainers/${encodeURIComponent(
        trainerId
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
        "Podatke trenera trenutno nije moguće spremiti."
    );
  }


  if (
    !result?.ok ||
    !result?.trainer
  ) {
    throw new Error(
      "Server nije vratio ažurirane podatke trenera."
    );
  }


  return result as
    UpdateGymTrainerResult;
}