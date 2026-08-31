import Link from "next/link";
import { auth } from "@/lib/auth";
import { adminListMedia } from "@/features/media/admin-service";
import { SearchInput } from "@/components/ui";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { AddMediaForm, MediaRowActions, type MediaRow } from "./MediaManager";

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

const CONTENT_LABEL: Record<string, string> = { FESTIVAL: "Festival", DESTINATION: "Destination", EXPERIENCE: "Experience", FOOD: "Food", EVENT: "Event" };
const EDIT_HREF: Record<string, string> = { FESTIVAL: "/admin/festivals", DESTINATION: "/admin/destinations", EXPERIENCE: "/admin/experiences", FOOD: "/admin/food" };

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const { items, total, page, pageSize } = await adminListMedia(session, {
    search: params.q,
    contentType: params.type as "FESTIVAL" | "DESTINATION" | "EXPERIENCE" | "FOOD" | "EVENT" | undefined,
    page: params.page ? Number(params.page) : 1,
  });

  const columns: AdminTableColumn<MediaRow>[] = [
    {
      header: "Preview",
      render: (row) => (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnail of an arbitrary external URL
        <img src={row.url} alt={row.altText ?? ""} className="h-12 w-12 rounded object-cover" />
      ),
    },
    { header: "Type", render: (row) => CONTENT_LABEL[row.contentType] },
    {
      header: "Content",
      render: (row) => (EDIT_HREF[row.contentType] ? <Link href={`${EDIT_HREF[row.contentType]}/${row.contentId}`} className="text-marigold-600 hover:underline">{row.contentLabel ?? row.contentId}</Link> : (row.contentLabel ?? row.contentId)),
    },
    { header: "Manage", render: (row) => <MediaRowActions row={row} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1">Media</h1>

      <AddMediaForm />

      <form className="flex flex-wrap gap-2" action="/admin/media">
        <SearchInput name="q" defaultValue={params.q} placeholder="Search by content name…" className="max-w-xs" />
        <select name="type" defaultValue={params.type ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All types</option>
          <option value="FESTIVAL">Festival</option>
          <option value="DESTINATION">Destination</option>
          <option value="EXPERIENCE">Experience</option>
          <option value="FOOD">Food</option>
          <option value="EVENT">Event</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 text-sm text-ink hover:bg-marigold-50">
          Filter
        </button>
      </form>

      <AdminTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No media yet." />

      <div className="flex items-center justify-between text-caption text-ink-muted">
        <span>
          {total} image{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/media?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`} className="hover:text-ink">
              ← Previous
            </Link>
          )}
          {page * pageSize < total && (
            <Link href={`/admin/media?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`} className="hover:text-ink">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
