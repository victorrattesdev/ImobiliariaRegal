import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  WEEK_SECONDS,
  createSessionToken,
  readSessionToken,
  type SessionUser,
} from "@/lib/session";

export {
  COOKIE_NAME,
  checkLoginRateLimit,
  createSessionToken,
  forbidden,
  getClientIp,
  readSessionToken,
  unauthorized,
  type SessionUser,
} from "@/lib/session";

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
