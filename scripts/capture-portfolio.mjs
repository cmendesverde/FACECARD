import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const OUT_DIR = join(ROOT, 'portfolio-captures')
const PHOTOS_DIR = join(OUT_DIR, 'photos')
const VIDEO_DIR = join(OUT_DIR, 'videos')
const FRAMES_DIR = join(OUT_DIR, '_frames')

const BASE_URL = 'http://127.0.0.1:5173'
const API_URL = 'http://127.0.0.1:8000/api'
const ADMIN_EMAIL = 'admin@facecard.local'
const ADMIN_PASSWORD = 'password'
const COOKIE_PREF_KEY = 'facecard_cookie_preferences_v1'
const COOKIE_PREF_VALUE = JSON.stringify({
  essential: true,
  analytics: false,
  marketing: false,
  updated_at: new Date().toISOString(),
})

const VIEWPORTS = [
  {
    key: 'desktop',
    label: 'Desktop',
    width: 1440,
    height: 900,
    dpr: 1,
    mobile: false,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
  },
  {
    key: 'mobile',
    label: 'Mobile',
    width: 390,
    height: 844,
    dpr: 2,
    mobile: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
]

const VIDEO_FPS = 8

const wait = (ms) =>
  new Promise((resolveWait) => {
    setTimeout(resolveWait, ms)
  })

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe'),
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'),
]

const findChrome = () => {
  const chromePath = chromeCandidates.find((candidate) => candidate && existsSync(candidate))

  if (!chromePath) {
    throw new Error('No encontre Chrome, Edge ni Chromium para generar capturas.')
  }

  return chromePath
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 1
    this.pending = new Map()
    this.handlers = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)

    await new Promise((resolveConnect, rejectConnect) => {
      this.ws.addEventListener('open', resolveConnect, { once: true })
      this.ws.addEventListener('error', rejectConnect, { once: true })
    })

    this.ws.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data)

      if (payload.id && this.pending.has(payload.id)) {
        const { resolve: resolvePending, reject } = this.pending.get(payload.id)
        this.pending.delete(payload.id)

        if (payload.error) {
          reject(new Error(payload.error.message))
        } else {
          resolvePending(payload.result)
        }

        return
      }

      if (payload.method && this.handlers.has(payload.method)) {
        for (const handler of this.handlers.get(payload.method)) {
          handler(payload.params)
        }
      }
    })
  }

  send(method, params = {}) {
    const id = this.nextId
    this.nextId += 1

    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) ?? []
    handlers.push(handler)
    this.handlers.set(method, handlers)

    return () => {
      const current = this.handlers.get(method) ?? []
      this.handlers.set(
        method,
        current.filter((candidate) => candidate !== handler),
      )
    }
  }

  close() {
    this.ws?.close()
  }
}

const waitForCdp = async (port) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)

      if (response.ok) {
        return response.json()
      }
    } catch {
      // Browser is still starting.
    }

    await wait(100)
  }

  throw new Error('Chrome no abrio el puerto de depuracion a tiempo.')
}

