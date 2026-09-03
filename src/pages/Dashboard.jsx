import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLangProvider, useDashboardLang } from '../context/DashboardLangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import FilterBar from '../components/dashboard/FilterBar.jsx'
import KpiCard from '../components/dashboard/KpiCard.jsx'
import StateMap from '../components/dashboard/StateMap.jsx'
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx'
import OngoingInspectionsTable from '../components/dashboard/OngoingInspectionsTable.jsx'
import AnomalyAlertsPanel from '../components/dashboard/AnomalyAlertsPanel.jsx'
import Modal from '../components/Modal.jsx'
import { INSTITUTES, ONGOING_INSPECTIONS, ANOMALY_ALERTS, KPI_TRENDS } from '../data/dashboardSampleData.js'

const FS_MIN = 0.85
const FS_MAX = 1.3
const FS_STEP = 0.1

function DashboardContent() {
  const { t } = useDashboardLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [hcMode, setHcMode] = useState(false)
  const [district, setDistrict] = useState('all')
  const [scheme, setScheme] = useState('all')
  const [modal, setModal] = useState(null) // { title, body } | null

  function handleFontChange(action) {
    document.documentElement.style.setProperty(
      '--fs-scale',
      action === 'inc'
        ? Math.min(FS_MAX, +(getFsScale() + FS_STEP).toFixed(2))
        : action === 'dec'
          ? Math.max(FS_MIN, +(getFsScale() - FS_STEP).toFixed(2))
          : 1
    )
  }
  function getFsScale() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--fs-scale')
    return parseFloat(raw) || 1
  }

  const filteredInstitutes = useMemo(
    () =>
      INSTITUTES.filter(
        (i) => (district === 'all' || i.district === district) && (scheme === 'all' || i.scheme === scheme)
      ),
    [district, scheme]
  )

  const openAnomalyCount = ANOMALY_ALERTS.length
  const avgCompliance = Math.round(
    filteredInstitutes.reduce((sum, i) => sum + i.complianceScore, 0) / (filteredInstitutes.length || 1)
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleOpenProfile(institute) {
    setModal({
      title: institute.name,
      body: `${institute.type} · ${institute.district} · ${institute.scheme}. Compliance score ${institute.complianceScore}%, last inspected ${institute.lastInspection}. (Demo — a real institute profile page would open here.)`,
    })
  }
  function handleStartVc(institute) {
    setModal({
      title: t('startSurpriseVc'),
      body: `Initiating a surprise video-call inspection at ${institute?.name ?? 'the selected institute'}. (Demo — this would launch a live VC session in production.)`,
    })
  }
  function handleAssignInspection() {
    setModal({
      title: t('assignInspection'),
      body: 'Assign-inspection would open a form to pick an institute, inspector, and due date, with AI-assisted random selection available. (Demo only.)',
    })
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <DashboardHeader hcMode={hcMode} onToggleHc={() => setHcMode((v) => !v)} onFontChange={handleFontChange} user={user} onLogout={handleLogout} />

      <main id="dashboard-main" className="mx-auto max-w-[1600px] space-y-4 px-4 py-5 sm:px-6 sm:py-6">
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{t('dashboardTitle')}</h1>

        <FilterBar
          district={district}
          scheme={scheme}
          onDistrictChange={setDistrict}
          onSchemeChange={setScheme}
          onAssignInspection={handleAssignInspection}
          onStartVc={() => handleStartVc(null)}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label={t('kpiInstitutes')} value={filteredInstitutes.length || INSTITUTES.length} trend={KPI_TRENDS.institutesMonitored} accent="#3a1d70" />
          <KpiCard label={t('kpiInspectionsToday')} value={ONGOING_INSPECTIONS.length + 8} trend={KPI_TRENDS.inspectionsToday} accent="#138808" />
          <KpiCard label={t('kpiOpenAnomalies')} value={openAnomalyCount} trend={KPI_TRENDS.openAnomalies} emphasize />
          <KpiCard label={t('kpiAvgCompliance')} value={`${avgCompliance}%`} trend={KPI_TRENDS.avgCompliance} accent="#e2a610" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <StateMap institutes={filteredInstitutes.length ? filteredInstitutes : INSTITUTES} onOpenProfile={handleOpenProfile} onStartVc={handleStartVc} />
          </div>
          <div className="xl:col-span-2">
            <ActivityFeed />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <OngoingInspectionsTable inspections={ONGOING_INSPECTIONS} />
          <AnomalyAlertsPanel alerts={ANOMALY_ALERTS} />
        </div>
      </main>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          {modal.body}
        </Modal>
      )}
    </div>
  )
}

/** Landed on after login: /dashboard, protected by ProtectedRoute. */
export default function Dashboard() {
  return (
    <DashboardLangProvider>
      <DashboardContent />
    </DashboardLangProvider>
  )
}
