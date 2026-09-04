import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useGeolocation } from '../../hooks/useGeolocation.js'
import { useInspector } from '../../context/InspectorContext.jsx'
import { getInspection, addEvidence } from '../../services/inspectionsService.js'
import EvidenceCapture from '../../components/inspector/EvidenceCapture.jsx'
import EvidenceGallery from '../../components/inspector/EvidenceGallery.jsx'

export default function InspectorEvidence() {
  const { id } = useParams()
  const { inspector } = useInspector()
  const geo = useGeolocation()
  const [saving, setSaving] = useState(false)

  const { data: inspection, loading, error, refetch } = useAsync(() => getInspection(id), [id])

  if (loading) return <p className="py-10 text-center text-sm text-plum-950/50">Loading evidence…</p>
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

  const canCapture = inspection.status === 'in-progress'
  const coords = geo.coords ?? inspection.startLocation ?? null

  async function handleSave(capture) {
    setSaving(true)
    try {
      // Tag each item with a fresh fix where possible, so evidence carries
      // the location it was actually taken at, not where the visit began.
      const fresh = (await geo.request()) ?? coords
      await addEvidence(inspection.id, {
        ...capture,
        coords: fresh,
        inspectorId: inspector.id,
        inspectorName: inspector.name,
      })
      refetch()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link to={`/inspector/inspections/${inspection.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-plum-800 no-underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {inspection.id}
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-plum-950">Evidence</h1>
        <p className="text-sm text-plum-950/60">{inspection.projectName}</p>
      </div>

      {canCapture ? (
        <EvidenceCapture onSave={handleSave} coords={coords} saving={saving} />
      ) : (
        <p className="rounded-2xl bg-plum-50 p-3 text-sm text-plum-950/60">
          Evidence can only be captured while the inspection is in progress. This inspection is {inspection.status}.
        </p>
      )}

      {geo.error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-[#a15c00]">{geo.error}</p>}

      <section>
        <h2 className="mb-2 text-sm font-bold text-plum-950">
          Gallery <span className="font-normal text-plum-950/50">({inspection.evidence.length})</span>
        </h2>
        <EvidenceGallery evidence={inspection.evidence} />
      </section>
    </div>
  )
}
