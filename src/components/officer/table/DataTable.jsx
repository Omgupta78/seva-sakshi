import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

/**
 * Generic sortable data table. `columns` is
 *   [{ key, label, sortable?: boolean, render?: (row) => ReactNode, className?: string }]
 * `render` defaults to `row[key]`. Sorting state is owned by the caller
 * (passed in as sortBy/sortDir + onSort) so it composes with server-side
 * (or here, service-layer) sorting rather than re-sorting client-side.
 */
export default function DataTable({ columns, rows, sortBy, sortDir, onSort, onRowClick, loading, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`px-3 py-2.5 font-semibold ${col.className ?? ''}`}>
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1 hover:text-plum-950"
                  >
                    {col.label}
                    {sortBy === col.key ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3 w-3" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-plum-950/50">
                Loading…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-plum-950/50">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-plum-950/5 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-plum-50/50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 align-middle text-plum-950/85 ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
