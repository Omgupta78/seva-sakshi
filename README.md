# Seva Sakshi — Portal + Department Login

A two-page government e-governance site built with **React**, **React Router**,
**Tailwind CSS v4**, and **Lucide React** icons:

- **`/` — Seva Sakshi landing page**: the public-facing DoSJE monitoring portal
  (rotating hero background, bilingual English/हिन्दी UI, search, quick-access links,
  mission statement).
- **`/login` — Department Login**: the staff-facing login screen (department select,
  employee ID, password, captcha, validation, demo authentication).

The two pages are cross-linked: the **"Login"** button in the landing page's header
(and in its mobile menu) routes to `/login`; the Department Login header's logo routes
back to `/`.

## Tech stack

- **React 19** (function components + hooks) with **React Router** for client-side routing
- **Vite** as the build tool / dev server
- **Tailwind CSS v4** (via `@tailwindcss/vite`, theme tokens live in `src/index.css` —
  no `tailwind.config.js` needed)
- **lucide-react** for all icons
- Plain CSS utility classes only — no external UI component library

## Project structure

```
src/
  App.jsx                       Router: "/" -> Landing, "/login" -> Login
  index.css                     Tailwind import + theme tokens (colors, font, --fs-scale)
  main.jsx                      React root

  pages/
    Landing.jsx                 Seva Sakshi landing page ("/") — owns page-level UI state
                                 (font scale, high-contrast mode, nav-panel open/closed)
    Login.jsx                   Department Login page ("/") — the original login screen

  components/                   Department Login's components
    Header.jsx                  Navy header; logo links back to "/"
    HeroLeft.jsx                 "Welcome to…" heading, tagline, watermark, feature grid
    FeatureCard.jsx              One feature tile
    LoginCard.jsx                Heading + LoginForm + "or" + Citizen Login
    LoginForm.jsx                 Form state, validation, demo auth call
    FormInput.jsx                Reusable labeled input (icon, error, show/hide password)
    DepartmentSelect.jsx         The department <select> + DEPARTMENTS list
    Captcha.jsx                  Captcha display + refresh + generateCaptcha()
    Alert.jsx                    Dismissible error banner
    Modal.jsx                    Accessible dialog (Forgot Password / Citizen Login)
    Footer.jsx                   Light-blue footer

    landing/                    Seva Sakshi landing page's components
      UtilityBar.jsx             Skip link, sitemap, accessibility, font size, language, menu
      SiteHeader.jsx             Logo + primary nav + "Login" button -> /login
      BrandMark.jsx              Shared inline-SVG logo mark
      Hero.jsx                   Rotating background, wordmark, search bar, quick access
      MissionCard.jsx            Quote/mission card
      LandingFooter.jsx          Dark footer with brand lockup + links
      NavPanel.jsx                Mobile slide-in menu, includes its own "Login" link

  context/
    LangContext.jsx              English/Hindi dictionary + useLang() hook (landing page only)

  hooks/
    useHeroBackgroundRotation.js Two-layer crossfade background rotation
                                 (HERO_BACKGROUND_IMAGES array lives here — edit to swap images)
```

## Running locally

Requires Node.js 18+ (Node 20+ recommended).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`) — that's the Seva
Sakshi landing page. Click **Login** (top-right, or in the mobile menu) to reach the
Department Login at `/login`.

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## Testing the camera on a physical phone

The attendance camera (Institute → **Start Attendance** → open a session →
**Open Camera**) uses the browser's real `navigator.mediaDevices.getUserMedia()`.
That API only works in a **secure context**: `https://` **or** `http://localhost`.

- On your **laptop**, `http://localhost:5173` is a secure context, so the camera
  works there directly.
- On a **phone**, opening your laptop by LAN IP (e.g. `http://192.168.1.20:5173`)
  is **not** a secure context — the camera will be blocked and the app shows
  *"The camera needs a secure (HTTPS) connection."* You must reach the app over
  **HTTPS**. Use one of the two methods below.

### Camera behaviour you can rely on

- The camera is requested **only** after you explicitly click **Open Camera**
  inside a started attendance session — never on page load.
- Permission outcomes are handled distinctly: **granted** (live preview),
  **denied**, **no camera found**, **already in use**, **insecure/HTTP**, and
  **unsupported browser** — each with its own on-screen message and a Retry.
- Every camera track is stopped when you press **Stop camera**, when attendance
  is captured/ends, when you navigate away from the page, and when you log out.
- The video preview uses `playsInline` + `muted` so it works on **Android
  Chrome**, **iPhone Safari** (iOS 11+), and desktop browsers, in a responsive
  16:9 frame.
- The `MediaStream` is only ever held in memory — it is **never** written to
  `localStorage`/`sessionStorage`, and no backend secret is involved (the client
  only ships `VITE_`-prefixed public config).

---

### METHOD A — Local HTTPS via a tunnel (recommended for dev)

```
Laptop → local React app (localhost) → HTTPS tunnel → phone browser
```

