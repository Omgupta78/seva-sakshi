import { UserCheck, UserX, ScanFace, Users, ImageOff, Loader2 } from 'lucide-react'
import MatchScoreBar from './MatchScoreBar.jsx'
import { AttendanceStatusBadge } from './Badges.jsx'

/**
 * Shows the outcome of one recognition pass: Name, ID, Match Score and the
 * resulting attendance status. Unknown / no-face / multiple / low-quality are
 * all surfaced honestly — an unknown person is never shown as a student.
 */
export default function RecognitionResult({ result, processing }) {
  if (processing && !result) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-plum-950/10 bg-white p-4 text-sm text-plum-950/60">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Analysing frame…
      </div>
    )
  }
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-plum-950/15 bg-white/60 p-4 text-center text-sm text-plum-950/50">
        <ScanFace className="mx-auto mb-1 h-6 w-6 text-plum-950/25" aria-hidden="true" />
        Waiting for a scan.
      </div>
    )
  }

  if (result.status === 'no-face') return <Info icon={ScanFace} tone="neutral" title="No face detected" text="Position a single face within the guide." />
  if (result.status === 'multiple-faces') return <Info icon={Users} tone="warn" title="Multiple faces detected" text="Only one person can be verified at a time. Ask others to step out of frame." />
  if (result.status === 'low-quality') return <Info icon={ImageOff} tone="warn" title="Image quality too low" text={`Detector confidence ${(result.quality ?? 0).toFixed(2)}. Improve lighting / reduce blur.`} />

  const recognized = result.status === 'recognized'

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${recognized ? 'border-[#138808]/25 bg-green-50/60' : 'border-plum-950/12 bg-white'}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-sm font-bold ${recognized ? 'text-[#16794f]' : 'text-plum-950/70'}`}>
          {recognized ? <UserCheck className="h-4 w-4" aria-hidden="true" /> : <UserX className="h-4 w-4" aria-hidden="true" />}
          {recognized ? 'Identity candidate' : 'Unknown'}
        </span>
        <AttendanceStatusBadge status={recognized ? 'present' : 'unknown'} />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Name</dt>
          <dd className="mt-0.5 font-semibold text-plum-950">{recognized ? result.studentName : '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">ID</dt>
          <dd className="mt-0.5 font-mono text-xs text-plum-950/85">{recognized ? result.studentId : '—'}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <p className="mb-1 text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Match Score</p>
        <MatchScoreBar score={result.matchScore ?? 0} threshold={result.threshold ?? 0.62} />
      </div>

      {!recognized && (
        <p className="mt-3 rounded-lg bg-plum-50 p-2 text-[11px] text-plum-950/60">
          Below the confidence threshold — kept as Unknown. This person is not marked as a student.
        </p>
      )}
    </div>
  )
}

const TONE = {
  neutral: 'border-plum-950/12 bg-white text-plum-950/70',
  warn: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]',
}
function Info({ icon: Icon, tone, title, text }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border p-4 ${TONE[tone]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs opacity-80">{text}</p>
      </div>
    </div>
  )
}
