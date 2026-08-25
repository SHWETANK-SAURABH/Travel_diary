import { db } from "@/lib/db";
import type { Session } from "next-auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Admin access required");
    this.name = "UnauthorizedError";
  }
}

/** Guard for every admin service/route — throws rather than silently no-op-ing. */
export function requireAdmin(session: Session | null): asserts session is Session {
  if (!session || session.user.role !== "ADMIN") {
    throw new UnauthorizedError();
  }
}

/** Example admin write path: promotes a festival occurrence's date to admin-verified. */
export async function verifyFestivalOccurrence(
  session: Session | null,
  occurrenceId: string,
  input: { startDate?: Date; endDate?: Date }
) {
  requireAdmin(session);

  return db.festivalOccurrence.update({
    where: { id: occurrenceId },
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      dateConfidence: "ADMIN_VERIFIED",
      verifiedByUserId: session.user.id,
      verifiedAt: new Date(),
    },
  });
}
