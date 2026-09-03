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
