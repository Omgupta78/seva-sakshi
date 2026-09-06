import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// NOTE: React.StrictMode is intentionally NOT used. Its dev-only double-invoke
// of effects mounts every component twice, which breaks stateful real-time
// setup like the WebRTC call session (two peer registrations on one code → an
// "already online" clash, plus a duplicate outgoing call that leaves the caller
// stuck on "Calling"). Production never double-invokes, so running dev the same
// way keeps behaviour consistent for the live 2-device video call.
createRoot(document.getElementById('root')).render(<App />)
