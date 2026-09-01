"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { dismissContentOpportunity } from "@/features/analytics/content-intelligence";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function dismissContentOpportunityAction(normalizedQuery: string): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    await dismissContentOpportunity(session, normalizedQuery);
    revalidatePath("/admin/analytics");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Couldn't dismiss this." };
  }
}
