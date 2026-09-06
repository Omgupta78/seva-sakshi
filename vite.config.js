import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
//
// `allowedHosts` lets the app be served through a tunnel without tripping Vite's
// DNS-rebinding protection. It always allows:
//   - localhost / 127.0.0.1 (local dev)
//   - *.trycloudflare.com   (the quick tunnel from `npm run share`)
//   - *.ngrok-free.dev / *.ngrok-free.app / *.ngrok.app (ngrok, incl. your
//     free STATIC domain — new ones are issued on ngrok-free.dev)
// and, when set, an extra hostname from VITE_TUNNEL_HOST in .env (any other
// custom/permanent tunnel host). Scoped to these rather than `true`, so unknown
// hosts are still blocked.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = ['.trycloudflare.com', '.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', 'localhost', '127.0.0.1']
  if (env.VITE_TUNNEL_HOST) allowedHosts.push(env.VITE_TUNNEL_HOST)

  return {
    plugins: [react(), tailwindcss()],
    preview: { allowedHosts },
    server: { allowedHosts },
  }
})
