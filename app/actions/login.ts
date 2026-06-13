"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createAdminSession, destroySession } from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    return { error: "Konfigurasi admin belum lengkap." };
  }

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const isValidUsername = username === adminUsername;
  const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

  if (!isValidUsername || !isValidPassword) {
    return { error: "Username atau password salah." };
  }

  await createAdminSession(username);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
