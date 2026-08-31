"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateExperience, adminUpdateExperience, adminSetExperienceStatus, type ExperienceWriteInput } from "@/features/experiences/admin-service";
import { adminCreateMedia, adminDeleteMedia, type MediaWriteInput } from "@/features/media/admin-service";
import { experienceFormSchema, updateExperienceFormSchema, mediaFormSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createExperienceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const experience = await adminCreateExperience(session, parsed.data as ExperienceWriteInput);
    revalidatePath("/admin/experiences");
    return { ok: true, data: { id: experience.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateExperienceAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateExperienceFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const experience = await adminUpdateExperience(session, id, parsed.data as Partial<ExperienceWriteInput>);
    revalidatePath("/admin/experiences");
    revalidatePath(`/admin/experiences/${id}`);
    return { ok: true, data: { id: experience.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setExperienceStatusAction(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminSetExperienceStatus(session, id, status);
    revalidatePath("/admin/experiences");
    revalidatePath(`/admin/experiences/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function addExperienceMediaAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid media" };
  try {
    const session = await auth();
    const media = await adminCreateMedia(session, parsed.data as MediaWriteInput);
    revalidatePath(`/admin/experiences/${media.contentId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteExperienceMediaAction(mediaId: string, experienceId: string): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminDeleteMedia(session, mediaId);
    revalidatePath(`/admin/experiences/${experienceId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
