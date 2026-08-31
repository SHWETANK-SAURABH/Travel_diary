import Link from "next/link";
import { auth } from "@/lib/auth";
import { adminListLocations } from "@/features/locations/admin-service";
import { Button, SearchInput } from "@/components/ui";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

const TYPE_LABEL: Record<string, string> = { COUNTRY: "Country", STATE: "State", REGION: "Region", CITY: "City" };

export default async function AdminLocationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const { items, total, page, pageSize } = await adminListLocations(session, {
    search: params.q,
    type: params.type as "COUNTRY" | "STATE" | "REGION" | "CITY" | undefined,
    page: params.page ? Number(params.page) : 1,
  });

  const columns: AdminTableColumn<(typeof items)[number]>[] = [
    {
      header: "Name",
      render: (row) => (
        <Link href={`/admin/locations/${row.id}`} className="font-medium text-ink hover:text-marigold-600">
          {row.name}
        </Link>
      ),
    },
    { header: "Type", render: (row) => TYPE_LABEL[row.type] },
    { header: "Parent", render: (row) => row.parent?.name ?? "—" },
    { header: "Sub-locations", render: (row) => row._count.children },
    { header: "Precision", render: (row) => (row.precision === "EXACT" ? "Exact" : "Approximate") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1">Locations</h1>
        <Link href="/admin/locations/new">
          <Button>New location</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/locations">
        <SearchInput name="q" defaultValue={params.q} placeholder="Search locations…" className="max-w-xs" />
        <select name="type" defaultValue={params.type ?? ""} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="">All types</option>
          <option value="COUNTRY">Country</option>
          <option value="STATE">State</option>
          <option value="REGION">Region</option>
          <option value="CITY">City</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <AdminTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No locations match these filters." />

      <div className="flex items-center justify-between text-caption text-ink-muted">
        <span>
          {total} location{total === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/admin/locations?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`} className="hover:text-ink">
              ← Previous
            </Link>
          )}
          {page * pageSize < total && (
            <Link href={`/admin/locations?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`} className="hover:text-ink">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
