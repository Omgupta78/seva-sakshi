import Sparkline from '../dashboard/Sparkline.jsx'

/** KPI tile for the officer dashboard's top row — reuses the same Sparkline as /dashboard. */
export default function StatCard({ label, value, trend, accent = '#3a1d70', emphasize = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        emphasize ? 'border-[#D6262B]/25 bg-red-50/60' : 'border-plum-950/10 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-plum-950/60 uppercase">{label}</p>
          <p className={`mt-1 text-2xl font-extrabold ${emphasize ? 'text-[#D6262B]' : 'text-plum-950'}`}>{value}</p>
        </div>
        {trend && <Sparkline data={trend} color={emphasize ? '#D6262B' : accent} width={72} height={24} />}
      </div>
    </div>
  )
}
