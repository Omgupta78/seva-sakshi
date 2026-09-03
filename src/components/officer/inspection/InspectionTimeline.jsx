import { Check } from 'lucide-react'
import { TIMELINE_STAGES } from '../../../data/inspectionModels.js'

const STAGE_LABEL = {
  created: 'Created',
  assigned: 'Assigned',
  accepted: 'Accepted',
  started: 'Started',
  'evidence-uploaded': 'Evidence Uploaded',
  'report-submitted': 'Report Submitted',
  reviewed: 'Reviewed',
  closed: 'Closed',
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Vertical progress timeline through the 8 canonical inspection stages. Cancelled inspections just stop wherever they were cancelled. */
export default function InspectionTimeline({ timeline, cancelled }) {
  const reached = new Map(timeline.map((t) => [t.stage, t]))

  return (
    <ol className="space-y-0">
      {TIMELINE_STAGES.map((stage, i) => {
        const event = reached.get(stage)
        const isLast = i === TIMELINE_STAGES.length - 1
        return (
          <li key={stage} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={`absolute top-6 left-[11px] h-full w-0.5 ${event ? 'bg-plum-800/40' : 'bg-plum-950/10'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                event ? 'border-plum-800 bg-plum-800 text-white' : 'border-plum-950/20 bg-white text-plum-950/30'
              }`}
            >
              {event ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm font-semibold ${event ? 'text-plum-950' : 'text-plum-950/40'}`}>{STAGE_LABEL[stage]}</p>
              {event && (
                <p className="text-xs text-plum-950/50">
                  {formatTimestamp(event.timestamp)} · {event.actor}
                </p>
              )}
            </div>
          </li>
        )
      })}
      {cancelled && (
        <li className="flex gap-3">
          <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#D6262B] bg-[#D6262B] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          <p className="pt-0.5 text-sm font-semibold text-[#D6262B]">Cancelled</p>
        </li>
      )}
    </ol>
  )
}
