"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminCreateLocation, adminUpdateLocation, adminDeleteLocation, type LocationWriteInput } from "@/features/locations/admin-service";
import { locationFormSchema, updateLocationFormSchema, idSchema } from "@/lib/validation";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
}

export async function createLocationAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = locationFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const location = await adminCreateLocation(session, parsed.data as LocationWriteInput);
    revalidatePath("/admin/locations");
    return { ok: true, data: { id: location.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateLocationAction(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateLocationFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const session = await auth();
    const location = await adminUpdateLocation(session, id, parsed.data as Partial<LocationWriteInput>);
    revalidatePath("/admin/locations");
    revalidatePath(`/admin/locations/${id}`);
    return { ok: true, data: { id: location.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteLocationAction(id: string): Promise<ActionResult<null> | void> {
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid input" };
  try {
    const session = await auth();
    await adminDeleteLocation(session, id);
    revalidatePath("/admin/locations");
  } catch (error) {
    return failure(error);
  }
  redirect("/admin/locations");
}
