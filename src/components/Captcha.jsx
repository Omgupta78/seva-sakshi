import { RefreshCw } from 'lucide-react'

// Characters chosen to avoid visually ambiguous pairs (0/O, 1/I).
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateCaptcha(length = 5) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  }
  return code
}

/**
 * Displays the current captcha code and a refresh control.
 * The code itself is owned by the parent so it can be used for validation.
 */
export default function Captcha({ code, onRefresh }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-navy-950">Captcha</span>
      <div className="flex items-center justify-between gap-3">
        <div
          className="relative flex-1 overflow-hidden rounded-lg border border-navy-900/15 bg-sky-100 py-2.5 text-center select-none"
          aria-hidden="true"
        >
          {/* faint decorative lines for a "captcha" look */}
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <div className="absolute top-1/3 left-0 h-px w-full -rotate-3 bg-navy-900" />
            <div className="absolute top-2/3 left-0 h-px w-full rotate-2 bg-navy-900" />
          </div>
          <span className="relative font-mono text-lg font-bold tracking-[0.4em] text-navy-900">
            {code.split('').join(' ')}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-950 hover:underline"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
          Refresh
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Captcha code is {code.split('').join(', ')}
      </p>
    </div>
  )
}
