import { UserCog } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listInstitutionStaff } from '../../services/institutionService.js'

/** Staff roster (teaching & non-teaching) for the institution. Read-only demo. */
export default function InstitutionStaff() {
  const { data, loading } = useAsync(() => listInstitutionStaff(), [])
  const rows = data?.items ?? []
  const active = rows.filter((r) => r.status === 'active').length

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Staff</h1>
          <p className="text-sm text-plum-950/60">Teaching and non-teaching staff on record.</p>
        </div>
        {!loading && <p className="text-sm text-plum-950/60"><span className="font-bold text-plum-950">{active}</span> active · {rows.length} total</p>}
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        {loading ? (
          <p className="py-10 text-center text-sm text-plum-950/50">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-plum-950/10 text-xs text-plum-950/60 uppercase">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-plum-950/5 last:border-0 hover:bg-plum-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-800/10 text-plum-800"><UserCog className="h-4 w-4" aria-hidden="true" /></span>
                        <span className="font-semibold text-plum-950">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-plum-950/75">{r.role}</td>
                    <td className="px-4 py-3 text-plum-950/70">{r.dept}</td>
                    <td className="px-4 py-3 text-plum-950/70">{r.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${r.status === 'active' ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-plum-950/15 bg-plum-50 text-plum-950/55'}`}>{r.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
