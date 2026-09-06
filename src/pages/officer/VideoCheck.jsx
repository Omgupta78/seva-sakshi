import { useState } from 'react'
import { Shuffle, ShieldCheck, Info, Video } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  getVideoCheckProjects,
  runRandomSelection,
  requestCall,
  listCalls,
} from '../../services/videoCheckService.js'
import ParticipantReveal from '../../components/officer/video/ParticipantReveal.jsx'
import VideoCallStage from '../../components/officer/video/VideoCallStage.jsx'
import CallRecordsTable from '../../components/officer/video/CallRecordsTable.jsx'
import LiveVideoCall from '../../components/video/LiveVideoCall.jsx'
import { isVideoConfigured, VIDEO_SERVICE } from '../../services/integrationConfig.js'

export default function VideoCheck() {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState('')
  const [selection, setSelection] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [activeCall, setActiveCall] = useState(null)
  const [liveCall, setLiveCall] = useState(false)

  const { data: projectData } = useAsync(() => getVideoCheckProjects(), [])
  const { data: callData, loading: callsLoading, refetch: refetchCalls } = useAsync(() => listCalls(), [])

  const projects = projectData ?? []
  const records = callData?.items ?? []

  async function handleStart() {
    if (!projectId) return
    setSelecting(true)
    setSelection(null)
    try {
      const result = await runRandomSelection(projectId)
      setSelection(result)
    } finally {
      setSelecting(false)
    }
  }

  async function handleReselect() {
    setSelecting(true)
    try {
      const result = await runRandomSelection(projectId)
      setSelection(result)
    } finally {
      setSelecting(false)
    }
  }

  async function handleRequestCall() {
    if (!selection?.participant) return
    setRequesting(true)
    try {
      const call = await requestCall({
        projectId,
        participant: selection.participant,
        participantType: selection.participant.type,
        context: selection.context,
        officer: { id: user?.employeeId, name: user?.name },
      })
      setActiveCall(call)
    } finally {
      setRequesting(false)
    }
  }

  function handleCloseCall() {
    setActiveCall(null)
    setSelection(null)
    refetchCalls()
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Random Video Check</h1>
        <p className="text-sm text-plum-950/60">Initiate a short, ad-hoc video interaction with a randomly selected authorised participant on a project.</p>
      </div>

      {/* Integration-status + authority banner (honest: no real video service). */}
      <div className="flex items-start gap-2 rounded-xl border border-[#e2a610]/35 bg-amber-50 p-3 text-xs text-[#a15c00]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">{isVideoConfigured() ? 'Live video service connected.' : 'Video service not configured.'}</span> {isVideoConfigured()
            ? 'Calls connect real participants through the configured signaling service.'
            : 'No signaling backend is connected, so no real person can be contacted. Your own camera/mic power the local preview only; the remote participant is simulated and clearly labelled.'}
          {' '}Calls are <span className="font-semibold">never recorded</span>; only metadata and an audit trail are stored.
        </p>
      </div>

      {/* Real WebRTC 2-device call — genuine peer-to-peer, not simulated. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#138808]/25 bg-green-50/50 p-4 shadow-sm sm:p-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950"><Video className="h-4 w-4 text-[#16794f]" aria-hidden="true" /> Live Video Call — real WebRTC (2 devices)</h2>
          <p className="mt-0.5 text-xs text-plum-950/60">Genuine peer-to-peer video. Open this on two devices, share the code, and connect. Uses your real camera and microphone.</p>
        </div>
        <button type="button" onClick={() => setLiveCall(true)} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#138808] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f6b06]">
          <Video className="h-4 w-4" aria-hidden="true" /> Start Live Video Call
        </button>
      </div>

      {/* Step 1 — select project + start */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="vc-project" className="mb-1 block text-sm font-medium text-plum-950">Project</label>
            <select
              id="vc-project"
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setSelection(null) }}
              className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none"
            >
              <option value="" disabled>Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.district}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={!projectId || selecting}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-plum-700 disabled:opacity-60"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            {selecting ? 'Selecting…' : 'Start Random Video Check'}
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-plum-950/50">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          The participant is chosen by transparent, configured rules — official contacts are weighted higher, and beneficiaries are only eligible as consenting adults.
        </p>
      </div>

      {/* Step 2 — selection result */}
      {selection && (
        <ParticipantReveal
          selection={selection}
          onReselect={handleReselect}
          onRequestCall={handleRequestCall}
          requesting={requesting}
        />
      )}

      {!selection && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-plum-950/15 bg-white/60 px-6 py-12 text-center">
          <Video className="mb-2 h-8 w-8 text-plum-950/25" aria-hidden="true" />
          <p className="text-sm font-semibold text-plum-950">Select a project and start a random video check.</p>
          <p className="mt-1 text-xs text-plum-950/55">The system will pick one eligible participant and show you why.</p>
        </div>
      )}

      {/* Records + audit */}
      <CallRecordsTable records={records} loading={callsLoading} />

      {/* Active call overlay */}
      {activeCall && <VideoCallStage call={activeCall} onClose={handleCloseCall} />}
      {liveCall && <LiveVideoCall title="Department — Live Video Call" subtitle={user?.name} onClose={() => setLiveCall(false)} />}
    </div>
  )
}
