import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQLW5zqQ8KBM9C6wfjD67li9kWt9Q834A",
  authDomain: "mozes-jos.firebaseapp.com",
  projectId: "mozes-jos",
  storageBucket: "mozes-jos.firebasestorage.app",
  messagingSenderId: "38170886413",
  appId: "1:38170886413:web:2718709006730736df7044"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);