import { MonitorPlay, ShieldCheck, PhoneIncoming } from 'lucide-react'

export default function InstitutionVideoCheck() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Video Check</h1>
        <p className="text-sm text-plum-950/60">Respond to random video verification requests initiated by the Department.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        Video checks are always initiated by an authorised DoSJE officer and are a demonstration feature. No real call infrastructure is connected.
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><PhoneIncoming className="h-4 w-4 text-plum-800" aria-hidden="true" /> Incoming requests</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-plum-950/15 bg-plum-50/40 px-6 py-12 text-center">
          <MonitorPlay className="h-8 w-8 text-plum-950/25" aria-hidden="true" />
          <p className="text-sm font-semibold text-plum-950">No active video check</p>
          <p className="max-w-sm text-xs text-plum-950/55">When the Department starts a video check for your institution, it will appear here with the participant and inspection context.</p>
        </div>
      </div>
    </div>
  )
}
