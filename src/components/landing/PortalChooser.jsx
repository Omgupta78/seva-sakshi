import { Link } from 'react-router-dom'
import { Building2, GraduationCap, ClipboardCheck, ArrowRight } from 'lucide-react'

const PORTALS = [
  {
    to: '/department/login',
    icon: Building2,
    title: 'Department Portal',
    tagline: 'Monitor, Analyze & Govern',
    audience: 'For Department Officers & Authorities',
    desc: 'Monitor projects, institutions, inspections, attendance, CCTV, analytics and compliance.',
    cta: 'Enter Department Portal',
    accent: '#00236f', // indigo-900
    chip: 'bg-indigo-900',
  },
  {
    to: '/institute/login',
    icon: GraduationCap,
    title: 'Institute Portal',
    tagline: 'Manage, Record & Comply',
    audience: 'For Institutes, NGOs & Authorised Staff',
    desc: 'Manage students, attendance, institutional records and compliance activities.',
    cta: 'Enter Institute Portal',
    accent: '#006a61', // teal-700
    chip: 'bg-teal-700',
  },
  {
    to: '/inspector/login',
    icon: ClipboardCheck,
    title: 'Inspector Portal',
    tagline: 'Inspect, Verify & Report',
    audience: 'For Inspection Teams & Inspectors',
    desc: 'View assignments, conduct inspections, capture evidence and submit reports.',
    cta: 'Enter Inspector Portal',
    accent: '#3a1d70', // plum-800
    chip: 'bg-plum-800',
  },
]

/** Landing-page portal selector — the single place a user chooses which portal to enter. */
export default function PortalChooser() {
  return (
    <section aria-labelledby="portal-heading" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-teal-700 uppercase">Role-based access</p>
        <h2 id="portal-heading" className="mt-1 text-2xl font-extrabold text-indigo-950 sm:text-3xl">Choose your portal</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-indigo-950/60">One platform, three roles. Enter the portal that matches your responsibility — each has its own secure sign-in.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PORTALS.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.to} className="group flex flex-col rounded-2xl border border-indigo-950/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-950/20 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.chip} text-white`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-lg font-extrabold text-indigo-950">{p.title}</h3>
                  <p className="text-[11px] font-bold tracking-wide uppercase" style={{ color: p.accent }}>{p.tagline}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold text-indigo-950/50">{p.audience}</p>
              <p className="mt-1 flex-1 text-sm text-indigo-950/70">{p.desc}</p>
              <Link
                to={p.to}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white no-underline transition-colors"
                style={{ backgroundColor: p.accent }}
              >
                {p.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          )
        })}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] text-indigo-950/45">
        Department = Monitor · Institute = Manage · Inspector = Verify. AI assists recognition and analytics; authorised officials make the final decisions.
      </p>
    </section>
  )
}
