import { createContext, useContext, useState, useCallback } from 'react'

// English / Hindi copy for every piece of translated text on the landing page.
// "सत्यमेव जयते", the "(सेवा साक्षी)" wordmark line, and the bilingual tagline
// are permanent bilingual branding and are NOT toggled — same as the rest of
// the copy on the page.
const translations = {
  en: {
    skipLink: 'Skip to main content',
    navHome: 'Home',
    navServices: 'Services',
    navGrievance: 'Grievance',
    navAbout: 'About Portal',
    subtitle: 'Department of Social Justice & Empowerment',
    searchPlaceholder: 'Search projects, institutes, inspections...',
    categoryAll: 'All Categories',
    categoryInstitutes: 'Institutes',
    categoryInspections: 'Inspections',
    categoryProjects: 'Projects',
    searchBtn: 'Search',
    quickAccessLabel: 'Quick Access:',
    pillCctv: 'Live CCTV',
    pillReports: 'Inspection Reports',
    pillDashboard: 'Dashboard',
    pillSchedule: 'Schedule Inspection',
    pillAlerts: 'Anomaly Alerts',
    missionQuote:
      '"To ensure every rupee spent on social welfare is a rupee witnessed by transparency, accountability, and the citizens it serves."',
    missionAttribution: 'Mission Statement, Seva Sakshi Portal',
    menu: 'Menu',
    login: 'Login',
    footerTagline: 'Digital Governance & Citizen Oversight',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerHyperlink: 'Hyperlinking Policy',
    footerAccessibility: 'Accessibility Statement',
    footerContact: 'Contact Us',
    footerHelp: 'Help',
    footerCopyright:
      '© 2026 Seva Sakshi, Department of Social Justice & Empowerment, Government of India. All rights reserved.',
    footerUpdated: 'Last Updated: 03 Sep 2026',
  },
  hi: {
    skipLink: 'मुख्य सामग्री पर जाएँ',
    navHome: 'मुखपृष्ठ',
    navServices: 'सेवाएँ',
    navGrievance: 'शिकायत',
    navAbout: 'पोर्टल के बारे में',
    subtitle: 'सामाजिक न्याय एवं अधिकारिता विभाग',
    searchPlaceholder: 'परियोजनाएँ, संस्थान, निरीक्षण खोजें...',
    categoryAll: 'सभी श्रेणियाँ',
    categoryInstitutes: 'संस्थान',
    categoryInspections: 'निरीक्षण',
    categoryProjects: 'परियोजनाएँ',
    searchBtn: 'खोजें',
    quickAccessLabel: 'त्वरित पहुँच:',
    pillCctv: 'लाइव सीसीटीवी',
    pillReports: 'निरीक्षण रिपोर्ट',
    pillDashboard: 'डैशबोर्ड',
    pillSchedule: 'निरीक्षण अनुसूचित करें',
    pillAlerts: 'विसंगति चेतावनी',
    missionQuote:
      '"सामाजिक कल्याण पर खर्च किया गया हर रुपया पारदर्शिता, जवाबदेही और उसकी सेवा पाने वाले नागरिकों की निगरानी में हो — यह सुनिश्चित करना।"',
    missionAttribution: 'मिशन वक्तव्य, सेवा साक्षी पोर्टल',
    menu: 'मेनू',
    login: 'लॉगिन',
    footerTagline: 'डिजिटल गवर्नेंस एवं नागरिक निगरानी',
    footerPrivacy: 'गोपनीयता नीति',
    footerTerms: 'उपयोग की शर्तें',
    footerHyperlink: 'हाइपरलिंकिंग नीति',
    footerAccessibility: 'सुगम्यता वक्तव्य',
    footerContact: 'संपर्क करें',
    footerHelp: 'सहायता',
    footerCopyright: '© 2026 सेवा साक्षी, सामाजिक न्याय एवं अधिकारिता विभाग, भारत सरकार। सर्वाधिकार सुरक्षित।',
    footerUpdated: 'अंतिम अद्यतन: 03 सितंबर 2026',
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'))
  }, [])

  const t = useCallback((key) => translations[lang][key] ?? key, [lang])

  return <LangContext.Provider value={{ lang, t, toggleLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}
