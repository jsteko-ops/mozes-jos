"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { AppUser } from "@/types/appUser";

type AuthContextType = {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [userProfile, setUserProfile] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const ref = doc(
              db,
              "users",
              firebaseUser.uid
            );

            const snapshot = await getDoc(ref);

            if (snapshot.exists()) {
              const data =
                snapshot.data() as AppUser;

              setUserProfile(data);

              console.log(
                "USER PROFILE:",
                JSON.stringify(data, null, 2)
              );
            } else {
              console.warn(
                "User document ne postoji"
              );

              setUserProfile(null);
            }
          } catch (error) {
            console.error(
              "Greška kod učitavanja user profila:",
              error
            );

            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);