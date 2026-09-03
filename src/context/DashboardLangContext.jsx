import { createContext, useCallback, useContext, useState } from 'react'

// Dashboard chrome/section copy in English and Hindi. Institute names,
// scheme names, and inspector names stay as-is regardless of language —
// consistent with how most Indian government dashboards keep proper
// nouns untranslated.
const text = {
  en: {
    skipLink: 'Skip to main content',
    dashboardTitle: 'Real-Time Monitoring Dashboard',
    kpiInstitutes: 'Institutes Monitored',
    kpiInspectionsToday: 'Inspections Today',
    kpiOpenAnomalies: 'Open Anomalies',
    kpiAvgCompliance: 'Avg. Compliance %',
    filterDistrict: 'District',
    filterScheme: 'Scheme',
    allDistricts: 'All Districts',
    allSchemes: 'All Schemes',
    assignInspection: 'Assign Inspection',
    startSurpriseVc: 'Start Surprise VC',
    mapTitle: 'Live Institute Map',
    mapHint: 'Click a pin for details',
    activityFeedTitle: 'Activity Feed',
    liveLabel: 'Live',
    ongoingInspectionsTitle: 'Ongoing Inspections',
    anomalyAlertsTitle: 'Anomaly Alerts',
    colInstitute: 'Institute',
    colInspector: 'Inspector',
    colStatus: 'Status',
    colLocation: 'Location',
    colType: 'Type',
    colDetected: 'Detected',
    colSeverity: 'Severity',
    openProfile: 'Open Profile',
    lastInspected: 'Last inspected',
    liveFeed: 'Live feed',
    logout: 'Logout',
    menu: 'Menu',
  },
  hi: {
    skipLink: 'मुख्य सामग्री पर जाएँ',
    dashboardTitle: 'रीयल-टाइम निगरानी डैशबोर्ड',
    kpiInstitutes: 'निगरानी में संस्थान',
    kpiInspectionsToday: 'आज के निरीक्षण',
    kpiOpenAnomalies: 'खुली विसंगतियाँ',
    kpiAvgCompliance: 'औसत अनुपालन %',
    filterDistrict: 'जिला',
    filterScheme: 'योजना',
    allDistricts: 'सभी जिले',
    allSchemes: 'सभी योजनाएँ',
    assignInspection: 'निरीक्षण सौंपें',
    startSurpriseVc: 'सरप्राइज़ वीसी शुरू करें',
    mapTitle: 'लाइव संस्थान मानचित्र',
    mapHint: 'विवरण हेतु पिन पर क्लिक करें',
    activityFeedTitle: 'गतिविधि फ़ीड',
    liveLabel: 'लाइव',
    ongoingInspectionsTitle: 'जारी निरीक्षण',
    anomalyAlertsTitle: 'विसंगति चेतावनी',
    colInstitute: 'संस्थान',
    colInspector: 'निरीक्षक',
    colStatus: 'स्थिति',
    colLocation: 'स्थान',
    colType: 'प्रकार',
    colDetected: 'पहचाना गया',
    colSeverity: 'गंभीरता',
    openProfile: 'प्रोफ़ाइल खोलें',
    lastInspected: 'अंतिम निरीक्षण',
    liveFeed: 'लाइव फ़ीड',
    logout: 'लॉगआउट',
    menu: 'मेनू',
  },
}

const DashboardLangContext = createContext(null)

export function DashboardLangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const toggleLang = useCallback(() => setLang((p) => (p === 'en' ? 'hi' : 'en')), [])
  const t = useCallback((key) => text[lang][key] ?? key, [lang])

  return <DashboardLangContext.Provider value={{ lang, t, toggleLang }}>{children}</DashboardLangContext.Provider>
}

export function useDashboardLang() {
  const ctx = useContext(DashboardLangContext)
  if (!ctx) throw new Error('useDashboardLang must be used within a DashboardLangProvider')
  return ctx
}
