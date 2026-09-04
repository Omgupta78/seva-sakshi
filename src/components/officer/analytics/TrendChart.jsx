/**
 * Small dependency-free line/area chart for the analytics dashboard.
 * Optionally draws a dashed baseline (e.g. the 30-day mean) so a deviation
 * is visible at a glance. Scales are labelled so nothing is a mystery.
 */
export default function TrendChart({ data = [], labels = [], color = '#3a1d70', baseline = null, suffix = '', height = 120 }) {
  if (data.length < 2) return <p className="py-8 text-center text-xs text-plum-950/40">Not enough data.</p>

  const W = 320
  const H = height
  const padY = 10
  const min = Math.min(...data, baseline ?? Infinity)
  const max = Math.max(...data, baseline ?? -Infinity)
  const range = max - min || 1
  const stepX = W / (data.length - 1)
  const yOf = (v) => H - padY - ((v - min) / range) * (H - padY * 2)

  const pts = data.map((v, i) => [i * stepX, yOf(v)])
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const first = labels[0]
  const last = labels[labels.length - 1]

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260 }} role="img" aria-label="Trend chart">
          <path d={area} fill={color} opacity="0.1" />
          {baseline != null && (
            <line x1="0" y1={yOf(baseline)} x2={W} y2={yOf(baseline)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
          )}
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-plum-950/45">
        <span>{first}</span>
        {baseline != null && <span>baseline {Math.round(baseline)}{suffix}</span>}
        <span>{last}</span>
      </div>
    </div>
  )
}
