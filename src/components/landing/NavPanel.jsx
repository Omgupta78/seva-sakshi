import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, LogIn } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'

export default function NavPanel({ open, onClose }) {
  const { t } = useLang()
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    closeBtnRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-default bg-[#0a0928]/55 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <nav
        id="landing-nav-panel"
        aria-label="Main menu"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-50 h-full w-[min(320px,85vw)] overflow-y-auto bg-indigo-900 p-6 text-white shadow-2xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <strong>{t('menu')}</strong>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        <ul className="space-y-0.5">
          <li>
            <Link to="/" onClick={onClose} className="block rounded-lg px-2 py-2.5 text-[0.94rem] text-[#eef0ff] no-underline hover:bg-white/10">
              {t('navHome')}
            </Link>
          </li>
          <li>
            <a href="#" className="block rounded-lg px-2 py-2.5 text-[0.94rem] text-[#eef0ff] no-underline hover:bg-white/10">
              {t('navServices')}
            </a>
          </li>
          <li>
            <a href="#" className="block rounded-lg px-2 py-2.5 text-[0.94rem] text-[#eef0ff] no-underline hover:bg-white/10">
              {t('navGrievance')}
            </a>
          </li>
          <li>
            <a href="#" className="block rounded-lg px-2 py-2.5 text-[0.94rem] text-[#eef0ff] no-underline hover:bg-white/10">
              {t('navAbout')}
            </a>
          </li>
        </ul>

        <p className="mt-4 mb-1 text-[0.7rem] tracking-[0.1em] text-white/55 uppercase">{t('quickAccessLabel')}</p>
        <ul className="space-y-0.5">
          {['pillCctv', 'pillReports', 'pillDashboard', 'pillSchedule', 'pillAlerts'].map((key) => (
            <li key={key}>
              <a href="#" className="block rounded-lg px-2 py-2.5 text-[0.94rem] text-[#eef0ff] no-underline hover:bg-white/10">
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          onClick={onClose}
          className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-[0.9rem] font-bold text-indigo-900 no-underline"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {t('login')}
        </Link>
      </nav>
    </>
  )
}
