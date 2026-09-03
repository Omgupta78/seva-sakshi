import { useState } from 'react'
import { X, ExternalLink, Video, Wifi, WifiOff } from 'lucide-react'
import { RISK } from '../../data/dashboardSampleData.js'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'

const FEED_ICON = { online: Wifi, offline: WifiOff, 'no-feed': WifiOff }
const FEED_LABEL = { online: 'Live', offline: 'Offline', 'no-feed': 'No Feed' }

/**
 * Schematic (not-to-scale) state outline with institute pins colored by
 * risk. Coordinates are percentages against the 0-100 viewBox, matching
 * `x`/`y` on each institute in dashboardSampleData.js.
 */
export default function StateMap({ institutes, onOpenProfile, onStartVc }) {
  const { t } = useDashboardLang()
  const [selectedId, setSelectedId] = useState(null)
  const selected = institutes.find((i) => i.id === selectedId)

  return (
    <div className="relative rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-plum-950 sm:text-base">{t('mapTitle')}</h2>
        <span className="text-xs text-plum-950/50">{t('mapHint')}</span>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#eef0fb]">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Schematic state map with monitored institute locations">
          <path
            d="M10,15 L35,5 L60,10 L85,20 L95,40 L88,60 L92,85 L65,95 L40,90 L15,80 L5,55 L12,35 Z"
            fill="#dfe3f7"
            stroke="#c3c9ec"
            strokeWidth="0.6"
          />

          {institutes.map((inst) => {
            const risk = RISK[inst.risk]
            const isSelected = inst.id === selectedId
            return (
              <g key={inst.id} transform={`translate(${inst.x}, ${inst.y})`}>
                {isSelected && <circle r="4.5" fill={risk.color} opacity="0.25" className="animate-pulse" />}
                <circle
                  r="2.4"
                  fill={risk.color}
                  stroke="#fff"
                  strokeWidth="0.6"
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedId(inst.id)}
                />
                <circle r="2.4" fill="transparent" className="cursor-pointer" onClick={() => setSelectedId(inst.id)}>
                  <title>{inst.name}</title>
                </circle>
              </g>
            )
          })}
        </svg>

        {/* Accessible, keyboard-operable equivalents to the SVG pins (screen readers / keyboard users) */}
        <div className="sr-only">
          <ul>
            {institutes.map((inst) => (
              <li key={inst.id}>
                <button type="button" onClick={() => setSelectedId(inst.id)}>
                  {inst.name} — {RISK[inst.risk].label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <div
            role="dialog"
            aria-label={selected.name}
            className="absolute z-10 w-64 max-w-[85%] rounded-xl border border-plum-950/10 bg-white p-4 shadow-xl"
            style={
              selected.x > 50
                ? { right: `${100 - selected.x}%`, top: `${Math.min(selected.y, 68)}%` }
                : { left: `${selected.x}%`, top: `${Math.min(selected.y, 68)}%` }
            }
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-plum-950/40 hover:bg-plum-50 hover:text-plum-950"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: RISK[selected.risk].color }}
            >
              {RISK[selected.risk].label}
            </span>
            <h3 className="mt-2 pr-4 text-sm font-bold text-plum-950">{selected.name}</h3>
            <p className="text-xs text-plum-950/60">
              {selected.district} · {selected.scheme}
            </p>

            <dl className="mt-2.5 space-y-1 text-xs text-plum-950/70">
              <div className="flex justify-between gap-2">
                <dt>{t('lastInspected')}</dt>
                <dd className="font-medium text-plum-950">{selected.lastInspection}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt>{t('liveFeed')}</dt>
                <dd className="flex items-center gap-1 font-medium text-plum-950">
                  {(() => {
                    const FeedIcon = FEED_ICON[selected.liveFeed]
                    return <FeedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  })()}
                  {FEED_LABEL[selected.liveFeed]}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onOpenProfile(selected)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-plum-800 px-2 py-1.5 text-xs font-semibold text-white hover:bg-plum-900"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {t('openProfile')}
              </button>
              <button
                type="button"
                onClick={() => onStartVc(selected)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-plum-950/15 px-2 py-1.5 text-xs font-semibold text-plum-950 hover:bg-plum-50"
              >
                <Video className="h-3.5 w-3.5" aria-hidden="true" />
                VC
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-plum-950/60">
        {Object.entries(RISK).map(([key, r]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} aria-hidden="true" />
            {r.label}
          </span>
        ))}
        <span className="ml-auto italic">Schematic map — not to scale</span>
      </div>
    </div>
  )
}
