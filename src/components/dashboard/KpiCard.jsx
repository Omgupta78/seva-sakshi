import Sparkline from './Sparkline.jsx'

/** One KPI tile: label, big value, trend sparkline. */
export default function KpiCard({ label, value, trend, accent = '#3a1d70', emphasize = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        emphasize ? 'border-[#D6262B]/25 bg-red-50/60' : 'border-plum-950/10 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-plum-950/60 uppercase">{label}</p>
          <p className={`mt-1 text-2xl font-extrabold sm:text-3xl ${emphasize ? 'text-[#D6262B]' : 'text-plum-950'}`}>
            {value}
          </p>
        </div>
        <Sparkline data={trend} color={emphasize ? '#D6262B' : accent} />
      </div>
    </div>
  )
}
