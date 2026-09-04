import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync.js'
import { useInspector } from '../../context/InspectorContext.jsx'
import { listInspectionsForInspector } from '../../services/inspectionsService.js'
import InspectionCardMobile from '../../components/inspector/InspectionCardMobile.jsx'

const FILTERS = [
  { key: 'active', label: 'Active', match: (i) => ['assigned', 'scheduled', 'in-progress', 'overdue'].includes(i.status) },
  { key: 'today', label: 'Today', match: (i) => i.scheduledDate === new Date().toISOString().slice(0, 10) && i.status !== 'cancelled' },
  { key: 'completed', label: 'Completed', match: (i) => i.status === 'completed' },
  { key: 'all', label: 'All', match: () => true },
]

export default function InspectorInspections() {
  const { inspector } = useInspector()
  const [filter, setFilter] = useState('active')
  const { data, loading } = useAsync(() => listInspectionsForInspector(inspector.name), [inspector.name])

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0]
  const rows = (data ?? []).filter(active.match)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">My Inspections</h1>

      {/* Horizontally scrollable chips keep all filters reachable on a narrow screen */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`min-h-11 shrink-0 rounded-full border-2 px-4 text-sm font-bold ${
              filter === f.key ? 'border-plum-800 bg-plum-800 text-white' : 'border-plum-950/15 bg-white text-plum-950/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">
          No inspections in this view.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((inspection) => (
            <InspectionCardMobile key={inspection.id} inspection={inspection} />
          ))}
        </div>
      )}
    </div>
  )
}
