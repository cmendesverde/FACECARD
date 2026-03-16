import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const MotionLine = motion.div

const MAX_PROGRESS = 100

const normalizeEmail = (value) => value.trim().toLowerCase()

const resolvePair = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (value && typeof value.arraySync === 'function') {
    return value.arraySync()
  }

  if (value && typeof value.length === 'number') {
    return Array.from(value)
  }

  return [0, 0]
}

const getPredictionBox = (prediction) => {
  const topLeft = resolvePair(prediction.topLeft)
  const bottomRight = resolvePair(prediction.bottomRight)

  return {
    x: Number(topLeft[0] ?? 0),
    y: Number(topLeft[1] ?? 0),
    width: Math.max(0, Number(bottomRight[0] ?? 0) - Number(topLeft[0] ?? 0)),
    height: Math.max(0, Number(bottomRight[1] ?? 0) - Number(topLeft[1] ?? 0)),
  }
}

const isFaceCentered = (box, videoWidth, videoHeight) => {
  const faceCenterX = box.x + box.width / 2
  const faceCenterY = box.y + box.height / 2

  const centerX = videoWidth / 2
  const centerY = videoHeight / 2

  const horizontalDistance = Math.abs(faceCenterX - centerX) / videoWidth
  const verticalDistance = Math.abs(faceCenterY - centerY) / videoHeight
  const faceRatio = box.width / videoWidth

  return horizontalDistance < 0.12 && verticalDistance < 0.16 && faceRatio > 0.2 && faceRatio < 0.58
}

