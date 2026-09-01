"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateTag, adminRenameTag, adminSetTagArchived } from "@/features/taxonomy/admin-service";
import { tagFormSchema, tagNameSchema, idSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createTagAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    await adminCreateTag(session, parsed.data);
    revalidatePath("/admin/tags");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function renameTagAction(id: string, name: string): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(id).success || !tagNameSchema.safeParse(name).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminRenameTag(session, id, name);
    revalidatePath("/admin/tags");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function setTagArchivedAction(id: string, archived: boolean): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(id).success || typeof archived !== "boolean") return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminSetTagArchived(session, id, archived);
    revalidatePath("/admin/tags");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
