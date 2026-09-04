import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Map, Bell, Play, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listCameras, getCctvHealth, getCctvFilterOptions, listCctvAlerts } from '../../services/cctvService.js'
import StatCard from '../../components/officer/StatCard.jsx'
import DataTable from '../../components/officer/table/DataTable.jsx'
import CctvFilters from '../../components/officer/cctv/CctvFilters.jsx'
import CameraCard from '../../components/officer/cctv/CameraCard.jsx'
import CameraStatusBadge from '../../components/officer/cctv/CameraStatusBadge.jsx'
import CctvMap from '../../components/officer/cctv/CctvMap.jsx'
import CctvAlertsPanel from '../../components/officer/cctv/CctvAlertsPanel.jsx'
import { formatDateTime, timeAgo } from '../../components/officer/cctv/time.js'

const initialFilters = { search: '', state: 'all', district: 'all', projectId: 'all', organizationId: 'all', status: 'all' }

const TABS = [
  { id: 'grid', label: 'Camera Grid', icon: LayoutGrid },
  { id: 'list', label: 'Camera List', icon: List },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: Bell },
]

export default function CctvMonitoring() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [tab, setTab] = useState('grid')

  const { data: camData, loading } = useAsync(() => listCameras(filters), [JSON.stringify(filters)])
  const { data: health } = useAsync(() => getCctvHealth(), [])
  const { data: options } = useAsync(() => getCctvFilterOptions(), [])
  const { data: alertData, loading: alertsLoading } = useAsync(() => listCctvAlerts(), [])

  const cameras = camData?.items ?? []
  const alerts = alertData?.items ?? []

  const listColumns = [
    { key: 'id', label: 'Camera ID', render: (r) => <span className="font-mono text-xs font-semibold text-plum-950">{r.id}</span> },
    { key: 'projectName', label: 'Project', render: (r) => <span className="block max-w-[200px] truncate font-semibold text-plum-950">{r.projectName}</span> },
    { key: 'label', label: 'Placement' },
    { key: 'location', label: 'Location', render: (r) => `${r.district}, ${r.state}` },
    { key: 'status', label: 'Status', render: (r) => <CameraStatusBadge status={r.status} /> },
    { key: 'lastHeartbeat', label: 'Last Heartbeat', render: (r) => timeAgo(r.lastHeartbeat) },
    { key: 'lastUpdated', label: 'Last Updated', render: (r) => formatDateTime(r.lastUpdated) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/officer/cctv/${r.id}`) }}
          className="flex items-center gap-1 rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-plum-700"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" /> View Live
        </button>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Live CCTV Monitoring</h1>
        <p className="text-sm text-plum-950/60">Camera health and live view across monitored projects and institutes.</p>
      </div>

      {/* Honest scope banner — no real government CCTV is connected. */}
      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p>
          <span className="font-semibold text-plum-950">Demonstration environment.</span> Feeds shown here are simulated sample
          streams, not live government cameras. The architecture supports RTSP / WebRTC / HLS sources through a secure gateway once real cameras are connected.
        </p>
      </div>

      {/* CCTV health */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Cameras" value={health?.total ?? '—'} accent="#3a1d70" />
        <StatCard label="Online" value={health?.online ?? '—'} accent="#138808" />
        <StatCard label="Offline" value={health?.offline ?? '—'} emphasize />
        <StatCard label="Warning" value={health?.warning ?? '—'} accent="#e2a610" />
      </div>

      <CctvFilters filters={filters} onChange={setFilters} options={options ?? { states: [], districts: [], projects: [], organizations: [] }} />

      {/* View tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-plum-950/10 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          const badge = t.id === 'alerts' ? alerts.length : null
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-plum-800 text-white' : 'text-plum-950/70 hover:bg-plum-50'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
              {badge != null && badge > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-white/20 text-white' : 'bg-[#D6262B]/10 text-[#D6262B]'}`}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'grid' && (
        loading ? (
          <p className="py-12 text-center text-sm text-plum-950/50">Loading cameras…</p>
        ) : cameras.length === 0 ? (
          <EmptyCameras />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cameras.map((cam) => <CameraCard key={cam.id} camera={cam} />)}
          </div>
        )
      )}

      {tab === 'list' && (
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <DataTable
            columns={listColumns}
            rows={cameras}
            loading={loading}
            onRowClick={(r) => navigate(`/officer/cctv/${r.id}`)}
            emptyMessage="No cameras match these filters."
          />
        </div>
      )}

      {tab === 'map' && <CctvMap cameras={cameras} />}

      {tab === 'alerts' && <CctvAlertsPanel alerts={alerts} loading={alertsLoading} />}
    </div>
  )
}

function EmptyCameras() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-plum-950/15 bg-white/60 px-6 py-16 text-center">
      <LayoutGrid className="mb-2 h-8 w-8 text-plum-950/25" aria-hidden="true" />
      <p className="text-sm font-semibold text-plum-950">No cameras match these filters.</p>
      <p className="mt-1 text-xs text-plum-950/55">Try clearing a filter to widen the search.</p>
    </div>
  )
}
