/** Transparency for the eligibility filter — nobody is silently dropped. */
export default function RejectedInspectorsList({ rejected }) {
  if (rejected.length === 0) return null
  return (
    <details className="rounded-xl border border-plum-950/10 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-plum-950/70">
        {rejected.length} inspector{rejected.length === 1 ? '' : 's'} excluded — why
      </summary>
      <ul className="mt-2 space-y-1 text-sm text-plum-950/60">
        {rejected.map(({ inspector, reason }) => (
          <li key={inspector.id}>
            <span className="font-medium text-plum-950/80">{inspector.name}</span> — {reason}
          </li>
        ))}
      </ul>
    </details>
  )
}
