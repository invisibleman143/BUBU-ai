"use client";

import { doc, setDoc } from "firebase/firestore";
import { db, auth, googleProvider } from "../firebase";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Process Google redirect sign-in result (for mobile/Android)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && db) {
          const userRef = doc(db, "users", result.user.uid);
          setDoc(
            userRef,
            {
              uid: result.user.uid,
              email: result.user.email,
              createdAt: Date.now(),
            },
            { merge: true }
          );
        }
      })
      .catch((err) => {
        console.error("Error processing Google redirect login:", err);
      });

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && db) {
        const userRef = doc(db, "users", u.uid);
        setDoc(
          userRef,
          {
            uid: u.uid,
            email: u.email,
            createdAt: Date.now(),
          },
          { merge: true }
        );
      }

      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      alert("Firebase is not configured yet. Please add your credentials to .env.local");
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );

    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user" || isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
      alert("Firebase is not configured yet. Please add your credentials to .env.local");
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email: string, password: string) => {
    if (!auth) {
      alert("Firebase is not configured yet. Please add your credentials to .env.local");
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        isConfigured: Boolean(auth),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

