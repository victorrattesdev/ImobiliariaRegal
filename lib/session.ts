import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "regal_session";
export const WEEK_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET é obrigatório em produção");
    }
    return new TextEncoder().encode("dev-only-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${WEEK_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const user = payload.user as SessionUser | undefined;
    if (!user?.id) return null;
    return user;
  } catch {
    return null;
  }
}

export function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function unauthorized(message = "Não autorizado. Faça login.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Acesso restrito a administradores.") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(
  ip: string,
  limit = 10,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  if (entry.count >= limit) {
    return { ok: false as const, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { ok: true as const };
}
