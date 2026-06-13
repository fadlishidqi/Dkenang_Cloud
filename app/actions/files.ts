"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

async function logActivity(action: string, target: string) {
  const session = await getSession();
  if (session?.username) {
    await prisma.auditLog.create({
      data: {
        username: session.username,
        action,
        target,
      },
    });
  }
}
import {
  buildStorageKey,
  createDownloadUrl,
  createUploadUrl,
  deleteObject,
  isR2Configured,
} from "@/lib/r2";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

export type CreateUploadUrlInput = {
  fileName: string;
  contentType: string;
  size: number;
};

export type CreateUploadUrlResult =
  | { ok: true; uploadUrl: string; key: string }
  | { ok: false; error: string };

/** Step 1: hand the browser a presigned URL so it can PUT straight to R2. */
export async function createUploadUrlAction(
  input: CreateUploadUrlInput,
): Promise<CreateUploadUrlResult> {
  await requireAdminSession();

  if (!isR2Configured()) {
    return { ok: false, error: "Penyimpanan R2 belum dikonfigurasi." };
  }

  const fileName = input.fileName?.trim();
  if (!fileName) {
    return { ok: false, error: "Nama file tidak boleh kosong." };
  }

  if (!Number.isFinite(input.size) || input.size < 0) {
    return { ok: false, error: "Ukuran file tidak valid." };
  }

  if (input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Ukuran file melebihi batas 500 MB." };
  }

  const key = buildStorageKey(fileName);

  try {
    const uploadUrl = await createUploadUrl(key, input.contentType);
    return { ok: true, uploadUrl, key };
  } catch (error) {
    console.error("createUploadUrlAction failed", error);
    return { ok: false, error: "Gagal menyiapkan upload. Coba lagi." };
  }
}

export type ConfirmUploadInput = {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
};

/** Step 2: persist metadata after the browser finished uploading to R2. */
export async function confirmUploadAction(
  input: ConfirmUploadInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminSession();

  const fileName = input.fileName?.trim();
  const key = input.key?.trim();

  if (!fileName || !key) {
    return { ok: false, error: "Data upload tidak lengkap." };
  }

  await prisma.file.create({
    data: {
      fileName,
      fileUrl: "",
      storageKey: key,
      mimeType: input.contentType || "application/octet-stream",
      sizeBytes: BigInt(Math.max(0, Math.trunc(input.size))),
    },
  });

  await logActivity("Upload File", fileName);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/files");
  return { ok: true };
}

/** Resolve a short-lived URL to view/download a file (R2 object or legacy URL). */
export async function getFileUrlAction(
  id: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdminSession();

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return { ok: false, error: "File tidak ditemukan." };
  }

  if (file.storageKey) {
    try {
      const url = await createDownloadUrl(file.storageKey, file.fileName);
      return { ok: true, url };
    } catch (error) {
      console.error("getFileUrlAction failed", error);
      return { ok: false, error: "Gagal membuat tautan unduhan." };
    }
  }

  if (file.fileUrl) {
    return { ok: true, url: file.fileUrl };
  }

  return { ok: false, error: "File tidak memiliki tautan." };
}

export async function deleteFileAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return;
  }

  if (file.storageKey) {
    try {
      await deleteObject(file.storageKey);
    } catch (error) {
      console.error("Gagal menghapus object R2", error);
    }
  }

  await prisma.file.delete({ where: { id } });
  await logActivity("Hapus File", file.fileName);
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/files");
}
