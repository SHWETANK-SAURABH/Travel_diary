"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  adminCreateFestival,
  adminUpdateFestival,
  adminSetFestivalStatus,
  adminUpsertFestivalOccurrence,
  adminSetFestivalVerification,
  type FestivalWriteInput,
  type OccurrenceInput,
} from "@/features/festivals/admin-service";
import { adminCreateMedia, adminDeleteMedia, type MediaWriteInput } from "@/features/media/admin-service";
import { festivalFormSchema, updateFestivalFormSchema, festivalOccurrenceSchema, festivalVerificationSchema, mediaFormSchema, contentStatusSchema, idSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createFestivalAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = festivalFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const session = await auth();
    const festival = await adminCreateFestival(session, parsed.data as FestivalWriteInput);
    revalidatePath("/admin/festivals");
    return { ok: true, data: { id: festival.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateFestivalAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateFestivalFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const session = await auth();
    const festival = await adminUpdateFestival(session, id, parsed.data as Partial<FestivalWriteInput>);
    revalidatePath("/admin/festivals");
    revalidatePath(`/admin/festivals/${id}`);
    return { ok: true, data: { id: festival.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setFestivalStatusAction(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(id).success || !contentStatusSchema.safeParse(status).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminSetFestivalStatus(session, id, status);
    revalidatePath("/admin/festivals");
    revalidatePath(`/admin/festivals/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function saveFestivalOccurrenceAction(festivalId: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = festivalOccurrenceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid dates" };

  try {
    const session = await auth();
    await adminUpsertFestivalOccurrence(session, festivalId, parsed.data as OccurrenceInput);
    revalidatePath(`/admin/festivals/${festivalId}`);
    revalidatePath("/admin/verification");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function setFestivalVerificationAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = festivalVerificationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const session = await auth();
    await adminSetFestivalVerification(session, id, parsed.data.verificationStatus, parsed.data.verificationSource);
    revalidatePath(`/admin/festivals/${id}`);
    revalidatePath("/admin/verification");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function addFestivalMediaAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid media" };

  try {
    const session = await auth();
    const media = await adminCreateMedia(session, parsed.data as MediaWriteInput);
    revalidatePath(`/admin/festivals/${media.contentId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteFestivalMediaAction(mediaId: string, festivalId: string): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(mediaId).success || !idSchema.safeParse(festivalId).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminDeleteMedia(session, mediaId);
    revalidatePath(`/admin/festivals/${festivalId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
