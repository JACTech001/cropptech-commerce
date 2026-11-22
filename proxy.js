import { auth } from "./lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
  publicRoutes: [
    "/",
    "/about",
    "/shop",
    "/cart",
    "/contact",
    "/delivery-returns",
    "/faq",
    "/privacy",
    "/terms",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/api/account/me",
  ],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
