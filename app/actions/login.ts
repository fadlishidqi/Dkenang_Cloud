"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createAdminSession, destroySession, getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function logActivity(username: string, action: string, target: string) {
  await prisma.auditLog.create({
    data: {
      username,
      action,
      target,
    },
  });
}

export type LoginState = {
  error?: string;
};

type EnvUser = {
  username: string;
  password?: string;
  passwordHash?: string;
};

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function verifyPassword(password: string, user: EnvUser) {
  if (user.passwordHash) {
    if (isBcryptHash(user.passwordHash)) {
      return bcrypt.compare(password, user.passwordHash);
    }

    return false;
  }

  return user.password ? password === user.password : false;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  
  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const usersJson = process.env.USERS_JSON;
  let users: EnvUser[] = [];
  
  if (usersJson) {
    try {
      users = JSON.parse(usersJson);
    } catch (e) {
      console.error("Failed to parse USERS_JSON", e);
      return { error: "Format konfigurasi USERS_JSON di .env salah (JSON tidak valid)." };
    }
  }
  
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminUsername && adminPasswordHash) {
    // Only add if not already in users list to avoid duplicates
    if (!users.find((u) => u.username === adminUsername)) {
      users.push({ username: adminUsername, passwordHash: adminPasswordHash });
    }
  }

  if (users.length === 0) {
    return { error: "Konfigurasi pengguna tidak ditemukan di .env (USERS_JSON kosong)." };
  }

  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return { error: `User "${username}" tidak terdaftar di sistem.` };
  }

  const isPasswordValid = await verifyPassword(password, user);
  
  if (!isPasswordValid) {
    return { error: "Password yang Anda masukkan salah." };
  }

  await createAdminSession(user.username);
  await logActivity(user.username, "Login", "Dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  const session = await getSession();
  if (session?.username) {
    await logActivity(session.username, "Logout", "Sistem");
  }
  await destroySession();
  redirect("/login");
}
