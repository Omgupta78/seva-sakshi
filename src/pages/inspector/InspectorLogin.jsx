import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { resolveInspectorLogin, DEMO_CREDENTIAL_HINTS } from '../../data/demoAccounts.js'
import EmblemMark from '../../components/EmblemMark.jsx'

export default function InspectorLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password) { setError('Enter your username and password.'); return }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    const profile = resolveInspectorLogin(form.username, form.password)
    if (!profile) { setError('Invalid username or password.'); setSubmitting(false); return }
    login(profile)
    navigate('/inspector/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper-50">
      <div className="w-full" style={{ background: 'linear-gradient(120deg, #161138 0%, #3a1d70 100%)' }}>
        <div className="mx-auto flex w-full max-w-lg items-center gap-2.5 px-5 py-5 text-white">
          <EmblemMark className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="text-base font-extrabold">Seva Sakshi Field</p>
            <p className="text-[11px] text-white/70">Inspector Portal</p>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-lg flex-1 flex-col px-5 pt-8">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-800 text-white"><ClipboardCheck className="h-6 w-6" aria-hidden="true" /></span>
        <h1 className="text-2xl font-extrabold text-plum-950">Inspector sign in</h1>
        <p className="mt-1 text-sm text-plum-950/60">Inspect, verify and report from the field.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#D6262B]/25 bg-red-50 px-3 py-2.5 text-sm text-[#D6262B]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-plum-950">Username</label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
              <input id="username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. inspector" autoComplete="username"
                className="w-full rounded-xl border border-plum-950/15 bg-white py-3.5 pr-3 pl-11 text-base text-plum-950 focus:outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-plum-950">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
              <input id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Enter password" autoComplete="current-password"
                className="w-full rounded-xl border border-plum-950/15 bg-white py-3.5 pr-11 pl-11 text-base text-plum-950 focus:outline-none" />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-plum-950/40">
                {showPw ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-plum-800 text-base font-semibold text-white transition-colors hover:bg-plum-900 disabled:opacity-70">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Signing in…</> : 'Login'}
          </button>
        </form>

        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-plum-50/70 p-3 text-xs text-plum-950/60">
          <ShieldCheck className="h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" /> Demo: {DEMO_CREDENTIAL_HINTS.inspector}
        </p>
        <p className="mt-4 mb-8 text-center text-xs text-plum-950/45">
          Not an inspector? <Link to="/login" className="font-semibold text-plum-800 hover:underline">Officer</Link> · <Link to="/institution/login" className="font-semibold text-plum-800 hover:underline">Institution</Link>
        </p>
      </div>
    </div>
  )
}
