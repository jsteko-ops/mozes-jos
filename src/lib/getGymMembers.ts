import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";


export async function getGymMembers(
  gymId: string
) {


  const membersSnap = await getDocs(
    collection(
      db,
      "gymMembers",
      gymId,
      "members"
    )
  );


  console.log(
    "GYM ID:",
    gymId
  );


  console.log(
    "MEMBERS:",
    membersSnap.docs.map((m) => ({
      id: m.id,
      data: m.data(),
    }))
  );



  const members = [];



  for (const member of membersSnap.docs) {


    const memberData = member.data();



    // CLIENT
    if (memberData.role === "client") {


      const clientSnap = await getDoc(
        doc(
          db,
          "clients",
          member.id
        )
      );



      console.log(
        "CLIENT SEARCH:",
        member.id,
        clientSnap.exists()
      );



      if (clientSnap.exists()) {


        members.push({

          ...clientSnap.data(),

      uid: clientSnap.id,

          gymRole: "client",

        });


        continue;

      }

    }



    // TRAINER / OWNER

    const userSnap = await getDoc(
      doc(
        db,
        "users",
        member.id
      )
    );



    if (userSnap.exists()) {


      members.push({

        uid: member.id,

        ...userSnap.data(),

        gymRole: memberData.role,

      });


    }


  }



  console.log(
    "FINAL MEMBERS:",
    members
  );



  return members;

}