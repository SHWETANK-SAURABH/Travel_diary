"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory, type CategoryDomain } from "@/features/taxonomy/admin-service";
import { categoryFormSchema, updateCategoryFormSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createCategoryAction(domain: CategoryDomain, input: unknown): Promise<ActionResult<null>> {
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    await adminCreateCategory(session, domain, parsed.data);
    revalidatePath("/admin/categories");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function updateCategoryAction(domain: CategoryDomain, id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateCategoryFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    await adminUpdateCategory(session, domain, id, parsed.data);
    revalidatePath("/admin/categories");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCategoryAction(domain: CategoryDomain, id: string): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminDeleteCategory(session, domain, id);
    revalidatePath("/admin/categories");
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
