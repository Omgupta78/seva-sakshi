import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// `allowedHosts` lets the app be served through a Cloudflare quick tunnel
// (npm run share) whose hostname is a random *.trycloudflare.com subdomain.
// Scoped to that domain (plus localhost) rather than `true`, so Vite's
// DNS-rebinding protection still blocks arbitrary/unknown hosts. Add your
// own domain here if you later put the tunnel behind a fixed hostname.
const allowedHosts = ['.trycloudflare.com', 'localhost', '127.0.0.1']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { allowedHosts },
  server: { allowedHosts },
})