const FaceLoginPanel = ({ email, onEmailChange, onFaceLogin }) => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const detectorModeRef = useRef('none')
  const timerRef = useRef(null)
  const cameraOnRef = useRef(false)

  const [status, setStatus] = useState('Listo para escanear')
  const [error, setError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [isLoadingCamera, setIsLoadingCamera] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectorEngine, setDetectorEngine] = useState('No activo')

  const hasCameraSupport = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    [],
  )

  const nativeDetectorAvailable = useMemo(
    () => typeof window !== 'undefined' && 'FaceDetector' in window,
    [],
  )

  const stopScanLoop = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopCamera = useCallback(() => {
    cameraOnRef.current = false
    stopScanLoop()
    detectorRef.current = null
    detectorModeRef.current = 'none'

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraOn(false)
    setFaceDetected(false)
    setDetectorEngine('No activo')
  }, [stopScanLoop])

  const updateProgress = useCallback((detected, centered) => {
    setFaceDetected(detected)

    setScanProgress((previous) => {
      if (!detected) {
        return Math.max(0, previous - 8)
      }

      if (!centered) {
        return Math.max(0, previous - 4)
      }

      return Math.min(MAX_PROGRESS, previous + 8)
    })
  }, [])

  const ensureFallbackDetector = useCallback(async () => {
    const tf = await import('@tensorflow/tfjs')

    try {
      if (!tf.getBackend()) {
        await tf.setBackend('webgl')
      }
    } catch {
      await tf.setBackend('cpu')
    }

    await tf.ready()

    const blazeface = await import('@tensorflow-models/blazeface')
    detectorRef.current = await blazeface.load()
    detectorModeRef.current = 'blazeface'
    setDetectorEngine('TensorFlow')
  }, [])

  const runDetection = useCallback(async () => {
    if (!cameraOnRef.current || !videoRef.current || !detectorRef.current) {
      return
    }

    try {
      const video = videoRef.current

      if (video.readyState >= 2) {
        let box = null

        if (detectorModeRef.current === 'native') {
          const faces = await detectorRef.current.detect(video)
          box = faces[0]?.boundingBox ?? null
        }

        if (detectorModeRef.current === 'blazeface') {
          const predictions = await detectorRef.current.estimateFaces(video, false)
          box = predictions[0] ? getPredictionBox(predictions[0]) : null
        }

        if (box) {
          const centered = isFaceCentered(box, video.videoWidth, video.videoHeight)
          updateProgress(true, centered)

          if (centered) {
            setStatus('Rostro detectado. Mantente inmovil...')
          } else {
            setStatus('Centra el rostro dentro del aro')
          }
        } else {
          updateProgress(false, false)
          setStatus('Buscando rostro...')
        }
      }
    } catch {
      setError('No pudimos analizar la camara. Recarga la pagina e intenta de nuevo.')
      stopCamera()
      return
    }

    timerRef.current = window.setTimeout(runDetection, 140)
  }, [stopCamera, updateProgress])

  const startCamera = useCallback(async () => {
    setError('')

    if (!hasCameraSupport) {
      setError('Este navegador no permite acceso a camara para Face ID.')
      return
    }

    setIsLoadingCamera(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (!videoRef.current) {
        throw new Error('No se pudo inicializar el video.')
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      let nativeReady = false

      if (nativeDetectorAvailable) {
        try {
          detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
          detectorModeRef.current = 'native'
          setDetectorEngine('Nativo')
          nativeReady = true
        } catch {
          nativeReady = false
        }
      }

      if (!nativeReady) {
        setStatus('Cargando motor compatible...')
        await ensureFallbackDetector()
      }

      setScanProgress(0)
      cameraOnRef.current = true
      setCameraOn(true)
      setStatus('Camara activa. Coloca tu rostro al centro.')
      timerRef.current = window.setTimeout(runDetection, 220)
    } catch (cameraError) {
      if (cameraError?.name === 'NotAllowedError') {
        setError('Debes permitir acceso a la camara para usar Face ID.')
      } else {
        setError('No se pudo abrir la camara. Verifica permisos y vuelve a intentar.')
      }

      stopCamera()
    } finally {
      setIsLoadingCamera(false)
    }
  }, [ensureFallbackDetector, hasCameraSupport, nativeDetectorAvailable, runDetection, stopCamera])

  const submitFaceLogin = useCallback(async () => {
    setError('')

    const cleanEmail = normalizeEmail(email)

    if (!cleanEmail) {
      setError('Escribe tu email para validar Face ID.')
      return
    }

    if (scanProgress < MAX_PROGRESS) {
      setError('Completa el escaneo facial antes de entrar.')
      return
    }

    setIsSubmitting(true)

    try {
      await onFaceLogin({
        email: cleanEmail,
        scan_passed: true,
        confidence: Number((scanProgress / 100).toFixed(2)),
      })

      setStatus('Validacion exitosa. Entrando...')
      stopCamera()
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'No se pudo completar el login biometrico.')
    } finally {
      setIsSubmitting(false)
    }
  }, [email, onFaceLogin, scanProgress, stopCamera])

  useEffect(() => {
    if (scanProgress >= MAX_PROGRESS) {
      setStatus('Rostro validado. Puedes entrar con Face ID.')
    }
  }, [scanProgress])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const progressPercentage = Math.max(0, Math.min(MAX_PROGRESS, scanProgress))

  return (
    <aside className="relative min-h-[560px] overflow-hidden border border-cyan-300/40 bg-[#030811] text-white md:min-h-[620px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(14,123,181,0.35),transparent_52%),radial-gradient(circle_at_75%_80%,rgba(14,123,181,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 p-5 sm:p-6 md:p-9">
        <p className="text-[0.64rem] uppercase tracking-editorial text-cyan-100/85 sm:text-[0.68rem]">Face ID activo</p>
        <h3 className="mt-3 font-display text-3xl leading-none text-cyan-50 sm:text-4xl">Escaneo facial en tiempo real</h3>
        <p className="mt-3 max-w-md text-sm text-cyan-100/80">
          Detecta tu rostro con la camara y entra sin contrasena. Si tu navegador no tiene FaceDetector, usamos
          TensorFlow automaticamente.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-cyan-200/25 bg-black/35 px-3 py-2 text-[0.62rem] uppercase tracking-editorial text-cyan-100/85 sm:px-4">
          <span>Motor de escaneo</span>
          <span>{detectorEngine}</span>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-[0.65rem] uppercase tracking-editorial text-cyan-100/80">Email para Face ID</label>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="client1@facecard.local"
            className="w-full border border-cyan-200/35 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-100"
          />
        </div>

        <div className="relative mt-5 aspect-[3/4] overflow-hidden border border-cyan-200/35 bg-black sm:mt-6 sm:aspect-[4/5]">
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,183,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,183,255,0.12)_1px,transparent_1px)] bg-[size:24px_24px] opacity-45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.55)_76%)]" />

          <div className="absolute inset-[8%] border border-cyan-200/35" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/70 sm:h-56 sm:w-56" />

          {cameraOn ? (
            <MotionLine
              animate={{ y: ['-115%', '430%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-8 top-0 h-12 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent"
            />
          ) : null}

          <div className="absolute bottom-4 left-4 right-4 grid gap-2 text-[0.62rem] uppercase tracking-editorial text-cyan-100/85 sm:grid-cols-2">
            <span className="border border-cyan-200/25 bg-black/55 px-3 py-2">{faceDetected ? 'Rostro detectado' : 'Sin rostro'}</span>
            <span className="border border-cyan-200/25 bg-black/55 px-3 py-2 text-left sm:text-right">
              {cameraOn ? 'Camara activa' : 'Camara apagada'}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex flex-col items-start justify-between gap-1 text-[0.64rem] uppercase tracking-editorial text-cyan-100/85 sm:flex-row sm:items-center">
            <span>{status}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-cyan-950">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-200 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-zinc-300">{error}</p> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={cameraOn ? stopCamera : startCamera}
            disabled={isLoadingCamera || isSubmitting}
            className="border border-cyan-200/50 px-4 py-3 text-xs uppercase tracking-editorial text-cyan-50 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingCamera ? 'Activando camara...' : cameraOn ? 'Detener camara' : 'Iniciar escaneo'}
          </button>

          <button
            type="button"
            onClick={submitFaceLogin}
            disabled={isSubmitting || !cameraOn || progressPercentage < MAX_PROGRESS}
            className="border border-cyan-100 bg-cyan-100 px-4 py-3 text-xs uppercase tracking-editorial text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Validando...' : 'Entrar con Face ID'}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default FaceLoginPanel

