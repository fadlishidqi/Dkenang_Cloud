import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth/token";

export async function createAdminSession(username: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await signSessionToken({ username, role: "admin" }, expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
