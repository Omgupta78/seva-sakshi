import { Check } from 'lucide-react'

const STAGES = [
  { key: 'camera', label: 'Camera' },
  { key: 'detect', label: 'Face Detection' },
  { key: 'align', label: 'Alignment' },
  { key: 'embed', label: 'Embedding' },
  { key: 'compare', label: 'Compare Enrolled' },
  { key: 'threshold', label: 'Threshold Check' },
  { key: 'candidate', label: 'Identity Candidate' },
  { key: 'liveness', label: 'Liveness (prototype)' },
  { key: 'decision', label: 'Attendance Decision' },
]

/**
 * Renders the recognition pipeline so the officer can see exactly what the
 * assistance tool does — camera → detection → alignment → embedding → compare
 * → threshold → candidate → liveness → decision.
 */
export default function PipelineTrace({ activeKey, reachedKeys = [] }) {
  const activeIdx = STAGES.findIndex((s) => s.key === activeKey)
  return (
    <ol className="space-y-1.5">
      {STAGES.map((s, i) => {
        const done = reachedKeys.includes(s.key) || (activeIdx > -1 && i < activeIdx)
        const active = s.key === activeKey
        return (
          <li key={s.key} className="flex items-center gap-2.5 text-xs">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                done ? 'bg-[#138808] text-white' : active ? 'bg-plum-800 text-white' : 'bg-plum-950/10 text-plum-950/40'
              }`}
            >
              {done ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
            </span>
            <span className={active ? 'font-semibold text-plum-950' : done ? 'text-plum-950/70' : 'text-plum-950/45'}>{s.label}</span>
            {active && <span className="ml-auto text-[10px] font-semibold text-plum-800">running…</span>}
          </li>
        )
      })}
    </ol>
  )
}
