import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic async-data hook: call it with a function that returns a
 * Promise (typically one of the services/*.js calls) and a dependency
 * array; it tracks loading/error/data and re-runs when deps change.
 * Ignores results from a stale in-flight call if deps change again
 * before it resolves.
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const callIdRef = useRef(0)

  const run = useCallback(() => {
    const callId = ++callIdRef.current
    setLoading(true)
    setError(null)
    asyncFn()
      .then((result) => {
        if (callIdRef.current === callId) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (callIdRef.current === callId) {
          setError(err)
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  return { data, loading, error, refetch: run }
}
