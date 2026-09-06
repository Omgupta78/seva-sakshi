import { useState } from 'react'
import { MonitorPlay, ShieldCheck, PhoneIncoming, Video } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import LiveVideoCall from '../../components/video/LiveVideoCall.jsx'

export default function InstitutionVideoCheck() {
  const { user } = useAuth()
  const [liveCall, setLiveCall] = useState(false)

  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Video Check</h1>
        <p className="text-sm text-plum-950/60">Join a live video call with the Department or an inspector.</p>
      </div>

      {/* Real WebRTC 2-device call */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#138808]/25 bg-green-50/50 p-4 shadow-sm sm:p-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950"><Video className="h-4 w-4 text-[#16794f]" aria-hidden="true" /> Live Video Call — real WebRTC</h2>
          <p className="mt-0.5 text-xs text-plum-950/60">Open the call, then paste the code shared by the Department/inspector (or share yours). Uses your real camera and microphone.</p>
        </div>
        <button type="button" onClick={() => setLiveCall(true)} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#138808] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f6b06]">
          <Video className="h-4 w-4" aria-hidden="true" /> Join Live Video Call
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        The live call is peer-to-peer WebRTC and is never recorded. The Department's "Random Video Check" workflow requires an enterprise signaling service and is shown as not configured until connected.
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><PhoneIncoming className="h-4 w-4 text-plum-800" aria-hidden="true" /> Random video-check requests</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-plum-950/15 bg-plum-50/40 px-6 py-12 text-center">
          <MonitorPlay className="h-8 w-8 text-plum-950/25" aria-hidden="true" />
          <p className="text-sm font-semibold text-plum-950">No active random video check</p>
          <p className="max-w-sm text-xs text-plum-950/55">Automated random video checks need a signaling service (not configured). For a direct call, use the Live Video Call above.</p>
        </div>
      </div>

      {liveCall && <LiveVideoCall title="Institution — Live Video Call" subtitle={user?.institutionName ?? user?.name} onClose={() => setLiveCall(false)} />}
    </div>
  )
}
