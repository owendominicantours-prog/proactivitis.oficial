"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

const read = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

const revalidateHonorPages = () => {
  revalidatePath("/admin/honor-clients");
  revalidatePath("/cliente-de-honor");
  revalidatePath("/en/cliente-de-honor");
  revalidatePath("/fr/cliente-de-honor");
};

export async function createHonorClientAction(formData: FormData) {
  await requireAdmin();

  const fullName = read(formData, "fullName");
  const vipTitle = read(formData, "vipTitle");
  const message = read(formData, "message");
  const vipTitleEs = read(formData, "vipTitleEs");
  const vipTitleEn = read(formData, "vipTitleEn");
  const vipTitleFr = read(formData, "vipTitleFr");
  const messageEs = read(formData, "messageEs");
  const messageEn = read(formData, "messageEn");
  const messageFr = read(formData, "messageFr");
  const photoUrl = read(formData, "photoUrl");
  const isActive = read(formData, "isActive") === "on";

  if (!fullName || !vipTitle || !message) {
    throw new Error("Nombre, titulo VIP y mensaje son obligatorios.");
  }

  await prisma.honorClient.create({
    data: {
      fullName,
      vipTitle,
      message,
      vipTitleEs: vipTitleEs || null,
      vipTitleEn: vipTitleEn || null,
      vipTitleFr: vipTitleFr || null,
      messageEs: messageEs || null,
      messageEn: messageEn || null,
      messageFr: messageFr || null,
      photoUrl: photoUrl || null,
      isActive
    }
  });

  revalidateHonorPages();
}

export async function updateHonorClientAction(formData: FormData) {
  await requireAdmin();

  const id = read(formData, "id");
  const fullName = read(formData, "fullName");
  const vipTitle = read(formData, "vipTitle");
  const message = read(formData, "message");
  const vipTitleEs = read(formData, "vipTitleEs");
  const vipTitleEn = read(formData, "vipTitleEn");
  const vipTitleFr = read(formData, "vipTitleFr");
  const messageEs = read(formData, "messageEs");
  const messageEn = read(formData, "messageEn");
  const messageFr = read(formData, "messageFr");
  const photoUrl = read(formData, "photoUrl");
  const isActive = read(formData, "isActive") === "on";

  if (!id) {
    throw new Error("Cliente invalido.");
  }
  if (!fullName || !vipTitle || !message) {
    throw new Error("Nombre, titulo VIP y mensaje son obligatorios.");
  }

  await prisma.honorClient.update({
    where: { id },
    data: {
      fullName,
      vipTitle,
      message,
      vipTitleEs: vipTitleEs || null,
      vipTitleEn: vipTitleEn || null,
      vipTitleFr: vipTitleFr || null,
      messageEs: messageEs || null,
      messageEn: messageEn || null,
      messageFr: messageFr || null,
      photoUrl: photoUrl || null,
      isActive
    }
  });

  revalidateHonorPages();
}

export async function toggleHonorClientAction(formData: FormData) {
  await requireAdmin();

  const id = read(formData, "id");
  const nextActive = read(formData, "nextActive") === "true";

  if (!id) {
    throw new Error("Cliente invalido.");
  }

  await prisma.honorClient.update({
    where: { id },
    data: { isActive: nextActive }
  });

  revalidateHonorPages();
}

export async function deleteHonorClientAction(formData: FormData) {
  await requireAdmin();

  const id = read(formData, "id");
  if (!id) {
    throw new Error("Cliente invalido.");
  }

  await prisma.honorClient.delete({
    where: { id }
  });

  revalidateHonorPages();
}
