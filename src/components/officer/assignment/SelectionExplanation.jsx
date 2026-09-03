import { HelpCircle, ShieldAlert } from 'lucide-react'

const LABEL_TONE = { High: 'text-[#16794f]', Medium: 'text-[#a15c00]', Low: 'text-[#D6262B]' }

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-plum-950/5 py-1.5 last:border-0">
      <span className="text-sm text-plum-950/70">{label}</span>
      <span className={`text-sm font-bold ${LABEL_TONE[value] ?? 'text-plum-950'}`}>{value}</span>
    </div>
  )
}

/** The brief's "Why was this inspector selected?" transparency panel. */
export default function SelectionExplanation({ selected, seed }) {
  return (
    <div className="rounded-xl border border-plum-950/10 bg-plum-50/40 p-4">
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Why was {selected.inspectorName} selected?
      </h4>
      <Row label="Location match" value={selected.breakdown.location.label} />
      <Row label="Availability" value="High" />
      <Row label="Workload" value={selected.breakdown.workload.label} />
      <Row label="Expertise" value={selected.breakdown.expertise.label} />
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-plum-950/70">Randomization</span>
        <span className="text-sm font-bold text-plum-800">Applied (seed {seed})</span>
      </div>

      <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white p-2.5 text-xs leading-snug text-plum-950/60">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        This is an <strong>AI-Assisted Random Inspection Assignment</strong> — a transparent score ranks eligible
        inspectors, then a seeded random draw picks among them so equally-suitable inspectors aren't always
        assigned the same way. It does not guarantee an unbiased or optimal outcome; officers can override it
        below with Manual Assignment.
      </p>
    </div>
  )
}
