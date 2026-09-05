import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useLang } from '../../context/LangContext.jsx'
import BrandMark from './BrandMark.jsx'

/**
 * Logo + primary nav row. The account button is the main connection
 * point to the Department Login page ("/login").
 */
export default function SiteHeader() {
  const { t } = useLang()

  return (
    <div className="border-b border-indigo-900/10 bg-[#eeedf4]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <BrandMark className="h-8.5 w-8.5" />
          <span className="hidden text-[1.05rem] font-bold tracking-tight text-indigo-900 sm:inline">
            Seva Sakshi
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <Link to="/" className="border-b-2 border-amber-500 pb-1 text-[0.86rem] font-semibold text-indigo-900 no-underline">
            {t('navHome')}
          </Link>
          <a href="#" className="pb-1 text-[0.86rem] font-semibold text-[#444651] no-underline hover:text-teal-700">
            {t('navServices')}
          </a>
          <a href="#" className="pb-1 text-[0.86rem] font-semibold text-[#444651] no-underline hover:text-teal-700">
            {t('navGrievance')}
          </a>
          <a href="#" className="pb-1 text-[0.86rem] font-semibold text-[#444651] no-underline hover:text-teal-700">
            {t('navAbout')}
          </a>
        </nav>

        <a
          href="#portal-heading"
          className="flex items-center gap-2 rounded-full bg-indigo-900 py-1.5 pr-3.5 pl-2.5 text-[0.8rem] font-semibold text-white no-underline transition-colors hover:bg-indigo-800"
          aria-label="Login — choose your portal"
          title="Choose your portal"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {t('login')}
        </a>
      </div>
    </div>
  )
}
