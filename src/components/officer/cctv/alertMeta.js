import { VideoOff, HeartPulse, WifiOff } from 'lucide-react'

/** Icon + label for each CCTV connectivity/device-health alert type. */
export const ALERT_META = {
  'camera-offline': { label: 'Camera Offline', icon: VideoOff },
  'no-heartbeat': { label: 'No Heartbeat', icon: HeartPulse },
  'connection-unstable': { label: 'Connection Unstable', icon: WifiOff },
}
