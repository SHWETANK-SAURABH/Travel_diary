import type { ReactNode } from "react";

export interface AdminTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

/**
 * The app's first tabular list UI — every other list in the product is a
 * card grid (spec §42: admin can be more utilitarian, prioritize
 * "information density"). Deliberately plain: no client-side sort/filter
 * state of its own, since every admin list page already does
 * search/filter/pagination server-side (spec §38/§49 — never load
 * everything into the browser and filter client-side).
 */
export function AdminTable<T>({ columns, rows, rowKey, emptyMessage = "Nothing here yet." }: AdminTableProps<T>) {
  if (rows.length === 0) {
    return <p className="rounded-md border border-dashed border-border py-12 text-center text-caption text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-paper-raised text-left text-label font-medium tracking-wide text-ink-muted uppercase">
            {columns.map((col) => (
              <th key={col.header} className={`px-3 py-2 ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-marigold-50/40">
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-2.5 align-middle ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
