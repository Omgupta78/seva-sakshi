import { useNavigate } from 'react-router-dom'
import { FileWarning, Inbox } from 'lucide-react'

/**
 * Generic report table with loading / empty / error states.
 * `columns` is [{ key, label }]; `rows` is an array of objects.
 * When `rowLinkBase` is set, each row links to `${rowLinkBase}/${row.id}`.
 */
export default function ReportTable({ columns, rows, loading, error, rowLinkBase, emptyMessage = 'No records match these filters.' }) {
  const navigate = useNavigate()

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#D6262B]/25 bg-red-50/50 p-10 text-center">
        <FileWarning className="h-8 w-8 text-[#D6262B]" aria-hidden="true" />
        <p className="text-sm font-semibold text-plum-950">Could not load this report.</p>
        <p className="text-xs text-plum-950/60">{error.message ?? 'Please try again.'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            {columns.map((c) => <th key={c.key} className="px-3 py-2.5 font-semibold whitespace-nowrap">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="px-3 py-10 text-center text-plum-950/50">Generating report…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-3 py-12 text-center">
              <Inbox className="mx-auto mb-2 h-7 w-7 text-plum-950/25" aria-hidden="true" />
              <span className="text-sm text-plum-950/55">{emptyMessage}</span>
            </td></tr>
          ) : rows.map((r, idx) => (
            <tr
              key={r.id ?? idx}
              onClick={rowLinkBase ? () => navigate(`${rowLinkBase}/${r.id}`) : undefined}
              className={`border-b border-plum-950/5 text-plum-950/85 last:border-0 ${rowLinkBase ? 'cursor-pointer hover:bg-plum-50/50' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2.5 align-middle whitespace-nowrap">
                  {c.key === columns[0].key ? <span className="font-semibold text-plum-950">{fmt(r[c.key])}</span> : fmt(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'number') return v
  return String(v)
}
