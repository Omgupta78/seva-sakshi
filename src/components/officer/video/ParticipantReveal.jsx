import { useState } from 'react'
import { Shuffle, Video, ShieldCheck, ChevronDown, Info } from 'lucide-react'
import ParticipantTypeBadge from './ParticipantTypeBadge.jsx'

/**
 * Shows the outcome of a rule-based random selection: the project, the
 * chosen participant (type + display name), the check context, and a
 * transparency panel explaining how the pick was made. From here the officer
 * can re-roll or request the call.
 */
export default function ParticipantReveal({ selection, onReselect, onRequestCall, requesting }) {
  const [showTrace, setShowTrace] = useState(false)
  const { project, participant, context, eligible, excluded, seed, roll, trace } = selection

  if (!participant) {
    return (
      <div className="rounded-2xl border border-[#e2a610]/35 bg-amber-50 p-5 text-sm text-[#a15c00]">
        <p className="font-semibold">No eligible participant for a random video check on this project.</p>
        <p className="mt-1 text-[#a15c00]/80">
          Every candidate was excluded by the rules (e.g. no consent on record, minors, or unavailable staff). Excluded: {excluded.length}.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-plum-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-plum-800 uppercase">
        <Shuffle className="h-4 w-4" aria-hidden="true" /> Randomly selected participant
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Selected Project">
          <span className="font-semibold text-plum-950">{project.name}</span>
          <span className="block text-xs text-plum-950/55">{project.organizationName} · {project.district}, {project.state}</span>
        </Field>
        <Field label="Participant Type"><ParticipantTypeBadge type={participant.type} /></Field>
        <Field label="Participant">
          <span className="font-semibold text-plum-950">{participant.displayName}</span>
          <span className="block text-xs text-plum-950/55">{participant.role}</span>
        </Field>
        <Field label="Reason / Inspection Context">{context}</Field>
      </dl>

      {/* Privacy note */}
      <p className="flex items-start gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/65">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        Only the participant’s role and display name are shown. Contact number, ID and personal details are not exposed — the call connects through the platform.
      </p>

      {/* Selection transparency */}
      <div className="rounded-xl border border-plum-950/10">
        <button
          type="button"
          onClick={() => setShowTrace((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold text-plum-950"
        >
          <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" /> How this was selected — {eligible.length} eligible, {excluded.length} excluded</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showTrace ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {showTrace && (
          <div className="space-y-3 border-t border-plum-950/10 px-3 py-3 text-xs">
            <p className="text-plum-950/60">
              Rule-based weighted random. Seed <span className="font-mono text-plum-950">{seed}</span>, roll <span className="font-mono text-plum-950">{roll}</span> — reproducible and auditable.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left">
                <thead>
                  <tr className="text-[10px] text-plum-950/50 uppercase">
                    <th className="py-1 pr-2 font-semibold">Candidate</th>
                    <th className="py-1 pr-2 font-semibold">Type</th>
                    <th className="py-1 pr-2 font-semibold">Weight</th>
                    <th className="py-1 font-semibold">Window</th>
                  </tr>
                </thead>
                <tbody>
                  {trace.map((t) => (
                    <tr key={t.id} className={`border-t border-plum-950/5 ${t.id === participant.id ? 'bg-plum-50/60 font-semibold' : ''}`}>
                      <td className="py-1 pr-2 text-plum-950/85">{t.displayName}</td>
                      <td className="py-1 pr-2 text-plum-950/70">{t.type}</td>
                      <td className="py-1 pr-2 text-plum-950/70">{t.weight}</td>
                      <td className="py-1 font-mono text-plum-950/60">{t.windowFrom}–{t.windowTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {excluded.length > 0 && (
              <div>
                <p className="mb-1 font-semibold text-plum-950/70">Excluded by the rules</p>
                <ul className="space-y-0.5">
                  {excluded.map((e) => (
                    <li key={e.id} className="text-plum-950/60">• {e.displayName} ({e.role}) — {e.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequestCall}
          disabled={requesting}
          className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a91f24] disabled:opacity-60"
        >
          <Video className="h-4 w-4" aria-hidden="true" />
          {requesting ? 'Requesting…' : 'Request Video Call'}
        </button>
        <button
          type="button"
          onClick={onReselect}
          disabled={requesting}
          className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-4 py-2.5 text-sm font-semibold text-plum-800 transition-colors hover:bg-plum-50 disabled:opacity-60"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" /> Re-select
        </button>
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
