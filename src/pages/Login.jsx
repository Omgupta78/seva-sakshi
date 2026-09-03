import Header from '../components/Header.jsx'
import HeroLeft from '../components/HeroLeft.jsx'
import LoginCard from '../components/LoginCard.jsx'
import Footer from '../components/Footer.jsx'

/**
 * The staff-facing Department Login screen, reached at "/login".
 * The header logo links back to the Seva Sakshi landing page ("/").
 */
export default function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-sky-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-900 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
          <HeroLeft />
          <div className="flex justify-center lg:justify-end">
            <LoginCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
