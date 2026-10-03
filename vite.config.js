import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { summarizeFeedback } from './api/src/summarizeCore.js'

// Lets `npm run dev` answer /api/summarize on your laptop, using the same code
// as the Azure Function. Keys come from the .env file (never committed).
function localApi(env) {
  return {
    name: 'bug-bloom-local-api',
    configureServer(server) {
      server.middlewares.use('/api/summarize', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Use POST' }))
        }
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          const result = await summarizeFeedback(JSON.parse(raw || '{}'), env)
          res.end(JSON.stringify(result))
        } catch (err) {
          console.error('[api/summarize]', err.message)
          res.statusCode = err.status || 500
          res.end(JSON.stringify({
            error: err.expose ? err.message : 'The Grove Spirit is resting. Please try again in a moment.',
          }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' = load ALL .env values (server-side only — they are NOT sent to the browser)
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), localApi(env)],
  }
})
