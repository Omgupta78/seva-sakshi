import { ShieldCheck, Users, History, FileText } from 'lucide-react'
import FeatureCard from './FeatureCard.jsx'
import BuildingWatermark from './BuildingWatermark.jsx'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Your data is protected with advanced security',
  },
  {
    icon: Users,
    title: 'Role Based Access',
    description: 'Access services based on your department role',
  },
  {
    icon: History,
    title: 'Track & Manage',
    description: 'Track applications and manage department tasks',
  },
  {
    icon: FileText,
    title: 'Reports & Analytics',
    description: 'View department reports and analytics dashboard',
  },
]

/**
 * Left-hand hero content: heading, tagline, a faint building watermark,
 * and the four feature cards.
 */
export default function HeroLeft() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle government-building watermark */}
      <BuildingWatermark className="pointer-events-none absolute top-0 left-1/2 h-[280px] w-[440px] -translate-x-[38%] text-navy-900/[0.055] sm:h-[360px] sm:w-[560px]" />

      <div className="relative">
        <p className="text-sm font-semibold tracking-wide text-navy-800 uppercase">Welcome to</p>
        <h1 className="mt-1 text-3xl leading-tight font-extrabold text-navy-950 sm:text-4xl lg:text-5xl">
          Department Service Portal
        </h1>

        <div className="mt-4 h-1 w-16 rounded-full bg-saffron-500" aria-hidden="true" />

        <p className="mt-4 text-base font-medium text-navy-900 sm:text-lg">One Portal. Many Services.</p>
        <p className="text-sm text-navy-950/60 sm:text-base">Efficient. Transparent. Secure.</p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  )
}
