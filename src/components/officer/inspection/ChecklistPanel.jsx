import { useState } from 'react'
import { CHECKLIST_ITEM_STATUSES } from '../../../data/inspectionModels.js'
import { ChecklistItemBadge } from '../table/Badges.jsx'

const STATUS_LABEL = { compliant: 'Compliant', 'partially-compliant': 'Partially Compliant', 'non-compliant': 'Non-Compliant', 'not-applicable': 'Not Applicable' }

function ChecklistRow({ item, editable, onSave }) {
  const [status, setStatus] = useState(item.status ?? '')
  const [remarks, setRemarks] = useState(item.remarks ?? '')
  const [saving, setSaving] = useState(false)

  async function handleStatusChange(e) {
    const value = e.target.value
    setStatus(value)
    setSaving(true)
    await onSave({ status: value || null })
    setSaving(false)
  }

  async function handleRemarksBlur() {
    if (remarks === item.remarks) return
    setSaving(true)
    await onSave({ remarks })
    setSaving(false)
  }

  if (!editable) {
    return (
      <li className="rounded-xl border border-plum-950/10 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-plum-950">{item.category}</span>
          <ChecklistItemBadge status={item.status} />
        </div>
        {item.remarks && <p className="mt-1.5 text-sm text-plum-950/60">{item.remarks}</p>}
      </li>
    )
  }

  return (
    <li className="rounded-xl border border-plum-950/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-plum-950">{item.category}</span>
        {saving && <span className="text-xs text-plum-950/40">Saving…</span>}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[200px_1fr]">
        <select
          value={status}
          onChange={handleStatusChange}
          aria-label={`${item.category} status`}
          className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-1.5 text-sm text-plum-950 focus:outline-none"
        >
          <option value="">Not Assessed</option>
          {CHECKLIST_ITEM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onBlur={handleRemarksBlur}
          placeholder="Remarks…"
          aria-label={`${item.category} remarks`}
          className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-1.5 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none"
        />
      </div>
    </li>
  )
}

/** `editable` when the inspection is in a state where the team should still be filling it out. */
export default function ChecklistPanel({ inspection, editable, onItemSave }) {
  if (inspection.checklist.length === 0) {
    return <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No checklist areas were configured for this inspection.</p>
  }
  return <ul className="space-y-2.5">{inspection.checklist.map((item) => <ChecklistRow key={item.id} item={item} editable={editable} onSave={(patch) => onItemSave(item.id, patch)} />)}</ul>
}
