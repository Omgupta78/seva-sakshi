import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ScanFace, Play, Repeat, SlidersHorizontal, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../../data/rbac.js'
import { useAsync } from '../../../hooks/useAsync.js'
import {
  listSessions, listStudents, recognizeFrame, markAttendance, listRecords, getAttendanceConfig, correctAttendance,
} from '../../../services/attendanceService.js'
import CameraCapture from '../../../components/officer/attendance/CameraCapture.jsx'
import DemoScenarioSelect from '../../../components/officer/attendance/DemoScenarioSelect.jsx'
import PipelineTrace from '../../../components/officer/attendance/PipelineTrace.jsx'
import RecognitionResult from '../../../components/officer/attendance/RecognitionResult.jsx'
import LivenessCheck from '../../../components/officer/attendance/LivenessCheck.jsx'
import AttendanceRecordsTable from '../../../components/officer/attendance/AttendanceRecordsTable.jsx'
import ConfirmActionModal from '../../../components/officer/ConfirmActionModal.jsx'
import { SessionStatusBadge } from '../../../components/officer/attendance/Badges.jsx'

const REACHED = {
  'no-face': ['camera', 'detect'],
  'multiple-faces': ['camera', 'detect'],
  'low-quality': ['camera', 'detect', 'align'],
  unknown: ['camera', 'detect', 'align', 'embed', 'compare', 'threshold', 'decision'],
  candidate: ['camera', 'detect', 'align', 'embed', 'compare', 'threshold', 'candidate'],
}

