/**
 * ---------------------------------------------------------------------
 * DEMO SERVICE LAYER — stands in for a real backend
 * ---------------------------------------------------------------------
 * This project has no backend/database (confirmed: no server, no API
 * routes, no ORM anywhere in the repo). Rather than hardcode data
 * directly inside components, every read/write for Projects and
 * Organizations goes through services/projectsService.js and
 * services/organizationsService.js, which:
 *
 *   - expose the exact async function signatures a real API client would
 *     (list/get/create/update, all returning Promises),
 *   - simulate network latency via `delay()` below, and
 *   - keep their data in an in-memory store seeded from
 *     data/projectsSeedData.js (mutated by create/update, so Add/Edit/
 *     Activate-Deactivate genuinely work for the lifetime of the tab).
 *
 * To wire up a real backend, replace each function body with a fetch()
 * call, e.g.:
 *
 *   export async function listProjects(params) {
 *     const res = await fetch(`/api/projects?${new URLSearchParams(params)}`)
 *     if (!res.ok) throw new Error('Failed to load projects')
 *     return res.json()
 *   }
 *
 * No component should need to change — they already only depend on
 * these function signatures, not on how the data is fetched.
 * ---------------------------------------------------------------------
 */
export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}
