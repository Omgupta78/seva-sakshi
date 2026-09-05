import { Building2, MapPin, User, Mail, Phone, Users, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getInstitutionProfile } from '../../services/institutionService.js'

/** "My Institute" — the institution's own profile record (read-only in this
 *  prototype; edits are handled by the district coordinator). */
export default function InstitutionProfile() {
  const { data: p, loading } = useAsync(() => getInstitutionProfile(), [])

  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">My Institute</h1>
        <p className="text-sm text-plum-950/60">Registration and profile details on record with the Department.</p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-plum-950/50">Loading…</p>
      ) : (
        <>
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-800/10 text-plum-800"><Building2 className="h-6 w-6" aria-hidden="true" /></span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-plum-950">{p.name}</h2>
                <p className="text-sm text-plum-950/60">{p.type}</p>
                <p className="mt-0.5 text-xs text-plum-950/50">{p.institutionId} · Est. {p.established}</p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {[
                ['Scheme', p.scheme],
                ['District', p.district],
                ['Block', p.block],
                ['Sanctioned Capacity', `${p.capacity} students`],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 text-plum-950/85">{v}</dd></div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><MapPin className="h-4 w-4 text-plum-800" aria-hidden="true" /> Address & Contact</h3>
              <p className="text-sm text-plum-950/80">{p.address}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-plum-950/75">
                <li className="flex items-center gap-2"><User className="h-4 w-4 shrink-0 text-plum-950/45" aria-hidden="true" /> {p.head} <span className="text-plum-950/45">· Head</span></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-plum-950/45" aria-hidden="true" /> {p.headPhone}</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-plum-950/45" aria-hidden="true" /> {p.email}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><Users className="h-4 w-4 text-plum-800" aria-hidden="true" /> At a glance</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['Active students', p.activeStudents], ['On roll', p.totalStudents], ['Active staff', p.staffCount]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-plum-50/60 py-3">
                    <p className="text-xl font-extrabold text-plum-900">{v}</p>
                    <p className="mt-0.5 text-[11px] text-plum-950/55">{k}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="flex items-center gap-1.5 rounded-xl bg-plum-50/60 p-3 text-[11px] text-plum-950/55"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Profile changes are made by your DoSJE district coordinator. Raise a request through the Department if any detail is out of date.</p>
        </>
      )}
    </div>
  )
}
