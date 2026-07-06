import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// Cookie-based session. Payload is `<userId>.<role>.<hmac>` — the HMAC is what
// makes it non-forgeable. We deliberately avoid an external auth library to
// keep the dependency list minimal; scrypt + HMAC-SHA256 from node:crypto is
// enough for a marketplace demo.

const COOKIE = "kiln_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const got = scryptSync(pw, salt, 64);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export async function createSession(userId: string, role: Role) {
  const payload = `${userId}.${role}`;
  const value = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export type Session = { userId: string; role: Role; email: string };

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userId, role, sig] = parts;
  if (sign(`${userId}.${role}`) !== sig) return null;
  if (role !== "BUYER" && role !== "SELLER") return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
  if (!user || user.role !== role) return null;
  return { userId: user.id, role: user.role, email: user.email };
}
