import { Map, Accessibility, Menu } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'

/**
 * Thin top utility bar: skip link, sitemap shortcut, accessibility
 * (high-contrast) toggle, font-size control, language toggle, hamburger.
 */
export default function UtilityBar({ hcMode, onToggleHc, onFontChange, onSitemapClick, onToggleNav, navOpen }) {
  const { lang, t, toggleLang } = useLang()

  return (
    <div className="bg-indigo-900 text-[13px] text-[#e3e7ff]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-1.5 px-5 py-1.5">
        <a href="#main-content" className="mr-auto rounded px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase hover:underline">
          {t('skipLink')}
        </a>

        <button
          type="button"
          onClick={onSitemapClick}
          aria-label="Sitemap"
          title="Sitemap"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15"
        >
          <Map className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleHc}
          aria-pressed={hcMode}
          aria-label="Toggle high-contrast accessibility mode"
          title="Accessibility"
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            hcMode ? 'bg-amber-500 text-indigo-900' : 'hover:bg-white/15'
          }`}
        >
          <Accessibility className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center overflow-hidden rounded-full border border-white/30">
          <button type="button" onClick={() => onFontChange('dec')} aria-label="Decrease text size" className="px-2 py-1 text-[12px] hover:bg-white/15">
            A-
          </button>
          <button type="button" onClick={() => onFontChange('reset')} aria-label="Reset text size" className="border-l border-white/25 px-2 py-1 text-[12px] hover:bg-white/15">
            A
          </button>
          <button type="button" onClick={() => onFontChange('inc')} aria-label="Increase text size" className="border-l border-white/25 px-2 py-1 text-[12px] hover:bg-white/15">
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={toggleLang}
          aria-label={lang === 'en' ? 'Switch language to Hindi' : 'भाषा अंग्रेज़ी में बदलें'}
          className="rounded-full border border-white/30 px-2.5 py-1 text-[12px] hover:bg-white/15"
        >
          <strong className={lang === 'en' ? 'text-amber-500' : ''}>English</strong>
          {' | '}
          <span className={lang === 'hi' ? 'font-bold text-amber-500' : ''}>हिन्दी</span>
        </button>

        <button
          type="button"
          onClick={onToggleNav}
          aria-label="Open menu"
          aria-expanded={navOpen}
          aria-controls="landing-nav-panel"
          className="flex h-7 w-7 flex-col items-center justify-center gap-[3px] rounded-full transition-colors hover:bg-white/15"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
