"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateMedia, adminUpdateMedia, adminDeleteMedia, type MediaWriteInput } from "@/features/media/admin-service";
import { mediaFormSchema, updateMediaFormSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createMediaAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid media" };
  try {
    const session = await auth();
    await adminCreateMedia(session, parsed.data as MediaWriteInput);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function updateMediaAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateMediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    await adminUpdateMedia(session, id, parsed.data);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminDeleteMedia(session, id);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
