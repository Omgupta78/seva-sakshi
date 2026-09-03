import { Sparkles } from 'lucide-react'

function scoreColor(score) {
  if (score >= 75) return 'text-[#16794f]'
  if (score >= 45) return 'text-[#a15c00]'
  return 'text-[#D6262B]'
}

/** Ranked shortlist of every eligible candidate the engine scored — the "Recommended Inspection Team" table. */
export default function CandidateScoreTable({ candidates, selectedInspectorId }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Inspector</th>
            <th className="px-3 py-2.5 font-semibold">Distance</th>
            <th className="px-3 py-2.5 font-semibold">Current Workload</th>
            <th className="px-3 py-2.5 font-semibold">Expertise Match</th>
            <th className="px-3 py-2.5 font-semibold">Availability</th>
            <th className="px-3 py-2.5 font-semibold">Assignment Score</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const isSelected = c.inspectorId === selectedInspectorId
            return (
              <tr key={c.inspectorId} className={`border-b border-plum-950/5 last:border-0 ${isSelected ? 'bg-plum-50/70' : ''}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-plum-950">
                    {c.inspectorName}
                    {isSelected && (
                      <span className="flex items-center gap-1 rounded-full bg-plum-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-plum-950/50">{c.homeDistrict}</div>
                </td>
                <td className="px-3 py-2.5 text-plum-950/80">
                  {c.distanceKm === 0 ? 'Local' : `${c.distanceKm} km`} <span className="text-xs text-plum-950/45">({c.distanceLabel})</span>
                </td>
                <td className="px-3 py-2.5 text-plum-950/80">
                  {c.workload} / {c.maxWorkload}
                </td>
                <td className="px-3 py-2.5 text-plum-950/80">{c.expertiseMatchPct}%</td>
                <td className="px-3 py-2.5 text-[#16794f]">Available</td>
                <td className={`px-3 py-2.5 text-base font-extrabold ${scoreColor(c.score)}`}>{c.score}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
