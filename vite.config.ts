import { spawn, type ChildProcess } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function pythonBackend(): Plugin {
  let child: ChildProcess | undefined
  return {
    name: 'python-backend',
    apply: 'serve',
    configureServer(server) {
      if (child) return
      child = spawn(
        process.env.PYTHON ?? 'python',
        ['-m', 'uvicorn', 'server.app:app', '--reload', '--host', '127.0.0.1', '--port', '8787'],
        {
          cwd: server.config.root,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        },
      )
      const log = (chunk: Buffer) => {
        const text = chunk.toString().trimEnd()
        if (text) server.config.logger.info(`[api] ${text}`)
      }
      child.stdout?.on('data', log)
      child.stderr?.on('data', log)
      const stop = () => {
        if (!child?.pid) return
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' })
        } else {
          child.kill()
        }
        child = undefined
      }
      process.once('exit', stop)
      server.httpServer?.once('close', stop)
    },
  }
}

export default defineConfig({
  plugins: [react(), pythonBackend()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
