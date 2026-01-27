"use client";

import { useAuth } from "../../lib/context/AuthContext";


export default function AuthButton() {
  const {
    user,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
  } = useAuth();

  if (user) {
    return (
      <button
        onClick={logout}
        className="mt-3 py-2 rounded-xl border border-red-400/40 text-sm"
      >
        🚪 Logout
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={loginWithGoogle}
        className="w-full py-2 rounded-xl border border-cyan-400/40 text-sm"
      >
        🔐 Login with Google
      </button>

      <button
        onClick={() =>
          signupWithEmail("test@email.com", "123456")
        }
        className="w-full py-2 rounded-xl border border-emerald-400/40 text-sm"
      >
        ✉️ Email Signup (test)
      </button>
    </div>
  );
}
