import { Link } from 'react-router-dom'
import { Accessibility, LogOut } from 'lucide-react'
import EmblemMark from '../EmblemMark.jsx'
import { useDashboardLang } from '../../context/DashboardLangContext.jsx'

/**
 * Role-aware dashboard top bar: branding, EN/HI + text-size + high-contrast
 * controls (matching the Landing page's utility bar), and the logged-in
 * user's name/role/district with a logout action.
 */
export default function DashboardHeader({ hcMode, onToggleHc, onFontChange, user, onLogout }) {
  const { lang, t, toggleLang } = useDashboardLang()

  return (
    <header
      className="text-white"
      style={{ background: 'linear-gradient(120deg, #161138 0%, #3a1d70 100%)' }}
    >
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-plum-950 focus:shadow-lg"
      >
        {t('skipLink')}
      </a>

      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <EmblemMark className="h-9 w-auto" />
          <div className="leading-tight">
            <p className="text-sm font-bold sm:text-base">Seva Sakshi</p>
            <p className="text-[11px] text-white/70 sm:text-xs">{t('dashboardTitle')}</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleHc}
            aria-pressed={hcMode}
            aria-label="Toggle high-contrast accessibility mode"
            title="Accessibility"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              hcMode ? 'bg-amber-500 text-plum-950' : 'hover:bg-white/15'
            }`}
          >
            <Accessibility className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center overflow-hidden rounded-full border border-white/30">
            <button type="button" onClick={() => onFontChange('dec')} aria-label="Decrease text size" className="px-2 py-1 text-xs hover:bg-white/15">
              A-
            </button>
            <button type="button" onClick={() => onFontChange('reset')} aria-label="Reset text size" className="border-l border-white/25 px-2 py-1 text-xs hover:bg-white/15">
              A
            </button>
            <button type="button" onClick={() => onFontChange('inc')} aria-label="Increase text size" className="border-l border-white/25 px-2 py-1 text-xs hover:bg-white/15">
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch language to Hindi' : 'भाषा अंग्रेज़ी में बदलें'}
            className="rounded-full border border-white/30 px-2.5 py-1 text-xs hover:bg-white/15"
          >
            <strong className={lang === 'en' ? 'text-amber-500' : ''}>English</strong>
            {' | '}
            <span className={lang === 'hi' ? 'font-bold text-amber-500' : ''}>हिन्दी</span>
          </button>

          <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pr-1 pl-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-plum-950">
              {user.initials}
            </div>
            <span className="hidden text-xs leading-tight sm:block">
              <span className="font-semibold">{user.name}</span>
              <span className="text-white/70"> · {user.role}, {user.district}</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
