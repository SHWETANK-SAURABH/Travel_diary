"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateDestination, adminUpdateDestination, adminSetDestinationStatus, adminVerifyDestinationBestTime, type DestinationWriteInput } from "@/features/destinations/admin-service";
import { adminCreateMedia, adminDeleteMedia, type MediaWriteInput } from "@/features/media/admin-service";
import { destinationFormSchema, updateDestinationFormSchema, mediaFormSchema, contentStatusSchema, idSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createDestinationAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = destinationFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const session = await auth();
    const destination = await adminCreateDestination(session, parsed.data as DestinationWriteInput);
    revalidatePath("/admin/destinations");
    return { ok: true, data: { id: destination.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateDestinationAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateDestinationFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const session = await auth();
    const destination = await adminUpdateDestination(session, id, parsed.data as Partial<DestinationWriteInput>);
    revalidatePath("/admin/destinations");
    revalidatePath(`/admin/destinations/${id}`);
    return { ok: true, data: { id: destination.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setDestinationStatusAction(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(id).success || !contentStatusSchema.safeParse(status).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminSetDestinationStatus(session, id, status);
    revalidatePath("/admin/destinations");
    revalidatePath(`/admin/destinations/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function verifyDestinationBestTimeAction(id: string): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminVerifyDestinationBestTime(session, id);
    revalidatePath(`/admin/destinations/${id}`);
    revalidatePath("/admin/verification");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function addDestinationMediaAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid media" };

  try {
    const session = await auth();
    const media = await adminCreateMedia(session, parsed.data as MediaWriteInput);
    revalidatePath(`/admin/destinations/${media.contentId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteDestinationMediaAction(mediaId: string, destinationId: string): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(mediaId).success || !idSchema.safeParse(destinationId).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminDeleteMedia(session, mediaId);
    revalidatePath(`/admin/destinations/${destinationId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