const createTab = async (port) => {
  let response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  })

  if (!response.ok) {
    response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`)
  }

  if (!response.ok) {
    throw new Error('No pude crear una pestaña de captura.')
  }

  const target = await response.json()
  const client = new CdpClient(target.webSocketDebuggerUrl)
  await client.connect()
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Network.enable')

  return client
}

const launchChrome = async () => {
  const port = 9333 + Math.floor(Math.random() * 1000)
  const userDataDir = join(OUT_DIR, `.chrome-profile-${port}`)
  const chrome = findChrome()

  await rm(userDataDir, { force: true, recursive: true })
  await mkdir(userDataDir, { recursive: true })

  const proc = spawn(chrome, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    'about:blank',
  ])

  proc.on('error', (error) => {
    throw error
  })

  await waitForCdp(port)

  return { port, proc, userDataDir }
}

const evaluate = async (client, expression, awaitPromise = true) => {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  })

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'Runtime.evaluate fallo')
  }

  return result.result?.value
}

const configureViewport = async (client, viewport) => {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.dpr,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  })

  await client.send('Emulation.setUserAgentOverride', {
    userAgent: viewport.userAgent,
  })
}

const waitForLoad = async (client, timeout = 9000) => {
  await Promise.race([
    new Promise((resolveLoad) => {
      const off = client.on('Page.loadEventFired', () => {
        off()
        resolveLoad()
      })
    }),
    wait(timeout),
  ])
}

const navigate = async (client, url, waitMs = 900) => {
  await client.send('Page.navigate', { url })
  await waitForLoad(client)
  await wait(waitMs)
  await evaluate(
    client,
    `Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      ...Array.from(document.images).filter((img) => !img.complete).map((img) => new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }))
    ])`,
  ).catch(() => undefined)
}

const setLocalStorage = async (client, token = null) => {
  await navigate(client, BASE_URL, 350)

  await evaluate(
    client,
    `
      localStorage.setItem(${JSON.stringify(COOKIE_PREF_KEY)}, ${JSON.stringify(COOKIE_PREF_VALUE)});
      ${
        token
          ? `localStorage.setItem('facecard_token', ${JSON.stringify(token)});`
          : "localStorage.removeItem('facecard_token');"
      }
      true;
    `,
  )
}

const loginForToken = async () => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  if (!response.ok) {
    throw new Error(`No pude autenticar el usuario demo (${response.status}).`)
  }

  const payload = await response.json()
  return payload.token
}

const getFirstTalentId = async () => {
  const response = await fetch(`${API_URL}/talents`)

  if (!response.ok) {
    return 1
  }

  const payload = await response.json()
  const records = Array.isArray(payload) ? payload : payload.data
  return records?.[0]?.id ?? 1
}

const captureFullPage = async (client, filePath) => {
  await evaluate(client, 'window.scrollTo(0, 0); true;', false)
  await wait(250)

  const metrics = await client.send('Page.getLayoutMetrics')
  const contentSize = metrics.cssContentSize ?? metrics.contentSize
  const width = Math.ceil(contentSize.width)
  const height = Math.ceil(contentSize.height)

  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width,
      height,
      scale: 1,
    },
  })

  await writeFile(filePath, Buffer.from(screenshot.data, 'base64'))
}

const captureViewportFrame = async (client) => {
  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 84,
    fromSurface: true,
    captureBeyondViewport: false,
  })

  return screenshot.data
}

const easeInOut = (value) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2)

const recordLoginFrames = async (client, frames, durationMs = 5600) => {
  await setLocalStorage(client, null)
  await navigate(client, `${BASE_URL}/login`, 250)

  const frameCount = Math.ceil((durationMs / 1000) * VIDEO_FPS)

  for (let index = 0; index < frameCount; index += 1) {
    frames.push(await captureViewportFrame(client))
    await wait(1000 / VIDEO_FPS)
  }
}

const recordScrollRoute = async (client, frames, token, route, seconds = 2.4) => {
  await setLocalStorage(client, token)
  await navigate(client, `${BASE_URL}${route}`, 900)

  const totalFrames = Math.max(8, Math.ceil(seconds * VIDEO_FPS))
  const scrollInfo = await evaluate(
    client,
    `({
      max: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      viewport: window.innerHeight
    })`,
  )

  for (let index = 0; index < totalFrames; index += 1) {
    const progress = totalFrames === 1 ? 1 : index / (totalFrames - 1)
    const scrollY = Math.round((scrollInfo.max ?? 0) * easeInOut(progress))
    await evaluate(client, `window.scrollTo(0, ${scrollY}); true;`, false)
    await wait(90)
    frames.push(await captureViewportFrame(client))
  }
}

const recordVideoFrames = async (client, viewport, token, talentId) => {
  const frames = []

  await recordLoginFrames(client, frames)

  const routes = [
    '/dashboard',
    '/',
    '/discover',
    `/talents/${talentId}`,
    '/bookings',
    '/quienes-somos',
    '/contact',
  ]

  for (const route of routes) {
    await recordScrollRoute(client, frames, token, route, viewport.mobile ? 2.1 : 2.4)
  }

  return frames
}

const setupRecorder = async (client, viewport) => {
  await navigate(client, 'about:blank', 100)

  await evaluate(
    client,
    `
      (async () => {
        document.body.style.margin = '0';
        document.body.style.background = '#000';
        const canvas = document.createElement('canvas');
        canvas.width = ${viewport.width * viewport.dpr};
        canvas.height = ${viewport.height * viewport.dpr};
        canvas.style.width = '${viewport.width}px';
        canvas.style.height = '${viewport.height}px';
        document.body.appendChild(canvas);

        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        window.__drawFrame = (src) => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            context.fillStyle = '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(true);
          };
          image.onerror = () => reject(new Error('No se pudo cargar un frame de video.'));
          image.src = src;
        });

        const stream = canvas.captureStream(${VIDEO_FPS});
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        const chunks = [];
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: ${viewport.mobile ? 3_500_000 : 6_000_000},
        });
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        window.__stopRecorder = () => new Promise((resolve) => {
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          };
          recorder.stop();
        });
        recorder.start();
        return true;
      })();
    `,
  )
}

const renderVideo = async (client, viewport, frames, filePath) => {
  await setupRecorder(client, viewport)

  for (const frame of frames) {
    await evaluate(client, `window.__drawFrame(${JSON.stringify(`data:image/jpeg;base64,${frame}`)})`)
    await wait(1000 / VIDEO_FPS)
  }

  const base64Video = await evaluate(client, 'window.__stopRecorder()')
  await writeFile(filePath, Buffer.from(base64Video, 'base64'))
}

const capturePhotosForViewport = async (client, viewport, token, routes) => {
  const viewportDir = join(PHOTOS_DIR, viewport.key)
  await mkdir(viewportDir, { recursive: true })

  for (const [index, route] of routes.entries()) {
    if (route.login) {
      await setLocalStorage(client, null)
      await navigate(client, `${BASE_URL}/login`, 850)
    } else {
      await setLocalStorage(client, route.auth ? token : null)
      await navigate(client, `${BASE_URL}${route.path}`, route.waitMs ?? 900)
    }

    const fileName = `${String(index + 1).padStart(2, '0')}-${route.slug}.png`
    await captureFullPage(client, join(viewportDir, fileName))
    console.log(`[photo:${viewport.key}] ${fileName}`)
  }
}

const main = async () => {
  await mkdir(PHOTOS_DIR, { recursive: true })
  await mkdir(VIDEO_DIR, { recursive: true })
  await rm(FRAMES_DIR, { recursive: true, force: true })
  await mkdir(FRAMES_DIR, { recursive: true })

  const token = await loginForToken()
  const talentId = await getFirstTalentId()
  const routes = [
    { slug: 'home', path: '/' },
    { slug: 'discover', path: '/discover' },
    { slug: 'cities', path: '/cities' },
    { slug: 'talent-profile', path: `/talents/${talentId}` },
    { slug: 'about', path: '/quienes-somos' },
    { slug: 'contact', path: '/contact' },
    { slug: 'login-scan', path: '/login', login: true },
    { slug: 'dashboard', path: '/dashboard', auth: true },
    { slug: 'bookings', path: '/bookings', auth: true },
    { slug: 'privacy-policy', path: '/privacy-policy' },
    { slug: 'cookie-policy', path: '/cookie-policy' },
  ]

  const browser = await launchChrome()

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n=== ${viewport.label} ===`)
      const captureClient = await createTab(browser.port)
      await configureViewport(captureClient, viewport)

      await capturePhotosForViewport(captureClient, viewport, token, routes)
      const frames = await recordVideoFrames(captureClient, viewport, token, talentId)
      console.log(`[video:${viewport.key}] renderizando ${frames.length} frames`)

      const renderClient = await createTab(browser.port)
      await configureViewport(renderClient, viewport)
      await renderVideo(renderClient, viewport, frames, join(VIDEO_DIR, `facecard-${viewport.key}-tour.webm`))

      renderClient.close()
      captureClient.close()
    }
  } finally {
    browser.proc.kill()
    await wait(500)
    await rm(browser.userDataDir, { force: true, recursive: true })
    await rm(FRAMES_DIR, { force: true, recursive: true })
  }

  console.log(`\nListo: ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
