import { FlaskConical } from 'lucide-react'

/**
 * DEMO-ONLY control. Because no pretrained model is bundled, this stands in
 * for "what the camera currently sees", letting the real matching/threshold/
 * duplicate logic be exercised and every required scenario tested. It is
 * clearly labelled and would be removed once a real detector/model is wired in.
 */
export default function DemoScenarioSelect({ mode = 'live', students = [], value, onChange }) {
  const faults = [
    { label: 'No face in frame', v: { scenario: 'none' } },
    { label: 'Multiple faces in frame', v: { scenario: 'multiple' } },
    { label: 'Low-quality / blurred image', v: { scenario: 'low-quality' } },
  ]

  function emit(v) {
    onChange(v)
  }

  return (
    <div className="rounded-xl border border-dashed border-plum-800/30 bg-plum-50/40 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-plum-800 uppercase">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Demo simulation — stands in for the live camera
      </div>
      <label htmlFor="demo-scenario" className="sr-only">Demo scenario</label>
      <select
        id="demo-scenario"
        value={JSON.stringify(value ?? {})}
        onChange={(e) => emit(JSON.parse(e.target.value))}
        className="w-full rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none"
      >
        {mode === 'live' && (
          <optgroup label="A person in front of the camera">
            {students.filter((s) => s.enrollment === 'enrolled').map((s) => (
              <option key={s.id} value={JSON.stringify({ scenario: 'one', identityToken: s.id, label: s.name })}>
                {s.name} ({s.id}) — enrolled
              </option>
            ))}
            <option value={JSON.stringify({ scenario: 'one', identityToken: 'unknown-person', label: 'Unknown person' })}>Unknown person (not enrolled)</option>
          </optgroup>
        )}
        {mode === 'enroll' && (
          <option value={JSON.stringify({ scenario: 'one' })}>Clear single face (good quality)</option>
        )}
        <optgroup label="Fault conditions">
          {faults.map((f) => (
            <option key={f.label} value={JSON.stringify(f.v)}>{f.label}</option>
          ))}
        </optgroup>
      </select>
    </div>
  )
}
