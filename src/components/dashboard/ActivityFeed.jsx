import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ClipboardCheck, Video } from 'lucide-react'
import { ACTIVITY_FEED_SEED, ACTIVITY_FEED_TEMPLATES, INSTITUTES } from '../../data/dashboardSampleData.js'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'

const ICONS = { anomaly: AlertTriangle, inspection: ClipboardCheck, vc: Video }
const ICON_COLOR = { anomaly: 'text-[#D6262B] bg-red-50', inspection: 'text-plum-800 bg-plum-50', vc: 'text-[#16794f] bg-green-50' }

let nextId = ACTIVITY_FEED_SEED.length + 1

function makeEvent() {
  const template = ACTIVITY_FEED_TEMPLATES[Math.floor(Math.random() * ACTIVITY_FEED_TEMPLATES.length)]
  const institute = INSTITUTES[Math.floor(Math.random() * INSTITUTES.length)]
  return {
    id: `act-${nextId++}`,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    type: template.type,
    text: template.text(institute),
  }
}

/** Simulated real-time event stream — a new item appears every few seconds. */
export default function ActivityFeed() {
  const { t } = useDashboardLang()
  const [events, setEvents] = useState(ACTIVITY_FEED_SEED)
  const [freshId, setFreshId] = useState(null)
  const listRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const id = setInterval(
      () => {
        const event = makeEvent()
        setEvents((prev) => [event, ...prev].slice(0, 25))
        setFreshId(event.id)
      },
      4000 + Math.random() * 3000
    )
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!freshId) return
    const t = setTimeout(() => setFreshId(null), 2200)
    return () => clearTimeout(t)
  }, [freshId])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-plum-950 sm:text-base">{t('activityFeedTitle')}</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16794f]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16794f] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16794f]" />
          </span>
          {t('liveLabel')}
        </span>
      </div>

      <ul ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: 360 }} aria-live="polite">
        {events.map((event) => {
          const Icon = ICONS[event.type]
          const isFresh = event.id === freshId && !reducedMotion
          return (
            <li
              key={event.id}
              className={`flex items-start gap-2.5 rounded-lg p-2 text-sm transition-colors duration-1000 ${
                isFresh ? 'bg-amber-50' : 'bg-transparent'
              }`}
            >
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ICON_COLOR[event.type]}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block leading-snug text-plum-950">{event.text}</span>
                <span className="text-xs text-plum-950/45">{event.time}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
