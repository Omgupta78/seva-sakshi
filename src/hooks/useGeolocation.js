import { useCallback, useState } from 'react'

/**
 * Wraps the browser Geolocation API for the mobile inspector module.
 * Deliberately manual (`request()`), not automatic on mount — an app
 * should ask for location when the user does something that needs it,
 * not the moment a screen opens.
 *
 * Every failure mode is surfaced with a plain-language message rather
 * than silently leaving the UI in a loading state, because on a real
 * Android handset permission-denied and no-signal are both common.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [status, setStatus] = useState('idle') // idle | requesting | granted | error
  const [error, setError] = useState('')

  const request = useCallback(() => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setStatus('error')
        setError('This device or browser does not support location services.')
        resolve(null)
        return
      }

      setStatus('requesting')
      setError('')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = { lat: position.coords.latitude, lng: position.coords.longitude }
          setCoords(next)
          setAccuracy(position.coords.accuracy)
          setStatus('granted')
          resolve(next)
        },
        (err) => {
          const messages = {
            1: 'Location permission was denied. Enable it for this site to verify you are on site.',
            2: 'Location is unavailable right now — check that GPS is switched on and try again.',
            3: 'Getting a location fix timed out. Move to open sky and try again.',
          }
          setStatus('error')
          setError(messages[err.code] ?? 'Could not get a location fix.')
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      )
    })
  }, [])

  /**
   * DEMO ONLY — lets the on-site path be exercised on a desktop browser
   * that is (correctly) thousands of km from the seeded project sites.
   * Delete this, and its button in GeoVerificationPanel, for production.
   */
  const simulateAt = useCallback((target) => {
    if (!target) return null
    const next = { lat: target.lat, lng: target.lng }
    setCoords(next)
    setAccuracy(12)
    setStatus('granted')
    setError('')
    return next
  }, [])

  return { coords, accuracy, status, error, request, simulateAt }
}
