"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  authConfigured,
  createSessionValue,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/auth";

export async function signIn(_prevState: { error: string } | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password) return { error: "Digite a senha." };
  if (!authConfigured()) return { error: "Login não configurado neste ambiente." };
  if (!(await passwordMatches(password))) return { error: "Senha inválida." };

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
