import Link from "next/link";
import { auth } from "@/lib/auth";
import { adminListDestinations } from "@/features/destinations/admin-service";
import { db } from "@/lib/db";
import { Button, SearchInput } from "@/components/ui";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { ContentStatusPill, VerificationPill } from "@/components/admin/StatusPill";
import { StatusQuickActions } from "@/components/admin/StatusQuickActions";
import { setDestinationStatusAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}

export default async function AdminDestinationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const [{ items, total, page, pageSize }, categories] = await Promise.all([
    adminListDestinations(session, {
      search: params.q,
      status: params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
      categoryId: params.category,
      page: params.page ? Number(params.page) : 1,
    }),
    db.destinationCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  const columns: AdminTableColumn<(typeof items)[number]>[] = [
    {
      header: "Name",
      render: (row) => (
        <Link href={`/admin/destinations/${row.id}`} className="font-medium text-ink hover:text-marigold-600">
          {row.name}
        </Link>
      ),
    },
    { header: "Type", render: (row) => row.category?.name ?? "—" },
    { header: "Location", render: (row) => row.location.name },
    { header: "Status", render: (row) => <ContentStatusPill status={row.status} /> },
    { header: "Verification", render: (row) => <VerificationPill status={row.verificationStatus} /> },
    { header: "Updated", render: (row) => row.updatedAt.toLocaleDateString("en-IN") },
    { header: "Actions", render: (row) => <StatusQuickActions id={row.id} status={row.status} action={setDestinationStatusAction} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1">Destinations</h1>
        <Link href="/admin/destinations/new">
          <Button>New destination</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/destinations">
        <SearchInput name="q" defaultValue={params.q} placeholder="Search destinations…" className="max-w-xs" />
        <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="category" defaultValue={params.category ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All types</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <AdminTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No destinations match these filters." />

      <div className="flex items-center justify-between text-caption text-ink-muted">
        <span>
          {total} destination{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/destinations?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`} className="hover:text-ink">
              ← Previous
            </Link>
          )}
          {page * pageSize < total && (
            <Link href={`/admin/destinations?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`} className="hover:text-ink">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
