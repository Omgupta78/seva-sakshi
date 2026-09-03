import { Headphones, BookOpen, Phone, ShieldCheck, FileText, Accessibility, Network } from 'lucide-react'

const LINKS = [
  { label: 'Help & Support', icon: Headphones },
  { label: 'User Manual', icon: BookOpen },
  { label: 'Contact Department', icon: Phone },
  { label: 'Privacy Policy', icon: ShieldCheck },
  { label: 'Terms & Conditions', icon: FileText },
  { label: 'Accessibility', icon: Accessibility },
  { label: 'Sitemap', icon: Network },
]

export default function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-sky-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {LINKS.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#"
              className="flex items-center gap-1.5 text-sm font-medium text-navy-900/80 hover:text-navy-950 hover:underline"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2} />
              {label}
            </a>
          ))}
        </nav>
        <p className="mt-4 text-center text-xs text-navy-950/50">
          © 2025 Government of India. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
