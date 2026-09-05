import { FileText, Upload, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../context/ToastContext.jsx'
import { listInstitutionDocuments } from '../../services/institutionService.js'

const STATUS = {
  verified: { label: 'Verified', cls: 'border-[#138808]/25 bg-green-50 text-[#16794f]', icon: CheckCircle2 },
  pending: { label: 'Pending', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]', icon: Clock },
  expiring: { label: 'Expiring soon', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]', icon: AlertTriangle },
  missing: { label: 'Missing', cls: 'border-[#D6262B]/25 bg-red-50 text-[#b23b3b]', icon: XCircle },
}

/** Compliance documents the institution maintains for inspections.
 *  Upload is a demo affordance — no file is stored in this prototype. */
export default function InstitutionDocuments() {
  const { data, loading } = useAsync(() => listInstitutionDocuments(), [])
  const toast = useToast()
  const rows = data?.items ?? []
  const pending = rows.filter((d) => d.required && d.status !== 'verified').length

  function handleUpload(name) {
    toast.info(`Upload for “${name}” is a demo action — documents are not stored in this prototype.`)
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Documents</h1>
          <p className="text-sm text-plum-950/60">Registration, safety and compliance records for inspections.</p>
        </div>
        {!loading && <p className="text-sm text-plum-950/60"><span className="font-bold text-[#a15c00]">{pending}</span> required document{pending === 1 ? '' : 's'} pending</p>}
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        {loading ? (
          <p className="py-10 text-center text-sm text-plum-950/50">Loading…</p>
        ) : (
          <ul className="divide-y divide-plum-950/8">
            {rows.map((d) => {
              const st = STATUS[d.status] ?? STATUS.pending
              const Icon = st.icon
              return (
                <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-plum-800/10 text-plum-800"><FileText className="h-4.5 w-4.5" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-plum-950">
                      {d.name}
                      {d.required && <span className="rounded bg-plum-950/8 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-plum-950/55 uppercase">Required</span>}
                    </p>
                    <p className="text-xs text-plum-950/55">{d.category}{d.updated ? ` · updated ${d.updated}` : ' · never uploaded'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${st.cls}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {st.label}</span>
                  <button type="button" onClick={() => handleUpload(d.name)} className="flex items-center gap-1.5 rounded-lg border border-plum-800 bg-plum-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-plum-700">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Upload
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="rounded-xl bg-plum-50/60 p-3 text-[11px] text-plum-950/55">Document status feeds the institution's Inspection Readiness score and is visible to inspectors during a visit.</p>
    </div>
  )
}
