import { useState } from 'react'
import { IdCard, Lock, Loader2, ShieldCheck } from 'lucide-react'
import FormInput from './FormInput.jsx'
import DepartmentSelect from './DepartmentSelect.jsx'
import Captcha, { generateCaptcha } from './Captcha.jsx'
import Alert from './Alert.jsx'

/**
 * ---------------------------------------------------------------------
 * DEMO AUTHENTICATION ONLY
 * ---------------------------------------------------------------------
 * There is no real backend here. `authenticate()` below simulates a
 * network call and checks the submitted credentials against a single
 * hard-coded demo account so the login flow can be exercised end to end.
 *
 * To wire this up to a real backend, replace the body of `authenticate()`
 * with an API call, e.g.:
 *
 *   const res = await fetch('/api/auth/login', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ department, employeeId, password }),
 *   })
 *   if (!res.ok) throw new Error('Invalid credentials')
 *   return res.json()
 *
 * and remove the captcha/credential checks that live client-side below —
 * captcha verification, in particular, must always happen server-side.
 * ---------------------------------------------------------------------
 */
const DEMO_EMPLOYEE_ID = 'EMP1001'
const DEMO_PASSWORD = 'Passw0rd!'

function authenticate({ employeeId, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (employeeId === DEMO_EMPLOYEE_ID && password === DEMO_PASSWORD) {
        resolve({ employeeId })
      } else {
        reject(new Error('Invalid Employee ID, Password, or Captcha. Please try again.'))
      }
    }, 1100)
  })
}

const initialFormState = {
  department: '',
  employeeId: '',
  password: '',
  captchaInput: '',
}

export default function LoginForm({ onForgotPassword }) {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha())
  const [rememberDevice, setRememberDevice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear the field-level error as soon as the user starts correcting it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  function refreshCaptcha() {
    setCaptchaCode(generateCaptcha())
    setForm((prev) => ({ ...prev, captchaInput: '' }))
  }

  function validate() {
    const next = {}
    if (!form.department) next.department = 'Please select your department.'
    if (!form.employeeId.trim()) next.employeeId = 'Employee ID is required.'
    else if (form.employeeId.trim().length < 4)
      next.employeeId = 'Employee ID must be at least 4 characters.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    if (!form.captchaInput.trim()) next.captcha = 'Please enter the captcha shown above.'
    else if (form.captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase())
      next.captcha = 'Captcha does not match. Please try again.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoginError('')
    setSuccessMessage('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await authenticate(form)
      setSuccessMessage(
        'Login successful (demo). In a real deployment this would redirect to your department dashboard.'
      )
      setForm(initialFormState)
      refreshCaptcha()
    } catch (err) {
      setLoginError(err.message)
      refreshCaptcha()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert message={loginError} onDismiss={() => setLoginError('')} />

      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-success-600/25 bg-green-50 px-3.5 py-3 text-sm font-medium text-success-600"
        >
          {successMessage}
        </div>
      )}

      <DepartmentSelect
        id="department"
        value={form.department}
        onChange={(e) => updateField('department', e.target.value)}
        error={errors.department}
        required
      />

      <FormInput
        id="employeeId"
        label="Employee ID"
        icon={IdCard}
        placeholder="Enter Employee ID"
        autoComplete="username"
        value={form.employeeId}
        onChange={(e) => updateField('employeeId', e.target.value)}
        error={errors.employeeId}
        required
      />

      <FormInput
        id="password"
        label="Password"
        icon={Lock}
        isPassword
        placeholder="Enter Password"
        autoComplete="current-password"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        error={errors.password}
        required
      />

      <Captcha code={captchaCode} onRefresh={refreshCaptcha} />

      <FormInput
        id="captchaInput"
        label="Enter Captcha"
        icon={ShieldCheck}
        placeholder="Enter Captcha"
        autoComplete="off"
        value={form.captchaInput}
        onChange={(e) => updateField('captchaInput', e.target.value)}
        error={errors.captcha}
        required
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-navy-950/80">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="h-4 w-4 rounded border-navy-900/30 text-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-700"
          />
          Remember this device
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="font-medium text-navy-800 hover:text-navy-950 hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            <Lock className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={2} />
            Login
          </>
        )}
      </button>
    </form>
  )
}
