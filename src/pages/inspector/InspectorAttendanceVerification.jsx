import { useState } from 'react'
import { MapPin, ClipboardCheck, TrendingUp, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../context/ToastContext.jsx'
import { getAttendanceMonitoring, recordVerificationFinding } from '../../services/attendanceSessionsService.js'

/**
 * Inspector's independent attendance verification. Shows what the institution
 * REPORTED, lets the inspector record what they OBSERVED, and raises a finding
 * on a discrepancy. It never edits institutional attendance.
 */
export default function InspectorAttendanceVerification() {
  const toast = useToast()
  const { data: mon } = useAsync(() => getAttendanceMonitoring(), [])
  const [cls, setCls] = useState('')
  const [observed, setObserved] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [finding, setFinding] = useState(null)

  const rows = mon?.byClass ?? []
  const selected = rows.find((r) => r.class === cls)
  const reported = selected?.attendancePct ?? null

  async function submit() {
    if (!cls || observed === '') { toast.error('Select a class and enter observed attendance.'); return }
    setSaving(true)
    try {
      const f = await recordVerificationFinding({ inspectionId: 'INSP-3005', cls, reportedPct: reported, observedPct: Number(observed), note })
      setFinding(f)
      toast.success('Verification finding recorded.')
    } catch (e) { toast.error(e.message ?? 'Could not record finding.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Attendance Verification</h1>
      <p className="-mt-2 text-sm text-plum-950/60">Independently verify the institution’s reported attendance during your inspection.</p>

      <div className="flex items-center gap-2 rounded-xl border border-[#138808]/25 bg-green-50 p-3 text-xs text-[#16794f]">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /> On-site GPS verified · Govt Ashram Shala, Wada
      </div>

      {/* Reported figures */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ClipboardCheck className="h-4 w-4 text-plum-800" aria-hidden="true" /> Reported by institution (today)</h2>
        <div className="space-y-1.5">
          {rows.map((r) => (
            <button key={r.class} type="button" onClick={() => setCls(r.class)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${cls === r.class ? 'border-plum-800 bg-plum-50' : 'border-plum-950/10'}`}>
              <span className="font-semibold text-plum-950">{r.class}</span>
              <span className="flex items-center gap-2"><span className="font-semibold">{r.attendancePct}%</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${r.status === 'Normal' ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]'}`}>{r.status}</span></span>
            </button>
          ))}
        </div>
      </div>

      {/* Inspector observation */}
      {cls && !finding && (
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><TrendingUp className="h-4 w-4 text-plum-800" aria-hidden="true" /> Your observation — {cls}</h2>
          <p className="mb-2 text-xs text-plum-950/60">Reported: <span className="font-semibold text-plum-950">{reported}%</span></p>
          <label className="mb-1 block text-xs font-semibold text-plum-950/70">Observed attendance %</label>
          <input type="number" min="0" max="100" value={observed} onChange={(e) => setObserved(e.target.value)} placeholder="e.g. 78" className="mb-3 w-full rounded-xl border border-plum-950/15 px-3 py-3 text-base focus:outline-none" />
          <label className="mb-1 block text-xs font-semibold text-plum-950/70">Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Observation notes…" className="mb-3 w-full rounded-xl border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          <button type="button" onClick={submit} disabled={saving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-plum-800 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Recording…</> : 'Record Verification Finding'}
          </button>
        </div>
      )}

      {finding && (
        <div className={`rounded-2xl border p-4 shadow-sm ${finding.discrepancy >= 10 ? 'border-[#D6262B]/25 bg-red-50/60' : 'border-[#138808]/25 bg-green-50/60'}`}>
          <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950">
            {finding.discrepancy >= 10 ? <AlertTriangle className="h-4 w-4 text-[#D6262B]" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4 text-[#138808]" aria-hidden="true" />}
            Verification finding recorded
          </div>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div><dt className="text-[10px] text-plum-950/50 uppercase">Reported</dt><dd className="font-bold text-plum-950">{finding.reportedPct}%</dd></div>
            <div><dt className="text-[10px] text-plum-950/50 uppercase">Observed</dt><dd className="font-bold text-plum-950">{finding.observedPct}%</dd></div>
            <div><dt className="text-[10px] text-plum-950/50 uppercase">Discrepancy</dt><dd className="font-bold text-plum-950">{finding.discrepancy}%</dd></div>
          </dl>
          <p className="mt-2 text-xs text-plum-950/75">{finding.note}</p>
          <p className="mt-1 text-[11px] text-plum-950/45">Attached to the inspection for departmental review — institutional attendance was not modified.</p>
        </div>
      )}
    </div>
  )
}
