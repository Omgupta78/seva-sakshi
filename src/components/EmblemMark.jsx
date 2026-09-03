/**
 * State Emblem of India — the Lion Capital of Ashoka, sourced from
 * Wikimedia Commons' "Emblem of India (without motto).svg"
 * (public domain, authored by the Government of India) and recolored
 * gold via public/emblem-gold.svg. The motto "सत्यमेव जयते" is rendered
 * separately as text wherever this is used, so it stays crisp at any size.
 */
export default function EmblemMark({ className = 'h-14 w-14' }) {
  return <img src="/emblem-gold.svg" alt="State Emblem of India" className={className} />
}
