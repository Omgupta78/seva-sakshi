# Seva Sakshi — Real CCTV Integration Guide

**Status: NOT CONNECTED (demo mode).** This document explains exactly how to
connect a physical RTSP CCTV camera to Seva Sakshi. The application ships in
**demo mode** and works fully without any camera. Nothing here is required to
run or demonstrate the app.

> The Attendance camera (browser `getUserMedia` → face detection → recognition)
> is a **completely separate system** from CCTV streaming and is **not** touched
> by any of the steps below. See §10.

---

## Architecture

```
PHYSICAL CCTV CAMERA
      │  RTSP (private URL + credentials — SERVER-SIDE ONLY)
      ▼
MEDIA GATEWAY / SERVER            (MediaMTX · Janus · LiveKit · AWS Kinesis Video)
      │  repackages RTSP → browser-safe transport
      ▼
WebRTC  /  HLS (.m3u8)
      │
      ▼
BACKEND PLAYBACK ENDPOINT         (authorizes the user, mints a short-lived token)
      │  returns { transport, playbackUrl, token, expiresAt }  — NEVER the RTSP URL
      ▼
SEVA SAKSHI FRONTEND
   requestCameraPlayback(cameraId) → StreamProvider → VideoPlayer → <video>/WebRTC
```

The browser **only ever** receives a brokered, short-lived playback URL. The
raw RTSP URL, camera username/password, and gateway secrets **never leave the
server**.

---

## The frontend boundary (already built)

| Concern | Where it lives | Status |
| --- | --- | --- |
| Playback request | `src/services/streamProvider.js` → `requestCameraPlayback(cameraId)` | READY |
| Providers | `DemoStreamProvider` (active), `HLSStreamProvider`, `WebRTCStreamProvider` (placeholders) | Demo REAL · others READY |
| Broker (demo) | `src/services/cctvStreamService.js` → `requestPlayback`; `institutionCctvService.js` → `requestInstitutionPlayback` | DEMO |
| Config | `src/data/streamConfig.js` (`streamType`, `mediaServerId`, `playbackUrl`, ingestion) | READY |
| Health | `streamProvider.getCameraHealth(cameraId)` → `{ status, lastSeen, latency, reason }` | READY (demo values) |
| Player | `src/components/officer/cctv/VideoPlayer.jsx` (reads the descriptor only) | READY |
| Mode flag | `streamProvider.STREAM_MODE` (`'demo'` \| `'live'`, defaults to `demo`) | READY |

The UI does not know which provider is active — it renders whatever the
normalised descriptor says.

---

## 1. Physical camera requirements
- An IP camera that exposes an **RTSP** stream (most CCTV/NVR systems do).
- Reachable from the media gateway host (same LAN/VLAN, or via a secure tunnel).
- A dedicated, least-privilege camera account (do not use the admin account).

## 2. RTSP URL requirement
- Format is vendor-specific, e.g. `rtsp://<user>:<pass>@<camera-ip>:554/Streaming/Channels/101`.
- **This URL and its credentials are secrets.** Store them only in the media
  gateway / backend secret manager. They must never appear in this repo, in
  React state, or in any network response to the browser.

## 3. Network accessibility
- The gateway must reach the camera on its RTSP port (default `554`).
- The browser must reach only the **gateway's** HLS/WebRTC output (via the
  backend), never the camera directly.
- Terminate TLS at the gateway/CDN; serve HLS/WebRTC over HTTPS/WSS.

## 4. Media server requirement
Deploy one media gateway that ingests RTSP and outputs a browser transport:
- **MediaMTX** (simple, RTSP→HLS/WebRTC), **Janus** or **LiveKit** (WebRTC),
  or **AWS Kinesis Video Streams** (managed).
- Keep RTSP credentials in the gateway config / secret manager.

## 5. RTSP ingestion
- Point the gateway at each camera's RTSP source (server-side only).
- Enable low-latency output: WebRTC (≈sub-second) and/or HLS (wider support,
  good for recorded playback).

## 6. WebRTC / HLS output
- **HLS**: gateway publishes `…/index.m3u8`; the frontend plays it with a
  `<video>` element + `hls.js` (Safari plays HLS natively).
- **WebRTC**: the frontend negotiates SDP with the gateway (offer/answer
  proxied by the backend) and attaches the received `MediaStream` to `<video>`.

## 7. Backend playback endpoint
Implement an authenticated endpoint, e.g.:

```
POST /api/cctv/:cameraId/playback
  → verify session/JWT and RBAC (same rules as the frontend:
     Department = all authorized; Institute = own; Inspector = assigned)
  → ask the gateway for a short-lived, per-session URL + token
  → respond: { transport: 'hls'|'webrtc', playbackUrl, token, expiresAt }
```

