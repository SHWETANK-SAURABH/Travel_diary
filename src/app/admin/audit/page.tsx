import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/features/admin/service";
import { db } from "@/lib/db";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const EDIT_HREF: Partial<Record<string, (id: string) => string>> = {
  FESTIVAL: (id) => `/admin/festivals/${id}`,
  DESTINATION: (id) => `/admin/destinations/${id}`,
  EXPERIENCE: (id) => `/admin/experiences/${id}`,
  FOOD: (id) => `/admin/food/${id}`,
  LOCATION: (id) => `/admin/locations/${id}`,
};

/** Spec §35/§36 — every admin mutation, who did it, and when; `metadata` carries before/after values for fields where that matters (e.g. best-time overrides). */
export default async function AdminAuditPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const session = await auth();
  requireAdmin(session);

  const page = pageParam ? Number(pageParam) : 1;
  const pageSize = 50;

  const [entries, total] = await Promise.all([
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count(),
  ]);

  const columns: AdminTableColumn<(typeof entries)[number]>[] = [
    { header: "When", render: (row) => row.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) },
    { header: "Admin", render: (row) => row.admin.name ?? row.admin.email },
    { header: "Action", render: (row) => row.action.replace(/_/g, " ") },
    { header: "Entity", render: (row) => row.entityType.toLowerCase().replace(/_/g, " ") },
    {
      header: "Item",
      render: (row) => {
        const href = EDIT_HREF[row.entityType]?.(row.entityId);
        const label = row.entityLabel ?? row.entityId;
        return href ? (
          <Link href={href} className="text-marigold-600 hover:underline">
            {label}
          </Link>
        ) : (
          label
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">Audit log</h1>
      <AdminTable columns={columns} rows={entries} rowKey={(row) => row.id} emptyMessage="No admin activity yet." />
      <div className="flex items-center justify-between text-caption text-ink-muted">
        <span>{total} entries</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/audit?page=${page - 1}`} className="hover:text-ink">
              ← Previous
            </Link>
          )}
          {page * pageSize < total && (
            <Link href={`/admin/audit?page=${page + 1}`} className="hover:text-ink">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
