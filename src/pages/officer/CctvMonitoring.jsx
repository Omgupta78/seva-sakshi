import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Map, Bell, Play, ShieldCheck, TrendingUp, Plus, Pencil, Trash2, Wifi } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listCameras, getCctvHealth, getCctvFilterOptions, listCctvAlerts, getCctvAnalytics, testCamera, deleteCamera } from '../../services/cctvService.js'
import { STREAM_MODE_LABEL } from '../../services/streamProvider.js'
import StatCard from '../../components/officer/StatCard.jsx'
import DataTable from '../../components/officer/table/DataTable.jsx'
import CctvFilters from '../../components/officer/cctv/CctvFilters.jsx'
import CameraCard from '../../components/officer/cctv/CameraCard.jsx'
import CameraStatusBadge from '../../components/officer/cctv/CameraStatusBadge.jsx'
import CctvMap from '../../components/officer/cctv/CctvMap.jsx'
import CctvAlertsPanel from '../../components/officer/cctv/CctvAlertsPanel.jsx'
import CameraFormDialog from '../../components/officer/cctv/CameraFormDialog.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import { formatDateTime, timeAgo } from '../../components/officer/cctv/time.js'

const initialFilters = { search: '', state: 'all', district: 'all', projectId: 'all', organizationId: 'all', status: 'all' }

const TABS = [
  { id: 'grid', label: 'Camera Grid', icon: LayoutGrid },
  { id: 'list', label: 'Camera List', icon: List },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
]

export default function CctvMonitoring() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.MANAGE_CCTV)
  const [filters, setFilters] = useState(initialFilters)
  const [tab, setTab] = useState('grid')
  const [formCamera, setFormCamera] = useState(null) // {} for add, camera for edit
  const [deleting, setDeleting] = useState(null)

  const { data: camData, loading, refetch } = useAsync(() => listCameras(filters), [JSON.stringify(filters)])
  const { data: health, refetch: refetchHealth } = useAsync(() => getCctvHealth(), [])
  const { data: options } = useAsync(() => getCctvFilterOptions(), [])
  const { data: alertData, loading: alertsLoading } = useAsync(() => listCctvAlerts(), [])
  const { data: analytics } = useAsync(() => getCctvAnalytics(), [])

  const cameras = camData?.items ?? []
  const alerts = alertData?.items ?? []

  function afterChange() { refetch(); refetchHealth() }

  async function handleTest(cam) {
    try {
      const r = await testCamera(cam.id)
      toast[r.ok ? 'success' : 'error'](`${cam.label}: ${r.message}${r.latencyMs ? ` (${r.latencyMs} ms)` : ''}`)
    } catch (e) { toast.error(e.message ?? 'Connection test failed.') }
  }

  async function handleDelete(reason) {
    await deleteCamera(deleting.id, reason)
    toast.success(`Camera ${deleting.id} removed.`)
    setDeleting(null)
    afterChange()
  }

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
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/officer/cctv/${r.id}`)}
            className="flex items-center gap-1 rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-plum-700"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" /> View Live
          </button>
          {canManage && (
            <ActionMenu items={[
              { label: 'Test connection', icon: Wifi, onClick: () => handleTest(r) },
              { label: 'Edit camera', icon: Pencil, onClick: () => setFormCamera(r) },
              { label: 'Delete camera', icon: Trash2, tone: 'danger', onClick: () => setDeleting(r) },
            ]} />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Live CCTV Monitoring</h1>
          <p className="text-sm text-plum-950/60">Camera health and live view across monitored projects and institutes.</p>
        </div>
        {canManage && (
          <button type="button" onClick={() => setFormCamera({})} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-700">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Camera
          </button>
        )}
      </div>

      {/* Honest scope banner — camera gateway status + seed-data label. */}
      <div className="flex items-start gap-2 rounded-xl border border-[#e2a610]/35 bg-amber-50 p-3 text-xs text-[#a15c00]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">{STREAM_MODE_LABEL}.</span> The camera inventory below is <span className="font-semibold">seed / demo data</span> — not live government cameras. Registered/edited cameras persist, but live playback needs a media gateway; opening a camera shows "{STREAM_MODE_LABEL}" rather than a fabricated feed. Architecture: RTSP → secure gateway → WebRTC/HLS → browser (see INTEGRATION-STATUS.md).
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

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Fleet Uptime" value={analytics ? `${analytics.uptimePct}%` : '—'} accent="#138808" />
            <StatCard label="Total Cameras" value={health?.total ?? '—'} accent="#3a1d70" />
            <StatCard label="Districts Covered" value={analytics?.districts.length ?? '—'} accent="#006a61" />
            <StatCard label="Needs Attention" value={analytics ? analytics.districts.filter((d) => d.uptimePct < 100).length : '—'} emphasize />
          </div>
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><TrendingUp className="h-4 w-4 text-plum-800" aria-hidden="true" /> Camera health by district</h2>
            {!analytics ? (
              <p className="py-6 text-center text-sm text-plum-950/50">Loading analytics…</p>
            ) : (
              <div className="space-y-2.5">
                {analytics.districts.map((d) => (
                  <div key={d.district} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-sm font-semibold text-plum-950">{d.district}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-plum-950/10">
                      <div className={`h-full rounded-full ${d.uptimePct >= 90 ? 'bg-[#138808]' : d.uptimePct >= 60 ? 'bg-[#e2a610]' : 'bg-[#D6262B]'}`} style={{ width: `${d.uptimePct}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold text-plum-950">{d.uptimePct}%</span>
                    <span className="w-24 shrink-0 text-right text-[11px] text-plum-950/55">{d.online}/{d.total} online</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-[11px] text-plum-950/50">Device-health uptime only (online ÷ total). No video-content analysis.</p>
          </div>
        </div>
      )}

      {formCamera && (
        <CameraFormDialog
          camera={Object.keys(formCamera).length ? formCamera : null}
          projects={(options?.projects ?? [])}
          onClose={() => setFormCamera(null)}
          onSaved={() => { setFormCamera(null); afterChange() }}
        />
      )}

      {deleting && (
        <ConfirmActionModal
          title="Delete camera?" tone="danger" reasonRequired reasonPlaceholder="e.g. hardware permanently removed"
          warning="This permanently removes the camera from the inventory."
          description={`Delete ${deleting.id} (${deleting.label})? Prefer Disable for a temporary outage.`}
          confirmLabel="Delete camera" loadingLabel="Deleting…"
          onConfirm={handleDelete} onClose={() => setDeleting(null)} />
      )}
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
