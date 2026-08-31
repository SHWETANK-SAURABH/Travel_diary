"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { adminCreateFood, adminUpdateFood, adminSetFoodStatus, type FoodWriteInput } from "@/features/food/admin-service";
import { adminCreateMedia, adminDeleteMedia, type MediaWriteInput } from "@/features/media/admin-service";
import { foodFormSchema, updateFoodFormSchema, mediaFormSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createFoodAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = foodFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const food = await adminCreateFood(session, parsed.data as FoodWriteInput);
    revalidatePath("/admin/food");
    return { ok: true, data: { id: food.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateFoodAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateFoodFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const food = await adminUpdateFood(session, id, parsed.data as Partial<FoodWriteInput>);
    revalidatePath("/admin/food");
    revalidatePath(`/admin/food/${id}`);
    return { ok: true, data: { id: food.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setFoodStatusAction(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminSetFoodStatus(session, id, status);
    revalidatePath("/admin/food");
    revalidatePath(`/admin/food/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function addFoodMediaAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mediaFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid media" };
  try {
    const session = await auth();
    const media = await adminCreateMedia(session, parsed.data as MediaWriteInput);
    revalidatePath(`/admin/food/${media.contentId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteFoodMediaAction(mediaId: string, foodId: string): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await adminDeleteMedia(session, mediaId);
    revalidatePath(`/admin/food/${foodId}`);
    return { ok: true, data: null };
  } catch (error) {
    return failure(error);
  }
}
