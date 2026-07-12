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


  const members = [];


  for (const member of membersSnap.docs) {

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
        gymRole: member.data().role,
      });

    }

  }


  return members;
}