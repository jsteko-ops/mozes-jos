import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "mozes-jos",
      clientEmail:
        "firebase-adminsdk-fbsvc@mozes-jos.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore();