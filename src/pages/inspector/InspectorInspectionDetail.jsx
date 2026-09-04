import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, PlayCircle, Camera, ChevronRight, CheckCircle2, MapPin, Clock, Building2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useGeolocation } from '../../hooks/useGeolocation.js'
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js'
import { useLocalDraft } from '../../hooks/useLocalDraft.js'
import { getInspection, startInspection, updateChecklistItem, saveFieldVerification, submitReport } from '../../services/inspectionsService.js'
import { PROJECTS } from '../../data/projectsSeedData.js'
import { projectCoordinates, haversineKm, VERIFICATION_RADIUS_KM } from '../../data/geoData.js'
import { InspectionStatusBadge, PriorityBadge } from '../../components/officer/table/Badges.jsx'
import { typeLabel } from '../../data/inspectionModels.js'
import GeoVerificationPanel from '../../components/inspector/GeoVerificationPanel.jsx'
import MobileChecklist from '../../components/inspector/MobileChecklist.jsx'
import FieldVerificationForm from '../../components/inspector/FieldVerificationForm.jsx'
import SubmitReportSheet from '../../components/inspector/SubmitReportSheet.jsx'

const emptyVerification = {
  staffInterviewed: '',
  beneficiariesInterviewed: '',
  staffRoles: '',
  beneficiaryGroup: '',
  observation: '',
  comments: '',
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 border-b border-plum-950/5 py-2 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-plum-950/40" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-plum-950/50 uppercase">{label}</p>
        <p className="text-sm font-medium break-words text-plum-950">{value}</p>
      </div>
    </div>
  )
}

export default function InspectorInspectionDetail() {
  const { id } = useParams()
  const online = useOnlineStatus()
  const geo = useGeolocation()

  const { data: inspection, loading, error, refetch } = useAsync(() => getInspection(id), [id])
  const [starting, setStarting] = useState(false)
  const [savingVerification, setSavingVerification] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [verification, setVerification, clearVerificationDraft] = useLocalDraft(`verification:${id}`, emptyVerification)

  const projectCoords = useMemo(() => {
    if (!inspection) return null
    const project = PROJECTS.find((p) => p.id === inspection.projectId)
    return projectCoordinates(project, inspection.district)
  }, [inspection])

  // Prefer a live fix; fall back to whatever was recorded when the inspection was started.
  const currentCoords = geo.coords ?? inspection?.startLocation ?? null
  const distanceKm = currentCoords && projectCoords ? haversineKm(currentCoords, projectCoords) : null

  if (loading) return <p className="py-10 text-center text-sm text-plum-950/50">Loading inspection…</p>
  if (error || !inspection) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-plum-950">Inspection not found.</p>
        <Link to="/inspector/inspections" className="mt-2 inline-block text-sm text-plum-800">
          Back to my inspections
        </Link>
      </div>
    )
  }

  const canStart = ['assigned', 'scheduled', 'overdue'].includes(inspection.status)
  const inProgress = inspection.status === 'in-progress'
  const isComplete = inspection.status === 'completed'

  async function handleStart() {
    setStarting(true)
    try {
      // Ask for location at the moment it's needed, then start regardless —
      // a denied permission must not block fieldwork, it just leaves the
      // location unverified on the record.
      const coords = await geo.request()
      const dist = coords && projectCoords ? haversineKm(coords, projectCoords) : null
      await startInspection(inspection.id, {
        startedAt: new Date().toISOString().slice(0, 19),
        coords,
        distanceKm: dist,
        locationVerified: dist !== null && dist <= VERIFICATION_RADIUS_KM,
      })
      refetch()
    } finally {
      setStarting(false)
    }
  }

  async function handleSaveVerification() {
    setSavingVerification(true)
    try {
      await saveFieldVerification(inspection.id, verification)
      refetch()
    } finally {
      setSavingVerification(false)
    }
  }

  async function handleSubmitReport(composed) {
    setSubmitting(true)
    try {
      await submitReport(inspection.id, composed)
      clearVerificationDraft()
      setShowSubmit(false)
      setSubmitted(true)
      refetch()
    } finally {
      setSubmitting(false)
    }
  }

  const assessedCount = inspection.checklist.filter((c) => c.status).length

  return (
    <div className="space-y-4">
      <Link to="/inspector/inspections" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-plum-800 no-underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        My Inspections
      </Link>

      {submitted && (
        <div className="flex items-start gap-2 rounded-2xl bg-green-50 p-4 text-[#16794f]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-bold">Inspection report submitted successfully.</p>
        </div>
      )}

      <section className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
        <p className="font-mono text-xs font-semibold text-plum-950/50">{inspection.id}</p>
        <h1 className="mt-0.5 text-lg font-extrabold text-plum-950">{inspection.projectName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <InspectionStatusBadge status={inspection.status} />
          <PriorityBadge priority={inspection.priority} />
        </div>

        <div className="mt-3">
          <InfoRow icon={Building2} label="Organization" value={inspection.organizationName} />
          <InfoRow icon={MapPin} label="Location" value={`${inspection.district}, ${inspection.state}`} />
          <InfoRow icon={Clock} label="Scheduled" value={`${inspection.scheduledDate} · ${typeLabel(inspection.type)}`} />
          <InfoRow icon={CheckCircle2} label="Inspector" value={inspection.teamName} />
        </div>

        {canStart && (
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D6262B] text-base font-bold text-white active:bg-[#a91f24] disabled:opacity-60"
          >
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
            {starting ? 'Starting…' : 'Start Inspection'}
          </button>
        )}
        {canStart && <p className="mt-2 text-center text-xs text-plum-950/50">Starting records the time and asks for your location.</p>}
      </section>

      {(inProgress || isComplete) && (
        <>
          <GeoVerificationPanel
            projectCoords={projectCoords}
            currentCoords={currentCoords}
            distanceKm={distanceKm}
            status={geo.status}
            error={geo.error}
            onRequest={geo.request}
            onSimulate={() => geo.simulateAt(projectCoords)}
            compact={isComplete}
          />

          <Link
            to={`/inspector/inspections/${inspection.id}/evidence`}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-plum-950/10 bg-white p-4 no-underline shadow-sm active:bg-plum-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum-50 text-plum-800">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-plum-950">Evidence</span>
              <span className="block text-xs text-plum-950/60">
                {inspection.evidence.length} captured{inProgress ? ' · tap to add photo or video' : ''}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-plum-950/30" aria-hidden="true" />
          </Link>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-bold text-plum-950">Checklist</h2>
              <span className="text-xs font-semibold text-plum-950/50">
                {assessedCount} / {inspection.checklist.length} assessed
              </span>
            </div>
            <MobileChecklist
              checklist={inspection.checklist}
              editable={inProgress}
              onItemSave={async (itemId, patch) => {
                await updateChecklistItem(inspection.id, itemId, patch)
                refetch()
              }}
            />
          </section>

          <FieldVerificationForm
            value={inspection.fieldVerification && isComplete ? { ...emptyVerification, ...inspection.fieldVerification } : verification}
            onChange={setVerification}
            onSave={handleSaveVerification}
            saving={savingVerification}
            disabled={!inProgress}
          />
        </>
      )}

      {inProgress && (
        <div className="sticky bottom-20 z-20">
          <button
            type="button"
            onClick={() => setShowSubmit(true)}
            disabled={!online}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-plum-800 text-base font-bold text-white shadow-lg active:bg-plum-900 disabled:opacity-60"
          >
            Review & Submit Report
          </button>
          {!online && <p className="mt-2 text-center text-xs font-medium text-[#a15c00]">Submission needs a connection — your notes are saved on this device.</p>}
        </div>
      )}

      {isComplete && inspection.report && (
        <section className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-plum-950">Submitted Report</h2>
          <p className="text-sm text-plum-950/80">{inspection.report.summary}</p>
          <p className="mt-2 text-xs text-plum-950/50">
            Submitted by {inspection.report.submittedBy} · {inspection.report.status === 'reviewed' ? 'Reviewed' : 'Pending review'}
          </p>
        </section>
      )}

      {showSubmit && (
        <SubmitReportSheet
          inspection={{ ...inspection, fieldVerification: inspection.fieldVerification ?? verification }}
          distanceKm={distanceKm}
          onClose={() => setShowSubmit(false)}
          onSubmit={handleSubmitReport}
          submitting={submitting}
        />
      )}
    </div>
  )
}
