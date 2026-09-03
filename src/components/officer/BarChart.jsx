/** Minimal horizontal SVG bar chart — no dependency, matches the dashboard's hand-rolled Sparkline. */
export default function BarChart({ data, height = 22 }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs font-medium text-plum-950/70">{d.label}</span>
          <div className="h-[--h] flex-1 overflow-hidden rounded-full bg-plum-950/5" style={{ '--h': `${height}px`, height }}>
            <div
              className="flex h-full items-center justify-end rounded-full pr-2 text-[11px] font-bold text-white transition-[width] duration-700"
              style={{ width: `${Math.max((d.value / max) * 100, 12)}%`, backgroundColor: d.color }}
            >
              {d.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
