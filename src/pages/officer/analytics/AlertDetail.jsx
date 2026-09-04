import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, TrendingDown, Lightbulb, Calculator, History } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { getAlert } from '../../../services/alertsService.js'
import { RiskBadge, AlertStatusBadge } from '../../../components/officer/analytics/Badges.jsx'
import AlertActions from '../../../components/officer/analytics/AlertActions.jsx'

const ACTION_LABEL = {
  detected: 'Detected',
  reviewed: 'Reviewed',
  'assigned-inspection': 'Assigned for inspection',
  note: 'Note added',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

function fmt(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AlertDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: alert, loading, error, refetch } = useAsync(() => getAlert(id), [id])

  if (loading) return <p className="py-12 text-center text-sm text-plum-950/50">Loading alert…</p>
  if (error || !alert) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-plum-950">Alert not found.</p>
        <Link to="/officer/alerts" className="mt-2 inline-block text-sm text-plum-800">Back to alerts</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      <Link to="/officer/alerts" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-800 no-underline hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Alerts
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{alert.projectName}</h1>
          <p className="font-mono text-xs text-plum-950/55">{alert.id} · {alert.district} · detected {alert.detectedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={alert.riskLevel} />
          <AlertStatusBadge status={alert.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {/* Reason */}
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950"><TrendingDown className="h-4 w-4 text-[#D6262B]" aria-hidden="true" /> Why this was flagged</h2>
            <p className="text-sm text-plum-950/85">{alert.reason}</p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <Field label="Metric">{alert.metric}</Field>
              <Field label="Expected">{alert.expectedValue}</Field>
              <Field label="Observed"><span className="font-semibold text-plum-950">{alert.observedValue}</span></Field>
              <Field label="Deviation">{alert.deviation}</Field>
              <Field label="Risk level"><RiskBadge level={alert.riskLevel} /></Field>
              <Field label="Score">{alert.score} / 100</Field>
            </dl>

            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/65">
              <Calculator className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
              <span>Scoring: {alert.scoreBreakdown} → {alert.score}/100 ({alert.riskLevel}). Thresholds: ≥75 Critical, ≥50 High, ≥25 Medium.</span>
            </div>
          </div>

          {/* Recommended action */}
          <div className="rounded-2xl border border-plum-800/20 bg-plum-50/50 p-4 sm:p-5">
            <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-plum-950"><Lightbulb className="h-4 w-4 text-plum-800" aria-hidden="true" /> Recommended review action</h2>
            <p className="text-sm text-plum-950/80">{alert.recommendedAction}</p>
          </div>

          <AlertActions alert={alert} officer={{ id: user?.employeeId, name: user?.name }} onChanged={refetch} />
        </div>

        {/* Audit */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><History className="h-4 w-4 text-plum-800" aria-hidden="true" /> Audit trail</h2>
          <ol className="space-y-3">
            {alert.audit.map((e) => (
              <li key={e.id} className="relative border-l-2 border-plum-950/10 pl-3">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-plum-800" aria-hidden="true" />
                <p className="text-xs font-bold text-plum-950">{ACTION_LABEL[e.action] ?? e.action}</p>
                <p className="text-[11px] text-plum-950/50">{e.officer} · {fmt(e.at)}</p>
                {e.detail && <p className="mt-0.5 text-xs text-plum-950/70">{e.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-plum-950/85">{children}</dd>
    </div>
  )
}
