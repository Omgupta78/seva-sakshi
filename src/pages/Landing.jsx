import { useEffect, useRef, useState } from 'react'
import { LangProvider, useLang } from '../context/LangContext.jsx'
import UtilityBar from '../components/landing/UtilityBar.jsx'
import SiteHeader from '../components/landing/SiteHeader.jsx'
import Hero from '../components/landing/Hero.jsx'
import MissionCard from '../components/landing/MissionCard.jsx'
import PortalChooser from '../components/landing/PortalChooser.jsx'
import LandingFooter from '../components/landing/LandingFooter.jsx'
import NavPanel from '../components/landing/NavPanel.jsx'

const FS_MIN = 0.85
const FS_MAX = 1.3
const FS_STEP = 0.1

function LandingContent() {
  const [hcMode, setHcMode] = useState(false)
  const [fsScale, setFsScale] = useState(1)
  const [navOpen, setNavOpen] = useState(false)
  const footerRef = useRef(null)
  const { t } = useLang()

  // Font-size scaling is applied to the whole document (rem-based sizing
  // throughout the app follows it), so it's reset back to normal when
  // leaving the landing page.
  useEffect(() => {
    document.documentElement.style.setProperty('--fs-scale', fsScale)
    return () => document.documentElement.style.removeProperty('--fs-scale')
  }, [fsScale])

  function handleFontChange(action) {
    setFsScale((prev) => {
      if (action === 'inc') return Math.min(FS_MAX, +(prev + FS_STEP).toFixed(2))
      if (action === 'dec') return Math.max(FS_MIN, +(prev - FS_STEP).toFixed(2))
      return 1
    })
  }

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8ff]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-indigo-900 focus:shadow-lg"
      >
        {t('skipLink')}
      </a>

      <UtilityBar
        hcMode={hcMode}
        onToggleHc={() => setHcMode((v) => !v)}
        onFontChange={handleFontChange}
        onSitemapClick={() => footerRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })}
        onToggleNav={() => setNavOpen(true)}
        navOpen={navOpen}
      />
      <SiteHeader />

      <main id="main-content" className="flex-1">
        <Hero hcMode={hcMode} />
        <PortalChooser />
        <div className="pb-16">
          <MissionCard />
        </div>
      </main>

      <LandingFooter ref={footerRef} />
      <NavPanel open={navOpen} onClose={() => setNavOpen(false)} />
    </div>
  )
}

/**
 * The Seva Sakshi landing page, reached at "/". The "Login" button in the
 * header (and the nav panel) links to the Department Login page at
 * "/login"; Login's own header logo links back here.
 */
export default function Landing() {
  return (
    <LangProvider>
      <LandingContent />
    </LangProvider>
  )
}