export default function AttendanceLive() {
  const { user, hasPermission } = useAuth()
  const toast = useToast()
  const [correcting, setCorrecting] = useState(null) // record pending correction
  const [params] = useSearchParams()

  const { data: sessionData } = useAsync(() => listSessions(), [])
  const { data: studentData } = useAsync(() => listStudents({}), [])
  const { data: config } = useAsync(() => getAttendanceConfig(), [])

  const sessions = (sessionData?.items ?? []).filter((s) => s.status === 'active')
  const students = studentData?.items ?? []

  const [sessionId, setSessionId] = useState('')
  const [threshold, setThreshold] = useState(0.62)
  const [ready, setReady] = useState(false)
  const [simMode, setSimMode] = useState(false)
  const [scenario, setScenario] = useState({ scenario: 'one', identityToken: 'unknown-person', label: 'Unknown person' })
  const [result, setResult] = useState(null)
  const [pipeline, setPipeline] = useState({ reachedKeys: [], activeKey: null })
  const [processing, setProcessing] = useState(false)
  const [candidate, setCandidate] = useState(null) // awaiting liveness
  const [notice, setNotice] = useState(null)
  const [auto, setAuto] = useState(false)
  const autoRef = useRef(null)

  const { data: recordData, refetch: refetchRecords } = useAsync(() => listRecords(sessionId), [sessionId])

  useEffect(() => { if (config) setThreshold(config.matchThreshold) }, [config])
  useEffect(() => {
    const q = params.get('session')
    if (q) setSessionId(q)
  }, [params])
  // default the demo scenario to the first enrolled student once loaded
  useEffect(() => {
    const first = students.find((s) => s.enrollment === 'enrolled')
    if (first) setScenario({ scenario: 'one', identityToken: first.id, label: first.name })
  }, [studentData]) // eslint-disable-line react-hooks/exhaustive-deps

  const canScan = (ready || simMode) && sessionId && !processing && !candidate

  async function doScan() {
    if (!sessionId) { setNotice('Select an active session first.'); return }
    setProcessing(true)
    setNotice(null)
    setCandidate(null)
    setPipeline({ reachedKeys: ['camera'], activeKey: 'detect' })
    const res = await recognizeFrame({ ...scenario, threshold })
    setResult(res)
    if (res.status === 'recognized') {
      setPipeline({ reachedKeys: REACHED.candidate, activeKey: 'liveness' })
      setCandidate(res)
    } else {
      setPipeline({ reachedKeys: REACHED[res.status] ?? ['camera', 'detect'], activeKey: null })
    }
    setProcessing(false)
  }

  async function onLivenessPass() {
    const c = candidate
    setCandidate(null)
    setPipeline({ reachedKeys: [...REACHED.candidate, 'liveness', 'decision'], activeKey: null })
    const res = await markAttendance(sessionId, { studentId: c.studentId, matchScore: c.matchScore, officerId: user?.employeeId })
    if (res.duplicate) setNotice(`${c.studentName} is already marked present in this session — no duplicate record created.`)
    else setNotice(`${c.studentName} marked present.`)
    refetchRecords()
  }

  function onLivenessFail() {
    setCandidate(null)
    setNotice('Liveness not confirmed — attendance not marked. Re-scan when ready.')
    setPipeline((p) => ({ ...p, activeKey: null }))
  }

  // Controlled auto-scan: at most one pass per interval, paused while a
  // candidate awaits liveness (never runs recognition on every frame).
  useEffect(() => {
    if (!auto) { clearInterval(autoRef.current); return }
    autoRef.current = setInterval(() => {
      if (!processing && !candidate && (ready || simMode) && sessionId) doScan()
    }, config?.frameIntervalMs ?? 1500)
    return () => clearInterval(autoRef.current)
  }, [auto, processing, candidate, ready, simMode, sessionId, scenario, threshold]) // eslint-disable-line react-hooks/exhaustive-deps

  const records = recordData?.items ?? []
  const activeSession = sessions.find((s) => s.id === sessionId)

  return (
    <div className="space-y-4">
      {/* Session bar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <label htmlFor="live-session" className="text-sm font-semibold text-plum-950">Session</label>
        <select id="live-session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="min-w-[240px] flex-1 rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none">
          <option value="" disabled>Select an active session…</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.subject} — {s.projectName} ({s.id})</option>)}
        </select>
        {activeSession && <SessionStatusBadge status={activeSession.status} />}
        {sessions.length === 0 && <Link to="/officer/attendance" className="text-xs font-semibold text-plum-800 hover:underline">No active session — create one</Link>}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: camera + controls */}
        <div className="space-y-3">
          <CameraCapture onStatusChange={(s) => setReady(s === 'live')} onUseSimulation={() => setSimMode(true)}>
            {processing && (
              <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-white/10">
                <div className="h-full w-1/3 animate-pulse bg-[#138808]" />
              </div>
            )}
          </CameraCapture>

          {simMode && <p className="rounded-lg bg-plum-50 p-2 text-[11px] text-plum-950/60">Camera unavailable — running in demo simulation. No real image is captured.</p>}

          <DemoScenarioSelect mode="live" students={students} value={scenario} onChange={setScenario} />

          {/* Threshold + scan controls */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-plum-950/10 bg-white p-3">
            <div className="flex items-center gap-2 text-xs text-plum-950/70">
              <SlidersHorizontal className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" />
              <label htmlFor="thr">Threshold {threshold.toFixed(2)}</label>
              <input id="thr" type="range" min="0.4" max="0.9" step="0.02" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-plum-800" />
            </div>
            <button type="button" onClick={doScan} disabled={!canScan} className="ml-auto flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-50">
              <Play className="h-4 w-4" aria-hidden="true" /> Scan
            </button>
            <button type="button" onClick={() => setAuto((a) => !a)} disabled={!(ready || simMode) || !sessionId} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${auto ? 'border-[#138808]/40 bg-green-50 text-[#16794f]' : 'border-plum-950/15 text-plum-800 hover:bg-plum-50'}`}>
              <Repeat className="h-4 w-4" aria-hidden="true" /> {auto ? 'Auto-scan on' : 'Auto-scan'}
            </button>
          </div>

          {notice && (
            <p className="flex items-center gap-1.5 rounded-lg bg-plum-50 p-2.5 text-sm text-plum-950/75">
              <AlertCircle className="h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" /> {notice}
            </p>
          )}
        </div>

        {/* Right: pipeline + result */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ScanFace className="h-4 w-4 text-plum-800" aria-hidden="true" /> Recognition pipeline</h2>
            <PipelineTrace activeKey={pipeline.activeKey} reachedKeys={pipeline.reachedKeys} />
          </div>

          <RecognitionResult result={result} processing={processing} />

          {candidate && (
            <LivenessCheck candidateName={candidate.studentName} onPass={onLivenessPass} onFail={onLivenessFail} />
          )}
        </div>
      </div>

      {/* Marked list */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-plum-950">Marked Present {activeSession ? `— ${activeSession.subject}` : ''}</h2>
          <span className="rounded-full bg-plum-50 px-2 py-0.5 text-xs font-semibold text-plum-800">{records.length}</span>
        </div>
        <AttendanceRecordsTable records={records} onCorrect={hasPermission(PERMISSIONS.ATTENDANCE_CORRECT) ? setCorrecting : undefined} />
        <p className="mt-2 text-[11px] text-plum-950/45">Attendance records are never deleted. Authorised officers may correct a record with a reason — the original value is preserved in the audit trail.</p>
      </div>

      {correcting && (
        <ConfirmActionModal
          title="Correct attendance record?"
          description={`Change ${correcting.studentName}'s status from "${correcting.status}" to "${correcting.status === 'present' ? 'absent' : 'present'}"? The original value and your reason are stored in the audit trail.`}
          reasonRequired reasonPlaceholder="e.g. Duplicate / incorrect recognition"
          confirmLabel="Save correction" loadingLabel="Saving…"
          onConfirm={async (reason) => {
            const newStatus = correcting.status === 'present' ? 'absent' : 'present'
            await correctAttendance(correcting.id, newStatus, reason)
            toast.success('Attendance record corrected.')
            setCorrecting(null)
            refetchRecords()
          }}
          onClose={() => setCorrecting(null)}
        />
      )}
    </div>
  )
}
