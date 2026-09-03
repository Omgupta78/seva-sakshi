import { useEffect, useRef, useState } from 'react'

/**
 * ROTATING HERO BACKGROUND IMAGES
 * Edit this array to swap images — each entry needs a working image URL
 * and a short, descriptive `alt`. One entry MUST stay a National Emblem /
 * Ashoka Lion Capital image.
 */
export const HERO_BACKGROUND_IMAGES = [
  {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sarnath_capital.jpg?width=1600',
    alt: 'National Emblem of India — the Lion Capital of Ashoka, Sarnath',
  },
  {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/India_Gate_in_New_Delhi_03-2016.jpg?width=1600',
    alt: 'India Gate, New Delhi',
  },
  {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/SansadBhavan.jpg?width=1600',
    alt: 'Parliament House (Sansad Bhavan), New Delhi',
  },
  {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Children_in_a_classroom.jpg?width=1600',
    alt: 'Community welfare and education outreach',
  },
]

const ROTATE_INTERVAL_MS = 30000 // switch every 30 seconds
const CROSSFADE_MS = 1500 // 1.5s crossfade

function preload(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve // don't block rotation on a failed placeholder URL
    img.src = url
  })
}

/**
 * Drives a two-layer crossfading hero background. Returns the two layers'
 * current state (image + whether it's the active/visible one) plus the
 * crossfade duration to apply (0s under prefers-reduced-motion).
 */
export function useHeroBackgroundRotation(images = HERO_BACKGROUND_IMAGES) {
  const [layers, setLayers] = useState([
    { entry: images[0], active: true },
    { entry: images[0], active: false },
  ])
  const activeLayerRef = useRef(0)
  const imageIndexRef = useRef(0)
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    let cancelled = false

    const id = setInterval(async () => {
      const nextImageIndex = (imageIndexRef.current + 1) % images.length
      const nextEntry = images[nextImageIndex]
      await preload(nextEntry.url)
      if (cancelled) return

      const incomingLayerIndex = (activeLayerRef.current + 1) % 2
      setLayers((prev) => {
        const next = [...prev]
        next[incomingLayerIndex] = { entry: nextEntry, active: true }
        next[activeLayerRef.current] = { ...next[activeLayerRef.current], active: false }
        return next
      })
      activeLayerRef.current = incomingLayerIndex
      imageIndexRef.current = nextImageIndex
    }, ROTATE_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [images])

  return {
    layers,
    fadeDuration: reducedMotion ? '0s' : `${CROSSFADE_MS / 1000}s`,
  }
}
