import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Sparkles, CheckCircle, PlayCircle, XCircle } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getInspection, acceptInspection, startInspection, cancelInspection, updateChecklistItem } from '../../services/inspectionsService.js'
import { InspectionStatusBadge, PriorityBadge, RiskBadge } from '../../components/officer/table/Badges.jsx'
import { InspectionOverviewTab, HistoryTab } from '../../components/officer/inspection/InspectionTabs.jsx'
import ChecklistPanel from '../../components/officer/inspection/ChecklistPanel.jsx'
import EvidencePanel from '../../components/officer/inspection/EvidencePanel.jsx'
import ReportPanel from '../../components/officer/inspection/ReportPanel.jsx'
import InspectionTimeline from '../../components/officer/inspection/InspectionTimeline.jsx'
import AiAssignmentDialog from '../../components/officer/assignment/AiAssignmentDialog.jsx'
import ConfirmDialog from '../../components/officer/ConfirmDialog.jsx'

const TABS = ['Overview', 'Checklist', 'Evidence', 'Report', 'Timeline', 'History']

export default function InspectionDetails() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Overview')
  const [assigning, setAssigning] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const { data: inspection, loading, error, refetch } = useAsync(() => getInspection(id), [id])

  if (loading) return <p className="p-6 text-center text-sm text-plum-950/50">Loading inspection…</p>
  if (error || !inspection) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-plum-950">Inspection not found.</p>
        <Link to="/officer/inspections" className="mt-2 inline-block text-sm text-plum-800 hover:underline">
          Back to Inspections
        </Link>
      </div>
    )
  }

  async function runAction(actionFn) {
    setActionPending(true)
    try {
      await actionFn(inspection.id)
      refetch()
    } finally {
      setActionPending(false)
    }
  }

  const canCancel = !['completed', 'cancelled'].includes(inspection.status)

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Link to="/officer/inspections" className="inline-flex items-center gap-1 text-sm font-medium text-plum-800 no-underline hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to Inspections
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-plum-950/50">{inspection.id}</p>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{inspection.projectName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <InspectionStatusBadge status={inspection.status} />
            <PriorityBadge priority={inspection.priority} />
            <RiskBadge level={inspection.riskLevel} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(inspection.status === 'pending' || inspection.status === 'overdue') && (
            <button
              type="button"
              onClick={() => setAssigning(true)}
              className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-900"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {inspection.assignedTeamId || inspection.assignedInspectorId ? 'Reassign' : 'Assign Inspector'}
            </button>
          )}
          {inspection.status === 'assigned' && (
            <button
              type="button"
              disabled={actionPending}
              onClick={() => runAction(acceptInspection)}
              className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Mark Accepted
            </button>
          )}
          {inspection.status === 'scheduled' && (
            <button
              type="button"
              disabled={actionPending}
              onClick={() => runAction(startInspection)}
              className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Start Inspection
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelling(true)}
              className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3.5 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <nav aria-label="Inspection sections" className="flex flex-wrap gap-1 border-b border-plum-950/10 px-3 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`rounded-t-lg px-3 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab ? 'border-b-2 border-plum-800 text-plum-800' : 'text-plum-950/55 hover:text-plum-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="p-4 sm:p-5">
          {activeTab === 'Overview' && <InspectionOverviewTab inspection={inspection} />}
          {activeTab === 'Checklist' && (
            <ChecklistPanel
              inspection={inspection}
              editable={inspection.status === 'in-progress'}
              onItemSave={async (itemId, patch) => {
                await updateChecklistItem(inspection.id, itemId, patch)
                refetch()
              }}
            />
          )}
          {activeTab === 'Evidence' && <EvidencePanel inspection={inspection} canAdd={inspection.status === 'in-progress'} onEvidenceAdded={refetch} />}
          {activeTab === 'Report' && (
            <ReportPanel inspection={inspection} canSubmit={inspection.status === 'in-progress'} canReview={inspection.status === 'completed'} onChanged={refetch} />
          )}
          {activeTab === 'Timeline' && <InspectionTimeline timeline={inspection.timeline} cancelled={inspection.status === 'cancelled'} />}
          {activeTab === 'History' && <HistoryTab inspection={inspection} />}
        </div>
      </div>

      {assigning && (
        <AiAssignmentDialog
          inspection={inspection}
          onClose={() => setAssigning(false)}
          onAssigned={() => {
            setAssigning(false)
            refetch()
          }}
        />
      )}

      {cancelling && (
        <ConfirmDialog
          title="Cancel Inspection"
          message={`Cancel ${inspection.id} for ${inspection.projectName}? This cannot be undone.`}
          confirmLabel="Cancel Inspection"
          tone="danger"
          confirming={actionPending}
          onConfirm={async () => {
            setActionPending(true)
            try {
              await cancelInspection(inspection.id)
              setCancelling(false)
              refetch()
            } finally {
              setActionPending(false)
            }
          }}
          onClose={() => setCancelling(false)}
        />
      )}
    </div>
  )
}
