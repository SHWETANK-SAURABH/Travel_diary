import Link from "next/link";
import { auth } from "@/lib/auth";
import { adminListFestivals } from "@/features/festivals/admin-service";
import { db } from "@/lib/db";
import { Button, SearchInput } from "@/components/ui";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { ContentStatusPill, DateConfidencePill } from "@/components/admin/StatusPill";
import { StatusQuickActions } from "@/components/admin/StatusQuickActions";
import { setFestivalStatusAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}

export default async function AdminFestivalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const [{ items, total, page, pageSize }, categories] = await Promise.all([
    adminListFestivals(session, {
      search: params.q,
      status: params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
      categoryId: params.category,
      page: params.page ? Number(params.page) : 1,
    }),
    db.festivalCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  const columns: AdminTableColumn<(typeof items)[number]>[] = [
    {
      header: "Name",
      render: (row) => (
        <Link href={`/admin/festivals/${row.id}`} className="font-medium text-ink hover:text-marigold-600">
          {row.name}
        </Link>
      ),
    },
    { header: "Category", render: (row) => row.category.name },
    { header: "Location", render: (row) => row.location.name },
    { header: "Status", render: (row) => <ContentStatusPill status={row.status} /> },
    {
      header: "Latest date",
      render: (row) => (row.occurrences[0] ? <DateConfidencePill confidence={row.occurrences[0].dateConfidence} /> : <span className="text-caption text-ink-muted">No dates</span>),
    },
    { header: "Updated", render: (row) => row.updatedAt.toLocaleDateString("en-IN") },
    {
      header: "Actions",
      render: (row) => <StatusQuickActions id={row.id} status={row.status} action={setFestivalStatusAction} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1">Festivals</h1>
        <Link href="/admin/festivals/new">
          <Button>New festival</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/festivals">
        <SearchInput name="q" defaultValue={params.q} placeholder="Search festivals…" className="max-w-xs" />
        <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="category" defaultValue={params.category ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All categories</option>
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

      <AdminTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No festivals match these filters." />

      <div className="flex items-center justify-between text-caption text-ink-muted">
        <span>
          {total} festival{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/festivals?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`} className="hover:text-ink">
              ← Previous
            </Link>
          )}
          {page * pageSize < total && (
            <Link href={`/admin/festivals?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`} className="hover:text-ink">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
