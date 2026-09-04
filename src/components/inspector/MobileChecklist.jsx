import { useState } from 'react'

const OPTIONS = [
  { value: 'compliant', label: 'Compliant', active: 'bg-[#138808] text-white border-[#138808]' },
  { value: 'partially-compliant', label: 'Partially Compliant', active: 'bg-[#e2a610] text-white border-[#e2a610]' },
  { value: 'non-compliant', label: 'Non-Compliant', active: 'bg-[#D6262B] text-white border-[#D6262B]' },
  { value: 'not-applicable', label: 'N/A', active: 'bg-plum-800 text-white border-plum-800' },
]

function ChecklistItemMobile({ item, editable, onSave }) {
  const [status, setStatus] = useState(item.status ?? '')
  const [remarks, setRemarks] = useState(item.remarks ?? '')
  const [saving, setSaving] = useState(false)

  async function pick(value) {
    if (!editable) return
    const next = status === value ? '' : value
    setStatus(next)
    setSaving(true)
    await onSave({ status: next || null })
    setSaving(false)
  }

  async function saveRemarks() {
    if (!editable || remarks === item.remarks) return
    setSaving(true)
    await onSave({ remarks })
    setSaving(false)
  }

  return (
    <li className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-plum-950">{item.category}</h3>
        {saving && <span className="shrink-0 text-xs text-plum-950/40">Saving…</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const selected = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              disabled={!editable}
              aria-pressed={selected}
              // min-h-12 = comfortable thumb target on a phone
              className={`min-h-12 rounded-xl border-2 px-2 text-sm font-bold transition-colors disabled:opacity-60 ${
                selected ? opt.active : 'border-plum-950/15 bg-white text-plum-950/70'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <input
        type="text"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        onBlur={saveRemarks}
        disabled={!editable}
        placeholder="Remarks (optional)"
        aria-label={`${item.category} remarks`}
        className="mt-2.5 min-h-12 w-full rounded-xl border border-plum-950/15 px-3 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none disabled:bg-plum-50/40"
      />
    </li>
  )
}

export default function MobileChecklist({ checklist, editable, onItemSave }) {
  if (checklist.length === 0) {
    return <p className="rounded-2xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No checklist areas configured.</p>
  }
  return (
    <ul className="space-y-3">
      {checklist.map((item) => (
        <ChecklistItemMobile key={item.id} item={item} editable={editable} onSave={(patch) => onItemSave(item.id, patch)} />
      ))}
    </ul>
  )
}
