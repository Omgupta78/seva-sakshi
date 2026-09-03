import { forwardRef } from 'react'
import { useLang } from '../../context/LangContext.jsx'
import BrandMark from './BrandMark.jsx'

const LandingFooter = forwardRef(function LandingFooter(_props, ref) {
  const { t } = useLang()

  const links = [
    ['footerPrivacy', '/'],
    ['footerTerms', '/'],
    ['footerHyperlink', '/'],
    ['footerAccessibility', '/'],
    ['footerContact', '/'],
    ['footerHelp', '/'],
  ]

  return (
    <footer ref={ref} className="bg-[#2b2c37] px-5 py-10 text-[#f1f0f7]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3.5">
          <BrandMark className="h-8 w-8 brightness-0 invert" />
          <div className="h-8.5 w-px bg-white/20" />
          <div className="text-left">
            <p className="font-bold">Seva Sakshi</p>
            <p className="mt-0.5 text-[0.76rem] opacity-70">{t('footerTagline')}</p>
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[0.82rem] opacity-85">
          {links.map(([key]) => (
            <a key={key} href="#" className="no-underline hover:text-teal-100 hover:underline">
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[0.74rem] opacity-60">
          <span>{t('footerCopyright')}</span>
          <span>{t('footerUpdated')}</span>
        </div>
      </div>
    </footer>
  )
})

export default LandingFooter
