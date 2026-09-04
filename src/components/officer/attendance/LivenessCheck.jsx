import { useState } from 'react'
import { ShieldAlert, Check, X } from 'lucide-react'

const ACTIONS = [
  'Ask the person to blink twice',
  'Ask the person to turn their head slightly left, then right',
  'Ask the person to smile, then return to neutral',
  'Ask the person to nod once',
  'Ask the person to raise their right hand briefly',
]

// Rotates the guided action per mount without an impure call during render.
let actionCursor = 0

/**
 * Prototype-level liveness / anti-spoofing: a simple guided action the officer
 * confirms was performed live. This is NOT production-grade biometric security
 * — it is a basic presence check to make a printed photo or still image less
 * likely to pass, and it is labelled as such.
 */
export default function LivenessCheck({ candidateName, onPass, onFail }) {
  const [action] = useState(() => ACTIONS[actionCursor++ % ACTIONS.length])

  return (
    <div className="rounded-2xl border border-plum-800/25 bg-plum-50/60 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950">
        <ShieldAlert className="h-4 w-4 text-plum-800" aria-hidden="true" /> Liveness check
        <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-plum-800">Prototype-level anti-spoofing</span>
      </div>
      <p className="text-sm text-plum-950/80">
        Candidate: <span className="font-semibold">{candidateName}</span>
      </p>
      <p className="mt-1 rounded-lg bg-white p-2.5 text-sm text-plum-950">
        Guided action: <span className="font-semibold">{action}</span>
      </p>
      <p className="mt-2 text-[11px] text-plum-950/55">
        Confirm the person performed the action live. This basic check is not a substitute for production-grade liveness detection.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onPass} className="flex items-center gap-1.5 rounded-lg bg-[#138808] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#0f6b06]">
          <Check className="h-4 w-4" aria-hidden="true" /> Liveness confirmed
        </button>
        <button type="button" onClick={onFail} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3.5 py-2 text-sm font-semibold text-plum-800 hover:bg-white">
          <X className="h-4 w-4" aria-hidden="true" /> Failed / retry
        </button>
      </div>
    </div>
  )
}
