import { Camera, Video, FileText, MessageSquare, MapPin } from 'lucide-react'
import { formatCoords } from '../../data/geoData.js'

const ICONS = { photo: Camera, video: Video, document: FileText, text: MessageSquare }

function formatTimestamp(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Gallery of everything captured for this inspection, each tile carrying its own capture metadata. */
export default function EvidenceGallery({ evidence }) {
  if (evidence.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">
        No evidence captured yet.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {evidence.map((item) => {
        const Icon = ICONS[item.type] ?? FileText
        return (
          <li key={item.id} className="overflow-hidden rounded-2xl border border-plum-950/10 bg-white shadow-sm">
            {item.previewUrl && item.type === 'photo' && (
              <img src={item.previewUrl} alt={item.description} className="h-40 w-full object-cover" />
            )}
            {item.previewUrl && item.type === 'video' && <video src={item.previewUrl} controls className="h-40 w-full bg-black object-cover" />}
            {!item.previewUrl && (
              <div className="flex h-24 items-center justify-center bg-plum-50">
                <Icon className="h-8 w-8 text-plum-800/40" aria-hidden="true" />
              </div>
            )}

            <div className="p-3">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" />
                <span className="text-[11px] font-bold tracking-wide text-plum-950/50 uppercase">{item.type}</span>
              </div>
              <p className="mt-1 text-sm text-plum-950">{item.description}</p>
              {item.fileRef && <p className="mt-0.5 truncate text-[11px] text-plum-950/40">{item.fileRef}</p>}

              <dl className="mt-2 space-y-0.5 text-[11px] text-plum-950/50">
                <div className="flex justify-between gap-2">
                  <dt>Captured</dt>
                  <dd className="text-right">{formatTimestamp(item.timestamp)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Inspector</dt>
                  <dd className="text-right">{item.inspector}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Inspection</dt>
                  <dd className="text-right font-mono">{item.inspectionId}</dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    GPS
                  </dt>
                  <dd className="text-right font-mono">{item.coords ? formatCoords(item.coords) : item.location}</dd>
                </div>
              </dl>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
