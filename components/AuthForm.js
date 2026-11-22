"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { authClient } from "../lib/auth/client";

const linenSlides = [
  {
    image: "https://images.pexels.com/photos/32825460/pexels-photo-32825460/free-photo-of-stylish-male-model-in-beige-linen-outfit-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1400",
    title: "Everyday linen,",
    accent: "effortlessly worn.",
    label: "THE MEN'S EDIT",
  },
  {
    image: "https://images.pexels.com/photos/5393448/pexels-photo-5393448.jpeg?auto=compress&cs=tinysrgb&w=1400",
    title: "Soft silhouettes,",
    accent: "made to move.",
    label: "THE WOMEN'S EDIT",
  },
  {
    image: "https://images.pexels.com/photos/15923917/pexels-photo-15923917/free-photo-of-linen-clothes-on-clothes-hangers.jpeg?auto=compress&cs=tinysrgb&w=1400",
    title: "A little more",
    accent: "room to breathe.",
    label: "LINEN CO-ORDS",
  },
  {
    image: "https://images.pexels.com/photos/9637778/pexels-photo-9637778.jpeg?auto=compress&cs=tinysrgb&w=1400",
    title: "Comfort in",
    accent: "every detail.",
    label: "THE LINEN COLLECTION",
  },
  {
    image: "https://images.pexels.com/photos/6996128/pexels-photo-6996128.jpeg?auto=compress&cs=tinysrgb&w=1400",
    title: "Find your",
    accent: "everyday style.",
    label: "EASY LINEN DRESSING",
  },
];

