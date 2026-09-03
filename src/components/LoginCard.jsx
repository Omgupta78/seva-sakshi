import { useState } from 'react'
import { Landmark, Users } from 'lucide-react'
import LoginForm from './LoginForm.jsx'
import Modal from './Modal.jsx'

/**
 * White card containing the department login form, plus the
 * "or / Citizen Login" secondary option below it.
 */
export default function LoginCard() {
  const [activeModal, setActiveModal] = useState(null) // 'forgot' | 'citizen' | null

  return (
    <div className="w-full max-w-md rounded-2xl border border-navy-900/10 bg-white p-6 shadow-lg sm:p-8">
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-navy-950 sm:text-2xl">
          <Landmark className="h-6 w-6 text-navy-900" aria-hidden="true" strokeWidth={2} />
          Department Login
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-navy-700" aria-hidden="true" />
        <p className="mt-3 mb-6 text-sm text-navy-950/60">
          Enter your credentials to access the department portal
        </p>
      </div>

      <LoginForm onForgotPassword={() => setActiveModal('forgot')} />

      <div className="my-6 flex items-center gap-3" role="separator">
        <div className="h-px flex-1 bg-navy-900/10" />
        <span className="text-xs font-medium tracking-wide text-navy-950/40 uppercase">or</span>
        <div className="h-px flex-1 bg-navy-900/10" />
      </div>

      <button
        type="button"
        onClick={() => setActiveModal('citizen')}
        className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-navy-800 hover:text-navy-950 hover:underline"
      >
        <Users className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={2} />
        Citizen Login
      </button>

      {activeModal === 'forgot' && (
        <Modal title="Forgot Password" onClose={() => setActiveModal(null)}>
          Password reset instructions would be sent to your registered department
          email address. (This is a frontend demo — no email is actually sent.)
        </Modal>
      )}

      {activeModal === 'citizen' && (
        <Modal title="Citizen Login" onClose={() => setActiveModal(null)}>
          This would take you to the separate Citizen Services Portal, used by the
          public rather than department staff. (This is a frontend demo — no
          navigation actually occurs.)
        </Modal>
      )}
    </div>
  )
}
