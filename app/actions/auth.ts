"use server";

// Auth server actions. Buyer and seller flow through the SAME actions — the
// role is a required argument, so /login/seller and /login/buyer are just two
// UI surfaces onto the same primitive. That keeps the accounts genuinely
// separate (a seller can't sign in on the buyer page and get buyer routes)
// while avoiding duplicated logic.

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: string };

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

export async function registerUser(input: { email: string; password: string; role: Role }): Promise<Result> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email." };
  if (input.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: { email, passwordHash: hashPassword(input.password), role: input.role },
  });
  await createSession(user.id, user.role);
  return { ok: true };
}

export async function loginUser(input: { email: string; password: string; role: Role }): Promise<Result> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });
  // Generic message: don't leak whether the email exists.
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }
  if (user.role !== input.role) {
    return { ok: false, error: `This account is a ${user.role.toLowerCase()}. Use the ${user.role.toLowerCase()} login page.` };
  }
  await createSession(user.id, user.role);
  return { ok: true };
}

export async function logout() {
  await destroySession();
  redirect("/");
}
