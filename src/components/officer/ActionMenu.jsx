import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

/**
 * Compact three-dot actions menu, so tables aren't cluttered with buttons.
 * `items` is an array of { label, icon, onClick, tone?: 'danger', hidden?,
 * disabled? }. Falsy items and `hidden` items are skipped.
 */
export default function ActionMenu({ items, label = 'Actions' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const visible = (items ?? []).filter((i) => i && !i.hidden)
  if (visible.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-plum-800 hover:bg-plum-50"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-plum-950/10 bg-white py-1 shadow-xl">
          {visible.map((it, i) => {
            const Icon = it.icon
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick() }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-40 ${it.tone === 'danger' ? 'text-[#D6262B] hover:bg-red-50' : 'text-plum-950 hover:bg-plum-50'}`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                {it.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
