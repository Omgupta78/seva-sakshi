import { useState } from 'react'
import { Camera, Video, FileText, MessageSquare, Plus } from 'lucide-react'
import AddEvidenceDialog from './AddEvidenceDialog.jsx'

const ICONS = { photo: Camera, video: Video, document: FileText, text: MessageSquare }

function formatTimestamp(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function EvidencePanel({ inspection, canAdd, onEvidenceAdded }) {
  const [adding, setAdding] = useState(false)

  return (
    <div>
      {canAdd && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mb-3 flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Evidence
        </button>
      )}

      {inspection.evidence.length === 0 ? (
        <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No evidence uploaded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {inspection.evidence.map((item) => {
            const Icon = ICONS[item.type] ?? FileText
            return (
              <li key={item.id} className="flex items-start gap-3 rounded-xl border border-plum-950/10 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum-50 text-plum-800">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold tracking-wide text-plum-950/50 uppercase">{item.type}</span>
                    {item.fileRef && <span className="text-xs text-plum-950/40">{item.fileRef}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-plum-950">{item.description}</p>
                  <p className="mt-1 text-xs text-plum-950/45">
                    {formatTimestamp(item.timestamp)} · {item.inspector} · {item.location}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {adding && (
        <AddEvidenceDialog
          inspectionId={inspection.id}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false)
            onEvidenceAdded()
          }}
        />
      )}
    </div>
  )
}
