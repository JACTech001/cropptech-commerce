"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound, LogOut } from "lucide-react";
import { authClient } from "../lib/auth/client";

export default function AuthAccountControl() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    let active = true;
    authClient.getSession()
      .then(async ({ data }) => {
        const authUser = data?.user || null;
        if (!authUser) {
          if (active) setUser(null);
          return;
        }

        try {
          const response = await fetch("/api/account/me", { cache: "no-store" });
          if (response.ok) {
            const profile = await response.json();
            if (active) {
              setUser({
                ...authUser,
                name: profile.user?.fullName || authUser.name,
                email: profile.user?.email || authUser.email,
              });
            }
            return;
          }
        } catch {
          // Keep the authenticated identity visible; protected server actions still enforce access.
        }

        if (active) setUser(authUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, []);

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const result = await authClient.signOut();
      if (result?.error) throw new Error(result.error.message || "Sign out failed.");
      setUser(null);
      window.location.assign("/");
    } catch {
      setSignOutError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  if (!loaded) return <span className="auth-account-placeholder" aria-hidden="true" />;
  if (!user) {
    return <Link href="/auth/sign-in" className="auth-account-link"><UserRound size={17} strokeWidth={1.7} /><span>ACCOUNT</span></Link>;
  }

  return (
    <div className="auth-account-control">
      <span className="auth-account-name" title={user.email}>{user.name || "MY ACCOUNT"}</span>
      {signOutError && <span className="auth-account-error" role="alert">{signOutError}</span>}
      <button type="button" className="auth-account-signout" onClick={signOut} disabled={signingOut} aria-label="Sign out">
        <LogOut size={16} /><span>{signingOut ? "..." : "SIGN OUT"}</span>
      </button>
    </div>
  );
}
