import { Building2, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLE_LABELS } from '../../data/rbac.js'

export default function InstitutionSettings() {
  const { user, role } = useAuth()
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Settings</h1>
        <p className="text-sm text-plum-950/60">Your institution profile and account.</p>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><Building2 className="h-4 w-4 text-plum-800" aria-hidden="true" /> Institution</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {[['Institution', user?.institutionName ?? '—'], ['Institution ID', user?.institutionId ?? '—'], ['District', user?.district ?? '—'], ['Organization ID', user?.organizationId ?? '—']].map(([k, v]) => (
            <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 text-plum-950/85">{v}</dd></div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><User className="h-4 w-4 text-plum-800" aria-hidden="true" /> Account</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {[['Name', user?.name ?? '—'], ['Role', ROLE_LABELS[role] ?? role], ['Username', user?.employeeId ?? '—']].map(([k, v]) => (
            <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 text-plum-950/85">{v}</dd></div>
          ))}
        </dl>
      </div>

      <p className="flex items-center gap-1.5 rounded-xl bg-plum-50/60 p-3 text-[11px] text-plum-950/55"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Password changes and institution profile edits are managed by your DoSJE district coordinator in this prototype.</p>
    </div>
  )
}
