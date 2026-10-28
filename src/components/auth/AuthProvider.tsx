"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/types/appUser";

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopProfile: (() => void) | undefined;
    let generation = 0;

    const stopAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        generation++;
        const currentGeneration = generation;

        stopProfile?.();
        stopProfile = undefined;

        setUser(firebaseUser);
        setUserProfile(null);

        if (!firebaseUser) {
          setLoading(false);
          return;
        }

        setLoading(true);

        stopProfile = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snapshot) => {
            if (currentGeneration !== generation) return;

            setUserProfile(
              snapshot.exists()
                ? (snapshot.data() as AppUser)
                : null
            );

            setLoading(false);
          },
          (error) => {
            if (currentGeneration !== generation) return;

            console.error("Profile error:", error);
            setUserProfile(null);
            setLoading(false);
          }
        );
      },
      (error) => {
        console.error("Auth error:", error);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    );

    return () => {
      generation++;
      stopProfile?.();
      stopAuth();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);