The response **must not** include the RTSP URL or any credential.

## 8. Frontend playback
1. In `src/data/streamConfig.js`, register the real gateway in `MEDIA_SERVERS`
   and set each camera's `streamType` (`HLS` or `WEBRTC`).
2. In `src/services/cctvStreamService.js` (and `institutionCctvService.js`),
   replace the demo body of `requestPlayback`/`requestInstitutionPlayback` with
   a `fetch` to `POST /api/cctv/:cameraId/playback` and return its JSON.
   *(Alternatively implement the fetch inside `HLSStreamProvider.getStream` /
   `WebRTCStreamProvider.getStream` in `streamProvider.js`.)*
3. Set `STREAM_MODE = 'live'` in `src/services/streamProvider.js`
   (ideally driven by a build-time env var; **keep the default `'demo'`**).
4. In `VideoPlayer.jsx`, when `session.mode === 'live'` and `available`, render
   a real `<video>`:
   - HLS: `new Hls().loadSource(session.playbackUrl); hls.attachMedia(video)`
     (or set `video.src` directly on Safari).
   - WebRTC: create an `RTCPeerConnection`, exchange SDP via the backend, and
     set `video.srcObject` to the received stream.
   Wire Play / Pause / Mute / Fullscreen to that `<video>` element.
5. Leave the demo path untouched — it is the guaranteed fallback (§9, §20).

No other application code needs to change: RBAC, inventory, health, map, alerts,
Institute/Inspector scoping, and the camera detail UI all already consume the
provider boundary.

## 9. Authentication
- The browser is never trusted. `POST /api/cctv/:cameraId/playback` re-checks
  the session and the **same RBAC** enforced client-side (`VIEW_CCTV`,
  `VIEW_ASSIGNED_CCTV`, `VIEW_OWN_CCTV`).
- Tokens are **short-lived** (seconds–minutes) and **per camera + per session**.
- Revoke the token on `stopStream(token)` / player unmount.

## 10. Testing procedure
1. Bring up the media gateway with one camera's RTSP source.
2. Verify the gateway plays back locally (e.g. `ffplay` the HLS URL on the
   server, or the gateway's test page).
3. Implement `POST /api/cctv/:cameraId/playback`; confirm it returns a URL/token
   and **never** the RTSP URL (check the network tab).
4. Set `STREAM_MODE='live'` for a single test camera; open its detail page.
   - Online → the real feed plays and the pill reads **LIVE**.
   - Camera down → **LIVE FEED UNAVAILABLE** (never a frozen or fake frame).
5. Verify RBAC: an Institute user sees only its own camera; an Inspector only
   assigned cameras; a Department user the authorized set.
6. Confirm no RTSP URL/credential appears anywhere in the browser (DOM, React
   state, network responses).

---

## Local development options

| Option | Setup | Use |
| --- | --- | --- |
| **A — Real IP CCTV** | Real camera → gateway → backend endpoint → `STREAM_MODE='live'` | Full end-to-end validation |
| **B — RTSP test source** | Publish a test RTSP stream (e.g. `ffmpeg` looping a file, or MediaMTX's built-in publisher) into the gateway; same backend path | Validate the pipeline without a physical camera |
| **C — Demo stream** (default) | Nothing to set up; `STREAM_MODE='demo'` | UI/demo; **the app always works here** |

**The application must keep working without a real camera.** Option C is the
default and the guaranteed judging fallback.

---

## Security checklist (must always hold)
- [ ] RTSP URLs + credentials live only on the server / gateway.
- [ ] No credential is hardcoded, in React state, or in a network response.
- [ ] The browser receives only a short-lived brokered HLS/WebRTC URL + token.
- [ ] `STREAM_MODE` defaults to `demo`; live is opt-in.
- [ ] When live is unavailable, the UI shows **"Live feed unavailable"** — never
      a fake or frozen "live" frame.
- [ ] The backend re-enforces RBAC on every playback request.

## What is REAL vs DEMO vs READY vs NOT IMPLEMENTED
- **REAL:** the provider boundary, config/health interfaces, RBAC, honest
  offline/unavailable states, the "no credentials in the browser" guarantee.
- **DEMO:** the video feed itself (simulated scene), camera health latency
  values, media gateway (`MG-DEMO-1`).
- **READY FOR INTEGRATION:** `HLSStreamProvider`, `WebRTCStreamProvider`,
  `requestCameraPlayback`, `STREAM_MODE='live'`, the backend playback endpoint
  contract.
- **NOT IMPLEMENTED:** a production media gateway, the backend playback
  endpoint, real WebRTC/HLS playback in `VideoPlayer`, and any real camera.
