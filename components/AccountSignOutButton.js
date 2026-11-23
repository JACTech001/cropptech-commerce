"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { authClient } from "../lib/auth/client";

export default function AccountSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result?.error) throw new Error(result.error.message || "Sign out failed.");
      router.replace("/");
    } catch {
      setError("We could not sign you out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="account-signout-wrap">
      <button type="button" className="account-signout-button" onClick={signOut} disabled={busy}>
        {busy ? <LoaderCircle className="auth-spinner" size={15} /> : <LogOut size={15} />}
        {busy ? "SIGNING OUT…" : "SIGN OUT"}
      </button>
      {error && <p className="account-signout-error" role="alert">{error}</p>}
    </div>
  );
}
