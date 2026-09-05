import { useAsync } from '../../hooks/useAsync.js'
import { useInspector } from '../../context/InspectorContext.jsx'
import { listInspectionsForInspector } from '../../services/inspectionsService.js'
import InspectionCardMobile from '../../components/inspector/InspectionCardMobile.jsx'

/** Submitted / completed inspection reports for the signed-in inspector. */
export default function InspectorReports() {
  const { inspector } = useInspector()
  const { data, loading } = useAsync(() => listInspectionsForInspector(inspector.name), [inspector.name])
  const rows = (data ?? []).filter((i) => i.status === 'completed')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Reports</h1>
      <p className="-mt-2 text-sm text-plum-950/60">Reports you have submitted. Departmental review status is shown on each.</p>
      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">You haven’t submitted any reports yet.</p>
      ) : (
        <div className="space-y-3">{rows.map((i) => <InspectionCardMobile key={i.id} inspection={i} />)}</div>
      )}
    </div>
  )
}
