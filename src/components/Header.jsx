import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import EmblemMark from './EmblemMark.jsx'

/**
 * Top site header — government branding on the left,
 * secure-access reassurance on the right.
 *
 * The left branding block is a link back to the Seva Sakshi landing
 * page ("/"), the same way a site logo usually links back home.
 */
export default function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: emblem + portal name — links back to the Seva Sakshi landing page */}
        <Link
          to="/"
          className="flex items-center gap-3.5 rounded-lg transition-opacity hover:opacity-90 sm:gap-4"
          aria-label="Back to Seva Sakshi portal home"
        >
          <div className="flex w-11 shrink-0 flex-col items-center sm:w-14">
            <EmblemMark className="h-11 w-auto sm:h-14" />
            <p className="mt-0.5 text-[9px] leading-none text-saffron-500 sm:text-[10px]" lang="hi">
              सत्यमेव जयते
            </p>
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold sm:text-2xl">Government of India</p>
            <p className="text-sm text-sky-100/85 sm:text-lg">Department Service Portal</p>
          </div>
        </Link>

        {/* Right: secure access badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-white/70 sm:h-11 sm:w-11">
            <ShieldCheck className="h-5 w-5 text-white sm:h-6 sm:w-6" aria-hidden="true" strokeWidth={1.75} />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-base font-semibold">Secure Access</p>
            <p className="text-sm text-sky-100/85">Authorized Personnel Only</p>
          </div>
        </div>
      </div>
    </header>
  )
}
