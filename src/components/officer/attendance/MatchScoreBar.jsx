/** Visualises a cosine match score against the configured threshold. */
export default function MatchScoreBar({ score = 0, threshold = 0.62 }) {
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)))
  const pass = score >= threshold
  return (
    <div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-plum-950/10">
        <div className={`h-full rounded-full ${pass ? 'bg-[#138808]' : 'bg-[#e2a610]'}`} style={{ width: `${pct}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-plum-950/50" style={{ left: `${Math.round(threshold * 100)}%` }} title={`Threshold ${threshold}`} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-plum-950/50">
        <span>Score {score.toFixed(3)}</span>
        <span>Threshold {threshold.toFixed(2)}</span>
      </div>
    </div>
  )
}
