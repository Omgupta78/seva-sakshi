# Seva Sakshi — Integration Status (honest capability map)

This document states plainly what is **REAL**, what needs **CONFIGURATION**, what
is **DEMO/SEEDED**, and what is **NOT IMPLEMENTED**. The app never fabricates a
face match, a live CCTV feed, a video participant, or GPS coordinates — an
unconfigured integration says so via `src/services/integrationConfig.js`.

## Integration switches (`src/services/integrationConfig.js`)

| Integration | Default | Values | Env var |
| --- | --- | --- | --- |
| Identity / face recognition | `not-connected` | `not-connected` / `demo` / `live` | `VITE_RECOGNITION_MODE` |
| CCTV media gateway | `not-configured` | `not-configured` / `demo` / `live` | `VITE_CCTV_GATEWAY` |
| Video / signaling service | `not-configured` | `not-configured` / `demo` / `live` | `VITE_VIDEO_SERVICE` |

Demo opt-in for a controlled demonstration (turns all three to clearly-labelled
`demo`): in the browser console `localStorage.setItem('seva-demo-integrations','1')`
then reload. Everything it enables stays visibly labelled DEMO.

## Capability map

| Capability | Status | Notes |
| --- | --- | --- |
| Data persistence | **REAL (prototype)** | localStorage snapshot layer (`persist.js`); survives refresh/restart/logout. Not a shared DB — see below. |
| RBAC (routes + service layer) | **REAL** | Enforced in `authz.js` + `PortalRoute` + `RequirePermission`. |
| Three portals + auth | **REAL (demo accounts)** | Real session + role redirects; demo credentials. |
| Device camera (preview/capture) | **REAL** | `useCamera` / `CameraCapture` use `navigator.mediaDevices.getUserMedia`; permission/denied/unavailable handled; tracks stopped on unmount. |
| GPS / location | **REAL** | `useGeolocation` uses the browser Geolocation API; denial shown honestly, never invented. |
| Attendance workflow + teacher verification | **REAL** | Sessions, manual verification, submit → lock, corrections + audit; persisted; shared across portals. |
| Inspection workflow + dept review | **REAL** | Assignment → checklist → evidence → report → review; persisted. |
| CCTV camera registration (CRUD) | **REAL (prototype)** | register/update/delete/status persisted (config only; no RTSP creds client-side). |
| Face detection / matching | **CONFIGURATION REQUIRED** | Default `not-connected` → attendance uses authorized manual verification. Needs an authorized biometric provider (`VITE_RECOGNITION_MODE=live` + a real `FaceRecognitionService` impl). |
| CCTV live playback | **CONFIGURATION REQUIRED** | Default shows "Camera gateway not configured". Needs a media gateway (RTSP→HLS/WebRTC) + backend playback endpoint (`VITE_CCTV_GATEWAY=live`). See REAL-CCTV-INTEGRATION.md. |
| Video call (remote participant) | **CONFIGURATION REQUIRED** | Default shows "Video service not configured". Local camera/mic preview is real; a real call needs signaling + STUN/TURN (`VITE_VIDEO_SERVICE=live`). |
| Camera health / heartbeat | **DEMO/SEEDED** | Seed inventory + statuses are labelled seed data; real health needs the gateway. |
| AI / anomaly analytics | **DEMO (advisory)** | Transparent means/deltas, labelled "requires human verification"; never a fraud verdict. |
| Notifications | **REAL (in-app, seeded)** | Read/unread over the local data layer. |
| Shared production database | **NOT IMPLEMENTED** | No backend in this repo (see below). |

## Environment variables (for LIVE)

```
# Recognition (authorized biometric provider)
VITE_RECOGNITION_MODE=live

# CCTV media gateway
VITE_CCTV_GATEWAY=live
# gateway/backend URL + server-side RTSP credentials live on the server, NEVER in the browser

# Video / signaling
VITE_VIDEO_SERVICE=live
# signaling (WebSocket) URL + STUN/TURN config (server-side / short-lived tokens)

# A real backend/database (see below)
VITE_API_BASE_URL=https://<your-api>
```

## Persistence: prototype vs production

Today, all data is snapshotted to **localStorage** via `src/services/persist.js`.
This is real persistence across refresh/restart/logout **on one browser** — it is
NOT a shared multi-user database, and it is not claimed to be production storage.

To connect a real backend/database: implement the API behind the existing
service functions (each `loadStore`/`saveStore` call is the swap point) —
replace them with `fetch(VITE_API_BASE_URL + …)` returning the SAME record
shapes. Suggested tables: users, roles, institutions, departments, projects,
students, staff, enrollment_records, attendance_sessions, attendance_records,
attendance_corrections, cameras, camera_health, inspections,
inspection_assignments, checklist_items, evidence, reports, notifications,
audit_events, video_call_sessions. Every record already carries a stable id +
timestamps.

## What is NOT faked
- No student is marked Present because a camera shows a face.
- No CCTV feed is presented as live without a gateway.
- No video "participant" is presented as a real connected person.
- No GPS coordinate is invented when permission is denied.
- No fabricated heartbeat/health is presented as a real device status.
