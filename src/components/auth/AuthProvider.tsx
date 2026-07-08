"use client";

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState 
} from "react";

import { 
  onAuthStateChanged, 
  User 
} from "firebase/auth";

import { 
  doc, 
  getDoc 
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "trainer" | "gymOwner" | "client";
  premium: boolean;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
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
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          const ref = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const snapshot = await getDoc(ref);

          if (snapshot.exists()) {
            setUserProfile(
              snapshot.data() as UserProfile
            );
          } else {
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

export const useAuth = () => useContext(AuthContext);