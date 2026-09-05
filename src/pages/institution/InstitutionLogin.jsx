import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, User, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { resolveInstitutionLogin, DEMO_CREDENTIAL_HINTS } from '../../data/demoAccounts.js'
import EmblemMark from '../../components/EmblemMark.jsx'

const initial = { institutionId: '', username: '', password: '' }

export default function InstitutionLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  function validate() {
    const next = {}
    if (!form.institutionId.trim()) next.institutionId = 'Institution ID is required.'
    if (!form.username.trim()) next.username = 'Username is required.'
    if (!form.password) next.password = 'Password is required.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900)) // simulated network
    const profile = resolveInstitutionLogin(form.institutionId, form.username, form.password)
    if (!profile) {
      setError('Invalid Institution ID, username or password. Please try again.')
      setSubmitting(false)
      return
    }
    login(profile)
    navigate('/institution/dashboard')
  }

  return (
    <div className="grid min-h-screen bg-navy-950 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-plum-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <EmblemMark className="h-11 w-auto" />
          <div>
            <p className="text-lg font-extrabold">Seva Sakshi</p>
            <p className="text-xs text-white/60">Government of India · DoSJE</p>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Institution Portal</h1>
          <p className="mt-2 max-w-sm text-white/70">Attendance, Operations &amp; Compliance — record daily operations and keep your institution’s records ready for departmental monitoring.</p>
        </div>
        <p className="text-xs text-white/40">Secure access for authorised institution personnel only.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-paper-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <EmblemMark className="h-9 w-auto" />
            <span className="text-lg font-extrabold text-plum-950">Seva Sakshi</span>
          </div>
          <h2 className="text-xl font-extrabold text-plum-950">Institution Portal</h2>
          <p className="mt-1 text-sm text-plum-950/60">Attendance, Operations &amp; Compliance</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#D6262B]/25 bg-red-50 px-3 py-2.5 text-sm text-[#D6262B]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
              </div>
            )}

            <Field label="Institution ID" icon={Building2} id="institutionId" placeholder="e.g. INST-001" value={form.institutionId} onChange={(v) => set('institutionId', v)} error={errors.institutionId} autoComplete="organization" />
            <Field label="Username" icon={User} id="username" placeholder="e.g. admin" value={form.username} onChange={(v) => set('username', v)} error={errors.username} autoComplete="username" />

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-plum-950">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
                <input id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Enter password" autoComplete="current-password"
                  className={`w-full rounded-lg border bg-white py-2.5 pr-10 pl-9 text-sm text-plum-950 focus:outline-none ${errors.password ? 'border-[#D6262B]' : 'border-plum-950/15'}`} />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-plum-950/40 hover:text-plum-950">
                  {showPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs font-medium text-[#D6262B]">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-plum-800 hover:underline" onClick={() => setError('Please contact your DoSJE district coordinator to reset institution access.')}>Forgot Password?</button>
            </div>

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-plum-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-plum-900 disabled:opacity-70">
              {submitting ? <><Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" /> Signing in…</> : <><Lock className="h-4.5 w-4.5" aria-hidden="true" /> Login</>}
            </button>
          </form>

          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/60">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Demo: {DEMO_CREDENTIAL_HINTS.institutionAdmin} · or {DEMO_CREDENTIAL_HINTS.institutionTeacher}
          </p>
          <p className="mt-3 text-center text-xs text-plum-950/45">
            Department officer? <Link to="/login" className="font-semibold text-plum-800 hover:underline">Officer login</Link> · Inspector? <Link to="/inspector/login" className="font-semibold text-plum-800 hover:underline">Inspector login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, id, placeholder, value, onChange, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-plum-950">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-white py-2.5 pr-3 pl-9 text-sm text-plum-950 focus:outline-none ${error ? 'border-[#D6262B]' : 'border-plum-950/15'}`} />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-[#D6262B]">{error}</p>}
    </div>
  )
}
