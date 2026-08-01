import {
  auth,
} from "@/lib/firebase";


export type ClientGender =
  | "male"
  | "female"
  | "prefer_not_to_say";


type CreateClientData = {

  name: string;

  email: string;

  password: string;

  goal: string;

  gender: ClientGender;

};


export async function createClientForTrainer({

  name,

  email,

  password,

  goal,

  gender,

}: CreateClientData) {


  const currentUser =
    auth.currentUser;


  if (!currentUser) {

    throw new Error(
      "Moraš biti prijavljen."
    );

  }


  const token =
    await currentUser.getIdToken();


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
          JSON.stringify({
            name:
              name.trim(),

            email:
              email.trim(),

            password,

            goal:
              goal.trim(),

            gender,
          }),
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (!response.ok) {

    throw new Error(
      data?.error ||
      "Klijenta nije moguće stvoriti."
    );

  }


  return data.client.uid as string;

}