This exposes your locally-running app at a temporary **`https://…`** URL your
phone can open. It uses [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
(install once: `winget install Cloudflare.cloudflared`).

**Option A1 — one command (production build + tunnel), simplest:**

```bash
npm run share
```

Keep that window open and look for the line ending in **`.trycloudflare.com`**.

**Option A2 — live-reload dev server + tunnel (two terminals):**

```bash
# terminal 1 — dev server, reachable by the tunnel
npm run dev -- --host

# terminal 2 — open an HTTPS tunnel to the dev server
cloudflared tunnel --url http://localhost:5173
```

`vite.config.js` already allow-lists `*.trycloudflare.com`, so the tunnel URL
loads without extra config.

**On your phone:** open the printed HTTPS URL, e.g.

```
https://<random-words>.trycloudflare.com
```

(the exact subdomain is generated fresh each run — copy it from the terminal).
Then: **Institute login → Attendance → Start Attendance Session → open the
session → Open Camera → Allow** when the browser asks for camera permission.

> iPhone Safari only grants camera on a genuine `https://` origin (which the
> tunnel provides) and requires you to tap **Allow** on the permission prompt.

#### A permanent (fixed) phone URL — ngrok free static domain

`npm run share` / the quick tunnel give a **new random** `*.trycloudflare.com`
URL each run. To get a **stable** URL like `https://your-name.ngrok-free.dev`
that never changes, use ngrok's **free static domain** (one per free account —
no domain purchase needed).

**One-time setup:**

1. Create a free account at <https://dashboard.ngrok.com>.
2. Install ngrok: `winget install Ngrok.Ngrok`
3. Add your authtoken (from the dashboard): `ngrok config add-authtoken <YOUR_TOKEN>`
4. In the dashboard, open **Domains** and claim your free static domain, e.g.
   `your-name.ngrok-free.dev`.
5. Put it in a `.env` file in the project root:

   ```
   NGROK_DOMAIN=your-name.ngrok-free.dev
   ```

Vite already trusts `*.ngrok-free.dev`, so nothing else to configure. (The
authtoken lives in ngrok's own config, never in this repo.)

**Every time you want the app on your phone** (two terminals):

```bash
# terminal 1 — dev server
npm run dev -- --host

# terminal 2 — open your permanent ngrok tunnel (reads NGROK_DOMAIN from .env)
npm run tunnel
```

**On your phone, always open the same URL:**

```
https://your-name.ngrok-free.dev
```

Then: **Institute login → Attendance → Start Attendance Session → open the
session → Open Camera → Allow.** Because it's a real `https://` origin, the
camera works on Android Chrome and iPhone Safari, and the URL is identical every
session — no copy-pasting a fresh link each time.

> `npm run tunnel` points ngrok at `http://localhost:5173` (the dev server). If
> you serve a preview build instead (`npm run preview -- --port 4173`), change
> the port in `ngrok.ps1`.

### METHOD B — Production / staging HTTPS deployment

```
Frontend → HTTPS static hosting        Backend → HTTPS API
```

For a shared/staging environment, deploy the built frontend to any HTTPS static
host and (if/when a backend is added) point it at an HTTPS API:

```bash
npm run build     # outputs static assets to dist/
# deploy dist/ to Vercel / Netlify / Cloudflare Pages / any HTTPS static host
```

- The frontend **must** be served over `https://` for the camera to work.
- This app is currently **frontend-only**; when a backend is introduced, serve
  its API over `https://` too and expose only `VITE_`-prefixed public values to
  the client (never service keys or secrets — see `.env.example`).
- Once hosted, open the deployment's `https://…` URL on the phone and follow the
  same **Start Attendance → Open Camera → Allow** steps.

## Demo login

This is a **frontend-only demo** — there is no backend, and no real authentication
happens. `LoginForm.jsx` contains a hard-coded demo account so you can exercise the
full happy path:

- **Department:** any option
- **Employee ID:** `EMP1001`
- **Password:** `Passw0rd!`
- **Captcha:** whatever is currently displayed (it's regenerated client-side)

Any other Employee ID / password combination will correctly fail with an "Invalid
Employee ID, Password, or Captcha" error, and the captcha will refresh automatically
after a failed attempt.

### Wiring up a real backend

`authenticate()` at the top of `src/components/LoginForm.jsx` is the single place that
simulates the network call. Replace its body with a real API call, e.g.:

```js
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ department, employeeId, password, captchaInput }),
})
if (!res.ok) throw new Error('Invalid credentials')
return res.json()
```

Importantly, **captcha verification must happen server-side** in a real deployment —
the client-side check in `LoginForm.jsx` only exists so the demo has something to
validate against without a backend. Remove the client-side captcha comparison once a
real endpoint is in place and let the server reject bad captcha values instead.

## The landing page's rotating hero background

`src/hooks/useHeroBackgroundRotation.js` exports `HERO_BACKGROUND_IMAGES`, an array of
`{ url, alt }` objects — edit it to swap in your own images. The hook crossfades
between two layers every 30 seconds (1.5s crossfade), preloads the next image before
switching, and switches instantly with no crossfade under `prefers-reduced-motion`.

## Accessibility notes

- Every input has a real, associated `<label>` (via `htmlFor`/`id`).
- Field errors use `aria-invalid` + `aria-describedby`, and are announced via `role="alert"`.
- The Department Login's captcha value is exposed to screen readers through a `sr-only`
  live region, since the visible captcha box itself is `aria-hidden`.
- The "show/hide password" button uses `aria-pressed` and an `aria-label` that updates
  with its state.
- Both pages start with a "Skip to main content" link as the first focusable element.
- All interactive elements are reachable and operable via keyboard (native `button`,
  `select`, `input`, and `a`/`Link` elements throughout). Both pages' modal/panel
  overlays (Login's Forgot Password / Citizen Login dialogs, the landing page's mobile
  nav panel) move focus to themselves on open, close on `Escape`, and return focus
  sensibly on close.
- Focus states are visible everywhere via a consistent `:focus-visible` outline.
- The landing page's font-size control and high-contrast toggle apply to the whole
  document and are reset automatically when you navigate away from `/`.
