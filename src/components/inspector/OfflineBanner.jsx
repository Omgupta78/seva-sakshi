import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  return (
    <div className="flex items-start gap-2 bg-[#a15c00] px-4 py-2.5 text-white">
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-snug">
        You're offline. Notes and checklist entries are saved on this device — submit the report once you're back
        online.
      </p>
    </div>
  )
}
