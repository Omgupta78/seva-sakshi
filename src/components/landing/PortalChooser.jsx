import { Link } from 'react-router-dom'
import { Building2, GraduationCap, ClipboardCheck, ArrowRight } from 'lucide-react'

const PORTALS = [
  {
    to: '/department/login',
    icon: Building2,
    label: 'Department',
    title: 'Department Portal',
    tagline: 'Monitor, Analyze & Govern',
    desc: 'Monitor projects, institutions, inspections, attendance, compliance and programme performance.',
    cta: 'Enter Department Portal',
    accent: '#00236f', // indigo/navy
    tint: 'rgba(0,35,111,0.06)',
  },
  {
    to: '/institute/login',
    icon: GraduationCap,
    label: 'Institution',
    title: 'Institute Portal',
    tagline: 'Manage, Record & Comply',
    desc: 'Manage students, attendance, institutional records and compliance activities.',
    cta: 'Enter Institute Portal',
    accent: '#006a61', // teal/green
    tint: 'rgba(0,106,97,0.07)',
  },
  {
    to: '/inspector/login',
    icon: ClipboardCheck,
    label: 'Field Inspection',
    title: 'Inspector Portal',
    tagline: 'Inspect, Verify & Report',
    desc: 'View assignments, conduct inspections, capture evidence and submit verification reports.',
    cta: 'Enter Inspector Portal',
    accent: '#3a1d70', // indigo/plum
    tint: 'rgba(58,29,112,0.06)',
  },
]

/**
 * Landing-page portal selector — the visual centerpiece and the single place a
 * user chooses which portal to enter. Three equal-width, equal-height cards in
 * one row on desktop, two on tablet, one on mobile. Equal height comes from the
 * grid stretch + a flex-1 description that pins every button to the same
 * baseline, so no card is pushed lower by longer text.
 */
export default function PortalChooser() {
  return (
    <section aria-labelledby="portal-heading" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-teal-700 uppercase">Role-based access</p>
        <h2 id="portal-heading" className="mt-1.5 text-2xl font-extrabold text-indigo-950 sm:text-[2rem]">Choose your portal</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-indigo-950/60 sm:text-[0.95rem]">Select the portal that matches your role and responsibilities.</p>
      </div>

      <div className="mt-9 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PORTALS.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.to}
              className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-indigo-950/10 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(20,19,74,0.35)]"
              style={{ '--accent': p.accent }}
            >
              {/* Top accent bar that intensifies on hover, tying the card to Seva Sakshi's palette */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100" style={{ background: p.accent }} />

              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200"
                style={{ background: p.tint, color: p.accent }}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>

              <p className="mt-5 text-[0.7rem] font-bold tracking-[0.16em] uppercase" style={{ color: p.accent }}>{p.label}</p>
              <h3 className="mt-1 text-xl font-extrabold text-indigo-950">{p.title}</h3>
              <p className="mt-0.5 text-sm font-semibold text-indigo-950/75">{p.tagline}</p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-indigo-950/60">{p.desc}</p>

              <Link
                to={p.to}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white no-underline shadow-sm transition-transform duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
                style={{ backgroundColor: p.accent, '--tw-ring-color': p.accent }}
                aria-label={p.cta}
              >
                {p.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          )
        })}
      </div>

      <p className="mx-auto mt-7 max-w-2xl text-center text-[11px] text-indigo-950/45">
        Department = Monitor · Institute = Manage · Inspector = Verify. AI assists recognition and analytics; authorised officials make the final decisions.
      </p>
    </section>
  )
}
