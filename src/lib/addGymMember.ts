import {
  auth,
} from "@/lib/firebase";


type MemberRole =
  | "trainer"
  | "client";


type AddGymMemberData = {

  gymId: string;

  email: string;

  role: MemberRole;

  addedBy: string;

};


export async function addGymMember({

  email,

  role,

}: AddGymMemberData) {


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
      "/api/gym/members",
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
            email:
              email.trim(),

            role,
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
      "Člana nije moguće dodati."
    );

  }


  return data.member;

}