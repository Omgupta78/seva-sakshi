import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, CalendarDays } from 'lucide-react'
import { InspectionStatusBadge, PriorityBadge } from '../officer/table/Badges.jsx'
import { typeLabel } from '../../data/inspectionModels.js'

/** Full-width tap target for one inspection in the mobile worklist. */
export default function InspectionCardMobile({ inspection }) {
  return (
    <Link
      to={`/inspector/inspections/${inspection.id}`}
      className="flex items-center gap-3 rounded-2xl border border-plum-950/10 bg-white p-4 no-underline shadow-sm active:bg-plum-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <InspectionStatusBadge status={inspection.status} />
          <PriorityBadge priority={inspection.priority} />
        </div>
        <p className="mt-1.5 font-bold text-plum-950">{inspection.projectName}</p>
        <p className="truncate text-sm text-plum-950/60">{inspection.organizationName}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-plum-950/50">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {inspection.district}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {inspection.scheduledDate}
          </span>
          <span>{typeLabel(inspection.type)}</span>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-plum-950/40">{inspection.id}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-plum-950/30" aria-hidden="true" />
    </Link>
  )
}
