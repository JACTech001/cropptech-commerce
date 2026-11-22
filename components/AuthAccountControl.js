"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound, LogOut } from "lucide-react";
import { authClient } from "../lib/auth/client";

export default function AuthAccountControl() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    authClient.getSession()
      .then(({ data }) => {
        if (active) setUser(data?.user || null);
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
    try {
      await authClient.signOut();
      setUser(null);
      window.location.assign("/");
    } catch {
      setSigningOut(false);
    }
  }

  if (!loaded) return <span className="auth-account-placeholder" aria-hidden="true" />;
  if (!user) {
    return <Link href="/auth/sign-in" className="auth-account-link"><UserRound size={17} strokeWidth={1.7} /><span>SIGN IN</span></Link>;
  }

  return (
    <div className="auth-account-control">
      <span className="auth-account-name" title={user.email}>{user.name || "MY ACCOUNT"}</span>
      <button type="button" className="auth-account-signout" onClick={signOut} disabled={signingOut} aria-label="Sign out">
        <LogOut size={16} /><span>{signingOut ? "..." : "SIGN OUT"}</span>
      </button>
    </div>
  );
}
