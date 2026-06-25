import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQLW5zQ8KBM9C6wfjD67li9kWt9Q834A",
  authDomain: "mozes-jos.firebaseapp.com",
  projectId: "mozes-jos",
  storageBucket: "mozes-jos.firebasestorage.app",
  messagingSenderId: "38170886413",
  appId: "1:38170886413:web:e52dfb8c2bf75014df7044",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔥 AUTO LOGIN (pamti usera u browseru)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence enabled");
  })
  .catch((error) => {
    console.log("Persistence error:", error);
  });