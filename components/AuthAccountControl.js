"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

export default function AuthAccountControl({ firstName }) {
  return (
    <Link href="/account" className="auth-account-link" aria-label="Open your account" title="My account">
      <span className="mobile-customer-greeting">{firstName ? "Hi, " + firstName : "Hi there"}</span>
      <UserRound size={17} strokeWidth={1.7} />
      <span className="auth-account-label">ACCOUNT</span>
    </Link>
  );
}
