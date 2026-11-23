"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

export default function AuthAccountControl() {
  return (
    <Link href="/account" className="auth-account-link" aria-label="Open your account" title="My account">
      <UserRound size={17} strokeWidth={1.7} />
      <span>ACCOUNT</span>
    </Link>
  );
}