function AuthFormContent({ mode }) {
  const searchParams = useSearchParams();
  const requestedRedirectTo = searchParams.get("redirectTo") || "/checkout";
  const token = searchParams.get("token") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % linenSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const isSignUp = mode === "sign-up";
  const isSignIn = mode === "sign-in";
  const isForgot = mode === "forgot-password";
  const isReset = mode === "reset-password";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isReset && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const redirectTarget = new URL(requestedRedirectTo, window.location.origin);
      const safeRedirectTo = redirectTarget.origin === window.location.origin
        ? `${redirectTarget.pathname}${redirectTarget.search}${redirectTarget.hash}`
        : "/checkout";
      let result;
      if (isSignUp) {
        result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: safeRedirectTo,
        });
      } else if (isSignIn) {
        result = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: safeRedirectTo,
        });
      } else if (isForgot) {
        result = await authClient.requestPasswordReset({
          email: email.trim(),
          redirectTo: "/auth/reset-password",
        });
      } else if (isReset) {
        if (!token) {
          setError("This password-reset link is missing its token. Request a new link.");
          return;
        }
        result = await authClient.resetPassword({ newPassword: password, token });
      }

      if (result?.error) {
        setError(result.error.message || "We could not complete that request. Please try again.");
      } else if (isSignIn || isSignUp) {
        const profileResponse = await fetch("/api/account/me", { cache: "no-store" });

        if (profileResponse.status === 401) {
          setMessage("Your account is ready. If email verification is requested, follow the instructions sent to your inbox, then sign in.");
          return;
        }

        const profileResult = await profileResponse.json().catch(() => ({}));
        if (!profileResponse.ok) {
          throw new Error(profileResult.error || "Your sign-in worked, but we could not finish setting up your store account.");
        }

        window.location.assign(safeRedirectTo);
      } else if (isForgot) {
        setMessage("If an account exists for that email, password-reset instructions will be sent.");
      } else if (isReset) {
        setMessage("Your password has been updated. You can now sign in.");
      }
    } catch (requestError) {
      setError(requestError?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = isSignUp ? "Create your account." : isSignIn ? "Welcome back." : isForgot ? "Reset your password." : "Choose a new password.";
  const intro = isSignUp
    ? "Create an account to manage your orders and complete purchases."
    : isSignIn
      ? "Sign in to continue with your CroppTech order."
      : isForgot
        ? "Enter the email address connected to your account and we’ll send reset instructions."
        : "Enter a new password for your CroppTech account.";

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Link href="/" className="auth-back"><ArrowLeft size={15} /> BACK TO STORE</Link>
        <Link href="/" className="auth-wordmark" aria-label="CroppTech Commerce home">
          <Image src="/brand/cropplogotextcommerce-transparent.png" alt="CroppTech Commerce Store" width={210} height={60} priority className="auth-brand-image" />
        </Link>
        <span className="auth-top-spacer" aria-hidden="true" />
      </header>

      <section className={isForgot ? "auth-layout auth-layout-no-carousel" : "auth-layout"}>
        {!isForgot && (
        <div className="auth-editorial auth-carousel" aria-label="CroppTech linen collection">
          <div className="auth-carousel-image-wrap">
            {linenSlides.map((slide, index) => (
              <img
                key={slide.label}
                src={slide.image}
                alt={slide.label.toLowerCase().replaceAll(" ", " ")}
                className={index === activeSlide ? "auth-carousel-image is-active" : "auth-carousel-image"}
                aria-hidden={index !== activeSlide}
              />
            ))}
            <div className="auth-carousel-shade" />
            <div className="auth-carousel-copy" aria-live="polite">
              <p className="eyebrow">{linenSlides[activeSlide].label}</p>
              <h1>{linenSlides[activeSlide].title}<br /><em>{linenSlides[activeSlide].accent}</em></h1>
              <p>Breathable linen pieces for the way you move through every day.</p>
            </div>
            <div className="auth-carousel-controls">
              <span className="auth-carousel-count">{String(activeSlide + 1).padStart(2, "0")} <i /> {String(linenSlides.length).padStart(2, "0")}</span>
              <div className="auth-carousel-buttons">
                <button type="button" aria-label="Previous linen slide" onClick={() => setActiveSlide((activeSlide - 1 + linenSlides.length) % linenSlides.length)}><ChevronLeft size={18} /></button>
                <button type="button" aria-label="Next linen slide" onClick={() => setActiveSlide((activeSlide + 1) % linenSlides.length)}><ChevronRight size={18} /></button>
              </div>
            </div>
            <div className="auth-carousel-dots" aria-label="Choose a slide">
              {linenSlides.map((slide, index) => (
                <button key={slide.label} type="button" aria-label={`Show slide ${index + 1}: ${slide.label}`} aria-current={index === activeSlide ? "true" : undefined} className={index === activeSlide ? "is-active" : ""} onClick={() => setActiveSlide(index)} />
              ))}
            </div>
          </div>
          <span className="auth-editorial-foot">BUSINESS MOVES WITH COMMERCE.</span>
        </div>
        )}

        <div className="auth-panel">
          <p className="eyebrow">{isSignUp ? "NEW CUSTOMER" : isSignIn ? "CUSTOMER SIGN IN" : "ACCOUNT SECURITY"}</p>
          <h2>{isSignUp ? "Create account" : isSignIn ? "Sign in" : isForgot ? "Forgot password" : "New password"}</h2>
          <p className="auth-panel-intro">{intro}</p>

          <form className="auth-form" onSubmit={submit}>
            {isSignUp && (
              <label>FULL NAME
                <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your full name" />
              </label>
            )}
            {!isReset && (
              <label>EMAIL ADDRESS
                <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
              </label>
            )}
            {!isForgot && (
              <label>{isReset ? "NEW PASSWORD" : "PASSWORD"}
                <input type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} placeholder="At least 8 characters" />
              </label>
            )}
            {isReset && (
              <label>CONFIRM NEW PASSWORD
                <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} placeholder="Enter the password again" />
              </label>
            )}

            {isSignIn && <div className="auth-form-meta"><Link href="/auth/forgot-password">FORGOT PASSWORD?</Link></div>}
            {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
            {message && <p className="auth-feedback auth-success" role="status">{message}</p>}

            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? <><LoaderCircle className="auth-spinner" size={16} /> PLEASE WAIT</> : <>{isSignUp ? "CREATE ACCOUNT" : isSignIn ? "SIGN IN" : isForgot ? "SEND RESET INSTRUCTIONS" : "UPDATE PASSWORD"} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-switch">
            {isSignIn && <>New to CroppTech? <Link href="/auth/sign-up">Create an account</Link></>}
            {isSignUp && <>Already have an account? <Link href="/auth/sign-in">Sign in</Link></>}
            {isForgot && <>Remembered your password? <Link href="/auth/sign-in">Sign in</Link></>}
            {isReset && <>Password updated? <Link href="/auth/sign-in">Return to sign in</Link></>}
          </div>
          <p className="auth-legal">By continuing, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
        </div>
      </section>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} CROPPTECH COMMERCE STORE</span></footer>
    </main>
  );
}

export default function AuthForm({ mode }) {
  return <Suspense fallback={<main className="auth-page"><p className="auth-loading">Loading account page…</p></main>}><AuthFormContent mode={mode} /></Suspense>;
}
