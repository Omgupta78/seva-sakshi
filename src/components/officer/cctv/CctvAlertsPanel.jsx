import { Link } from 'react-router-dom'
import { ShieldCheck, ChevronRight } from 'lucide-react'
import { ALERT_META } from './alertMeta.js'
import { timeAgo } from './time.js'

const SEVERITY_CLS = {
  critical: 'border-[#D6262B]/25 bg-red-50 text-[#D6262B]',
  warning: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]',
}

/**
 * List of current CCTV system alerts. These are strictly connectivity /
 * device-health alerts (offline, missed heartbeat, unstable link) — the
 * module does not analyse video content, so nothing here asserts wrongdoing
 * or "suspicious activity".
 */
export default function CctvAlertsPanel({ alerts, loading, compact = false }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-plum-950">System Alerts</h2>
        <span className="rounded-full bg-plum-50 px-2 py-0.5 text-xs font-semibold text-plum-800">{alerts?.length ?? 0}</span>
      </div>

      <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/60">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        Connectivity and device-health alerts only. This module does not analyse video content or flag activity in a feed.
      </p>

      {loading ? (
        <p className="py-6 text-center text-sm text-plum-950/50">Loading alerts…</p>
      ) : !alerts?.length ? (
        <div className="flex flex-col items-center gap-1.5 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[#138808]/50" aria-hidden="true" />
          <p className="text-sm font-semibold text-plum-950">All cameras healthy</p>
          <p className="text-xs text-plum-950/55">No connectivity alerts right now.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {(compact ? alerts.slice(0, 5) : alerts).map((a) => {
            const meta = ALERT_META[a.type] ?? ALERT_META['connection-unstable']
            const Icon = meta.icon
            return (
              <li key={a.id}>
                <Link
                  to={`/officer/cctv/${a.cameraId}`}
                  className="flex items-center gap-3 rounded-xl border border-plum-950/10 p-2.5 no-underline transition-colors hover:bg-plum-50/50"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${SEVERITY_CLS[a.severity]}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-plum-950">{meta.label}</span>
                      <span className="font-mono text-[10px] text-plum-950/50">{a.cameraId}</span>
                    </div>
                    <p className="truncate text-xs text-plum-950/70">{a.message}</p>
                    <p className="text-[10px] text-plum-950/45">{a.projectName} · {a.district} · {timeAgo(a.raisedAt)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-plum-950/30" aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
