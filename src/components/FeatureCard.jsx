/**
 * Small info card used in the four-up feature grid on the hero side.
 */
export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-navy-900/10 bg-white/70 p-4 shadow-sm backdrop-blur-0 transition-shadow hover:shadow-md">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900/10">
        <Icon className="h-5 w-5 text-navy-800" aria-hidden="true" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-navy-950">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-navy-950/60">{description}</p>
    </div>
  )
}
