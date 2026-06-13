import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export const SESSION_COOKIE_NAME = "dkenang_session";
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export type SessionPayload = JWTPayload & {
  username: string;
  role: "admin";
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSessionSecret());
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (payload.role !== "admin" || !payload.username) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
