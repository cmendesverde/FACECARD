import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { prepareFaceLogin } from '../../services/auth'
import { copy } from '../../content/copy'

const MotionLine = motion.div

const MAX_PROGRESS = 100
const LOOP_DELAY_MS = 180
const DEMO_START_DELAY_MS = 450
const DEMO_SCAN_STEP_MS = 260
const DEMO_LOGIN_DELAY_MS = 650
const DEMO_PROGRESS_STEPS = [12, 28, 46, 64, 82, 100]
const DEMO_DESCRIPTOR = Array.from({ length: 128 }, (_, index) => Number((Math.sin(index + 1) * 0.02).toFixed(6)))
const DEMO_FACE_IMAGE = '/media/demo-face-login.jfif'

const DEFAULT_RULES = {
  min_confidence: 0.82,
  max_distance: 0.54,
  min_anti_spoof_score: 0.65,
}

const MODEL_URLS = [
  'https://justadudewhohacks.github.io/face-api.js/models',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights',
]

const normalizeEmail = (value) => value.trim().toLowerCase()
const wait = (duration) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })

const distanceBetween = (a, b) => {
  const dx = Number(a?.x ?? 0) - Number(b?.x ?? 0)
  const dy = Number(a?.y ?? 0) - Number(b?.y ?? 0)
  return Math.sqrt(dx * dx + dy * dy)
}

const eyeAspectRatio = (eyePoints = []) => {
  if (eyePoints.length < 6) {
    return 0
  }

  const a = distanceBetween(eyePoints[1], eyePoints[5])
  const b = distanceBetween(eyePoints[2], eyePoints[4])
  const c = distanceBetween(eyePoints[0], eyePoints[3])

  if (!c) {
    return 0
  }

  return (a + b) / (2 * c)
}

const isFaceCentered = (box, videoWidth, videoHeight) => {
  const faceCenterX = box.x + box.width / 2
  const faceCenterY = box.y + box.height / 2
  const centerX = videoWidth / 2
  const centerY = videoHeight / 2

  const horizontalDistance = Math.abs(faceCenterX - centerX) / videoWidth
  const verticalDistance = Math.abs(faceCenterY - centerY) / videoHeight
  const faceRatio = box.width / videoWidth

  return horizontalDistance < 0.14 && verticalDistance < 0.18 && faceRatio > 0.17 && faceRatio < 0.62
}

const euclideanDistance = (first = [], second = []) => {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length || first.length === 0) {
    return null
  }

  let sum = 0

  for (let index = 0; index < first.length; index += 1) {
    const delta = Number(first[index]) - Number(second[index])
    sum += delta * delta
  }

  return Math.sqrt(sum)
}

const FaceLoginPanel = ({ email, onFaceLogin, autoStart = false }) => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const cameraOnRef = useRef(false)
  const autoStartAttemptedRef = useRef(false)

  const faceApiRef = useRef(null)
  const detectorOptionsRef = useRef(null)
  const referenceDescriptorRef = useRef(null)
  const latestDescriptorRef = useRef(null)

  const blinkStageRef = useRef('open')
  const turnDetectedRef = useRef(false)
  const blinkDetectedRef = useRef(false)
  const movementDetectedRef = useRef(false)
  const movementAccumulatorRef = useRef(0)
  const lastNosePointRef = useRef(null)
  const autoLoginTriggeredRef = useRef(false)

  const [status, setStatus] = useState(copy.faceId.statusReady)
  const [error, setError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [isLoadingCamera, setIsLoadingCamera] = useState(false)
  const [isPreparingProfile, setIsPreparingProfile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [simulationOn, setSimulationOn] = useState(false)

  const [faceDetected, setFaceDetected] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [, setDescriptorDistance] = useState(null)
  const [antiSpoofScore, setAntiSpoofScore] = useState(0)

  const [descriptorEnrolled, setDescriptorEnrolled] = useState(false)
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [demoModeEnabled, setDemoModeEnabled] = useState(false)

  const [blinkDetected, setBlinkDetected] = useState(false)
  const [turnDetected, setTurnDetected] = useState(false)
  const [movementDetected, setMovementDetected] = useState(false)

  const hasCameraSupport = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    [],
  )

  const livenessPassed = blinkDetected && turnDetected && movementDetected

  const resetLivenessSignals = useCallback(() => {
    blinkStageRef.current = 'open'
    turnDetectedRef.current = false
    blinkDetectedRef.current = false
    movementDetectedRef.current = false
    movementAccumulatorRef.current = 0
    lastNosePointRef.current = null

    setBlinkDetected(false)
    setTurnDetected(false)
    setMovementDetected(false)
    setAntiSpoofScore(0)
  }, [])

  const stopScanLoop = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopCamera = useCallback(() => {
    cameraOnRef.current = false
    stopScanLoop()

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraOn(false)
    setSimulationOn(false)
    setFaceDetected(false)
    autoLoginTriggeredRef.current = false
    setStatus(copy.faceId.statusCameraStopped)
  }, [stopScanLoop])

  const runDemoScanLogin = useCallback(async (descriptor = DEMO_DESCRIPTOR) => {
    const cleanEmail = normalizeEmail(email)

    if (!cleanEmail || autoLoginTriggeredRef.current) {
      return
    }

    autoLoginTriggeredRef.current = true
    latestDescriptorRef.current = descriptor
    resetLivenessSignals()

    setError('')
    setDemoModeEnabled(true)
    setFaceDetected(true)
    setBlinkDetected(true)
    setTurnDetected(true)
    setMovementDetected(true)
    setAntiSpoofScore(1)
    setDescriptorDistance(null)

    for (const progress of DEMO_PROGRESS_STEPS) {
      if (!autoLoginTriggeredRef.current) {
        return
      }

      setScanProgress(progress)
      setStatus(progress < 82 ? copy.faceId.statusScanning : copy.faceId.statusAutoLogin)
      await wait(DEMO_SCAN_STEP_MS)
    }

    if (!autoLoginTriggeredRef.current) {
      return
    }

    await wait(DEMO_LOGIN_DELAY_MS)

    if (!autoLoginTriggeredRef.current) {
      return
    }

    setIsSubmitting(true)

    try {
      await onFaceLogin({
        email: cleanEmail,
        scan_passed: true,
        liveness_passed: true,
        confidence: 1,
        anti_spoof_score: 1,
        face_descriptor: descriptor.map((value) => Number(Number(value).toFixed(6))),
        demo_mode: true,
      })
      setStatus(copy.faceId.statusAccessSuccess)
    } catch (requestError) {
      autoLoginTriggeredRef.current = false
      setSimulationOn(false)
      setError(requestError?.response?.data?.message ?? copy.faceId.errorFaceAccess)
    } finally {
      setIsSubmitting(false)
    }
  }, [email, onFaceLogin, resetLivenessSignals])

  const runDemoFallbackScan = useCallback(async () => {
    if (autoLoginTriggeredRef.current) {
      return
    }

    setError('')
    setSimulationOn(true)
    setDemoModeEnabled(true)
    setFaceDetected(false)
    setScanProgress(0)
    setStatus(copy.faceId.statusSearchingFace)

    await wait(DEMO_START_DELAY_MS)
    await runDemoScanLogin()
  }, [runDemoScanLogin])

  const ensureFaceApi = useCallback(async () => {
    if (faceApiRef.current && detectorOptionsRef.current) {
      return
    }

    const tf = await import('@tensorflow/tfjs')

    try {
      await tf.setBackend('webgl')
    } catch {
      await tf.setBackend('cpu')
    }

    await tf.ready()

    const faceapi = await import('face-api.js')

    let loaded = false

    for (const modelUrl of MODEL_URLS) {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl)
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl)
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)
        loaded = true
        break
      } catch {
        loaded = false
      }
    }

    if (!loaded) {
      throw new Error(copy.faceId.errorPrepareProfile)
    }

    faceApiRef.current = faceapi
    detectorOptionsRef.current = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.55,
    })

  }, [])

  const loadReferenceDescriptor = useCallback(async (imageUrl) => {
    if (!imageUrl || !faceApiRef.current || !detectorOptionsRef.current) {
      referenceDescriptorRef.current = null
      return
    }

    const faceapi = faceApiRef.current

    try {
      const image = await faceapi.fetchImage(imageUrl)
      const detection = await faceapi
        .detectSingleFace(image, detectorOptionsRef.current)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      referenceDescriptorRef.current = detection ? Array.from(detection.descriptor) : null
    } catch {
      referenceDescriptorRef.current = null
    }
  }, [])

  const prepareProfile = useCallback(async () => {
    const cleanEmail = normalizeEmail(email)

    if (!cleanEmail) {
      setError(copy.faceId.errorEmailRequired)
      return null
    }

    setIsPreparingProfile(true)
    setError('')

    try {
      const payload = await prepareFaceLogin({ email: cleanEmail })

      const isDemoMode = Boolean(payload.demo_mode_enabled)

      setRules({ ...DEFAULT_RULES, ...(payload.rules ?? {}) })
      setDescriptorEnrolled(Boolean(payload.descriptor_enrolled))
      setDemoModeEnabled(isDemoMode)

      if (isDemoMode) {
        setStatus(copy.faceId.statusDemoMode)
      } else if (payload.requires_enrollment) {
        setStatus(copy.faceId.statusNeedActivation)
      } else {
        setStatus(copy.faceId.statusProfileLoaded)
      }

      return payload
    } catch (requestError) {
      setDemoModeEnabled(false)
      const message = requestError?.response?.data?.message ?? copy.faceId.errorPrepareProfile
      setError(message)
      return null
    } finally {
      setIsPreparingProfile(false)
    }
  }, [email])

  const updateLiveness = useCallback((landmarks) => {
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()
    const nose = landmarks.getNose()[3] ?? landmarks.getNose()[0]
    const jaw = landmarks.getJawOutline()

    const ear = (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2

    if (!blinkDetectedRef.current) {
      if (ear < 0.2) {
        blinkStageRef.current = 'closed'
      }

      if (blinkStageRef.current === 'closed' && ear > 0.24) {
        blinkDetectedRef.current = true
        setBlinkDetected(true)
      }
    }

    if (!turnDetectedRef.current && jaw.length > 16 && nose) {
      const leftJaw = jaw[0]
      const rightJaw = jaw[16]
      const centerX = (leftJaw.x + rightJaw.x) / 2
      const halfWidth = Math.max(1, Math.abs(rightJaw.x - leftJaw.x) / 2)
      const yawRatio = (nose.x - centerX) / halfWidth

      if (Math.abs(yawRatio) > 0.17) {
        turnDetectedRef.current = true
        setTurnDetected(true)
      }
    }

    if (nose) {
      if (lastNosePointRef.current) {
        const delta = distanceBetween(lastNosePointRef.current, nose)
        movementAccumulatorRef.current += delta
      }

      lastNosePointRef.current = { x: nose.x, y: nose.y }

      if (!movementDetectedRef.current && movementAccumulatorRef.current > 40) {
        movementDetectedRef.current = true
        setMovementDetected(true)
      }
    }

    const score =
      (blinkDetectedRef.current ? 0.4 : 0) +
      (turnDetectedRef.current ? 0.35 : 0) +
      (movementDetectedRef.current ? 0.25 : 0)

    setAntiSpoofScore(Math.min(1, Number(score.toFixed(2))))
  }, [])

  const runDetection = useCallback(async () => {
    if (
      autoLoginTriggeredRef.current ||
      !cameraOnRef.current ||
      !videoRef.current ||
      !faceApiRef.current ||
      !detectorOptionsRef.current
    ) {
      return
    }

    try {
      const faceapi = faceApiRef.current
      const video = videoRef.current

      if (video.readyState >= 2) {
        const detections = await faceapi
          .detectAllFaces(video, detectorOptionsRef.current)
          .withFaceLandmarks(true)
          .withFaceDescriptors()

        if (detections.length !== 1) {
          latestDescriptorRef.current = null
          setFaceDetected(false)
          setDescriptorDistance(null)

          if (detections.length > 1) {
            setStatus(copy.faceId.statusSingleFace)
          } else {
            setStatus(copy.faceId.statusSearchingFace)
          }

          setScanProgress((prev) => Math.max(0, prev - 8))
          timerRef.current = window.setTimeout(runDetection, LOOP_DELAY_MS)
          return
        }

        const detection = detections[0]
        const box = detection.detection.box
        const centered = isFaceCentered(box, video.videoWidth, video.videoHeight)

        latestDescriptorRef.current = Array.from(detection.descriptor)
        setFaceDetected(true)

        if (demoModeEnabled) {
          void runDemoScanLogin(Array.from(detection.descriptor))
          return
        } else {
          updateLiveness(detection.landmarks)

          let matchScore = 0.65

          if (referenceDescriptorRef.current) {
            const distance = euclideanDistance(referenceDescriptorRef.current, latestDescriptorRef.current)
            setDescriptorDistance(distance)

            if (distance !== null) {
              const ratio = Math.max(0, 1 - distance / Math.max(rules.max_distance ?? DEFAULT_RULES.max_distance, 0.01))
              matchScore = Math.min(1, ratio)
            }
          } else {
            setDescriptorDistance(null)
          }

          const livenessScore =
            (blinkDetectedRef.current ? 0.38 : 0) +
            (turnDetectedRef.current ? 0.34 : 0) +
            (movementDetectedRef.current ? 0.28 : 0)

          const framingScore = centered ? 1 : 0.3
          const totalScore = framingScore * 0.3 + livenessScore * 0.4 + matchScore * 0.3
          const nextProgress = Math.max(0, Math.min(MAX_PROGRESS, Math.round(totalScore * 100)))

          setScanProgress(nextProgress)

          if (!centered) {
            setStatus(copy.faceId.statusCenterFace)
          } else if (livenessScore < 1) {
            setStatus(copy.faceId.statusCompleteLiveness)
          } else if (!descriptorEnrolled) {
            setStatus(copy.faceId.statusReadyToActivate)
          } else {
            setStatus(copy.faceId.statusReadyToAccess)
          }
        }
      }
    } catch {
      setError(copy.faceId.errorProcessScan)
      stopCamera()
      return
    }

    timerRef.current = window.setTimeout(runDetection, LOOP_DELAY_MS)
  }, [demoModeEnabled, descriptorEnrolled, rules.max_distance, runDemoScanLogin, stopCamera, updateLiveness])

  const startCamera = useCallback(async () => {
    setError('')
    setIsLoadingCamera(true)
    let profile = null

    try {
      profile = await prepareProfile()

      if (!profile) {
        setIsLoadingCamera(false)
        return
      }

      if (!hasCameraSupport) {
        setIsLoadingCamera(false)

        if (profile.demo_mode_enabled) {
          await runDemoFallbackScan()
          return
        }

        setError(copy.faceId.errorNoCameraSupport)
        return
      }

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
        throw new Error(copy.faceId.errorOpenCamera)
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      latestDescriptorRef.current = null
      setDescriptorDistance(null)
      setScanProgress(0)
      resetLivenessSignals()
      autoLoginTriggeredRef.current = false

      cameraOnRef.current = true
      setCameraOn(true)
      setStatus(copy.faceId.statusCompleteLiveness)

      if (profile.demo_mode_enabled) {
        setSimulationOn(true)
        await wait(DEMO_START_DELAY_MS)
        await runDemoScanLogin()
        return
      }

      await ensureFaceApi()

      if (profile.reference_image) {
        await loadReferenceDescriptor(profile.reference_image)
      } else {
        referenceDescriptorRef.current = null
      }

      timerRef.current = window.setTimeout(runDetection, LOOP_DELAY_MS)
    } catch (cameraError) {
      if (profile?.demo_mode_enabled) {
        setIsLoadingCamera(false)
        await runDemoFallbackScan()
        return
      }

      if (cameraError?.name === 'NotAllowedError') {
        setError(copy.faceId.errorNoCameraAccess)
      } else if (cameraError?.message) {
        setError(cameraError.message)
      } else {
        setError(copy.faceId.errorOpenCamera)
      }

      stopCamera()
    } finally {
      setIsLoadingCamera(false)
    }
  }, [
    ensureFaceApi,
    hasCameraSupport,
    loadReferenceDescriptor,
    prepareProfile,
    resetLivenessSignals,
    runDemoFallbackScan,
    runDemoScanLogin,
    runDetection,
    stopCamera,
  ])

  const buildFacePayload = useCallback(() => {
    const cleanEmail = normalizeEmail(email)

    if (!cleanEmail) {
      throw new Error(copy.faceId.errorEmailForValidation)
    }

    if (!latestDescriptorRef.current) {
      throw new Error(copy.faceId.errorDescriptorMissing)
    }

    const livenessConfirmed = demoModeEnabled && faceDetected ? true : livenessPassed

    if (!livenessConfirmed) {
      throw new Error(copy.faceId.errorLivenessRequired)
    }

    if (scanProgress < 90) {
      throw new Error(copy.faceId.errorConfidenceLow)
    }

    const confidence = Number((scanProgress / 100).toFixed(2))

    if (confidence < (rules.min_confidence ?? DEFAULT_RULES.min_confidence)) {
      throw new Error(copy.faceId.errorConfidenceLow)
    }

    const antiSpoof = demoModeEnabled ? 1 : Number(antiSpoofScore.toFixed(2))

    if (antiSpoof < (rules.min_anti_spoof_score ?? DEFAULT_RULES.min_anti_spoof_score)) {
      throw new Error(copy.faceId.errorAntiSpoofLow)
    }

    return {
      email: cleanEmail,
      scan_passed: true,
      liveness_passed: livenessConfirmed,
      confidence,
      anti_spoof_score: antiSpoof,
      face_descriptor: latestDescriptorRef.current.map((value) => Number(Number(value).toFixed(6))),
      demo_mode: demoModeEnabled,
    }
  }, [
    antiSpoofScore,
    demoModeEnabled,
    email,
    faceDetected,
    livenessPassed,
    rules.min_anti_spoof_score,
    rules.min_confidence,
    scanProgress,
  ])

  const submitFaceLogin = useCallback(async () => {
    setError('')

    if (!descriptorEnrolled && !demoModeEnabled) {
      setError(copy.faceId.errorActivateFirst)
      return
    }

    let payload

    try {
      payload = buildFacePayload()
    } catch (buildError) {
      setError(buildError.message)
      return
    }

    setIsSubmitting(true)

    try {
      await onFaceLogin(payload)
      setStatus(copy.faceId.statusAccessSuccess)
      stopCamera()
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? copy.faceId.errorFaceAccess)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildFacePayload, demoModeEnabled, descriptorEnrolled, onFaceLogin, stopCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (
      !autoStart ||
      autoStartAttemptedRef.current ||
      cameraOn ||
      isLoadingCamera ||
      isSubmitting ||
      isPreparingProfile ||
      !normalizeEmail(email)
    ) {
      return
    }

    autoStartAttemptedRef.current = true
    void startCamera()
  }, [autoStart, cameraOn, email, isLoadingCamera, isPreparingProfile, isSubmitting, startCamera])

  useEffect(() => {
    if (!cameraOn || autoLoginTriggeredRef.current || isSubmitting || isPreparingProfile) {
      return
    }

    const readyForDemoAutoLogin = demoModeEnabled && faceDetected && scanProgress >= 90
    const readyForSecureAutoLogin = descriptorEnrolled && faceDetected && livenessPassed && scanProgress >= 90
    const readyForAutoLogin = readyForDemoAutoLogin || readyForSecureAutoLogin

    if (!readyForAutoLogin) {
      return
    }

    autoLoginTriggeredRef.current = true
    setStatus(copy.faceId.statusAutoLogin)
    void submitFaceLogin()
  }, [
    cameraOn,
    demoModeEnabled,
    descriptorEnrolled,
    faceDetected,
    isPreparingProfile,
    isSubmitting,
    livenessPassed,
    scanProgress,
    submitFaceLogin,
  ])

  const progressPercentage = Math.max(0, Math.min(MAX_PROGRESS, scanProgress))
  const scanActive = cameraOn || simulationOn
  const showDemoFace = demoModeEnabled && scanActive

  return (
    <aside className="relative h-full w-full overflow-hidden border border-cyan-300/40 bg-[#030811] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(14,123,181,0.35),transparent_52%),radial-gradient(circle_at_75%_80%,rgba(14,123,181,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.6))]" />

      <div className="relative z-10 p-4 sm:p-5 md:p-7">
        <p className="text-[0.64rem] uppercase tracking-editorial text-cyan-100/85 sm:text-[0.68rem]">{copy.faceId.eyebrow}</p>
        <h3 className="mt-2 font-display text-[2rem] leading-[0.95] text-cyan-50 sm:text-[2.35rem]">{copy.faceId.title}</h3>
        <p className="mt-2 max-w-md text-sm text-cyan-100/80">{copy.faceId.subtitle}</p>

        <p className="mt-3 inline-flex items-center gap-2 border border-amber-300/60 bg-amber-300/10 px-3 py-1.5 text-[0.58rem] uppercase tracking-editorial text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          {copy.faceId.simulatedBadge}
        </p>

        <div className="relative mt-4 aspect-[16/10] overflow-hidden border border-cyan-200/35 bg-black sm:aspect-[4/3]">
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />
          {showDemoFace ? (
            <img
              src={DEMO_FACE_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
            />
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,183,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,183,255,0.12)_1px,transparent_1px)] bg-[size:24px_24px] opacity-45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.55)_76%)]" />

          <div className="absolute inset-[8%] border border-cyan-200/35" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/70 sm:h-36 sm:w-36" />

          {scanActive ? (
            <MotionLine
              animate={{ y: ['-115%', '430%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-6 top-0 h-8 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent"
            />
          ) : null}

          <div className="absolute bottom-3 left-3 right-3 grid gap-2 text-[0.62rem] uppercase tracking-editorial text-cyan-100/85 sm:grid-cols-2">
            <span className="border border-cyan-200/25 bg-black/55 px-3 py-2">{faceDetected ? copy.faceId.faceDetected : copy.faceId.noFace}</span>
            <span className="border border-cyan-200/25 bg-black/55 px-3 py-2 text-left sm:text-right">
              {scanActive ? copy.faceId.cameraOn : copy.faceId.cameraOff}
            </span>
          </div>
        </div>

        <div className="mt-4">
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

        {error ? <p className="mt-3 text-sm text-zinc-300">{error}</p> : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={scanActive ? stopCamera : startCamera}
            disabled={isLoadingCamera || isSubmitting || isPreparingProfile}
            className="w-full border border-cyan-200/50 px-4 py-2.5 text-[0.68rem] uppercase tracking-editorial text-cyan-50 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? copy.faceId.validating
              : isLoadingCamera || isPreparingProfile
                ? copy.faceId.preparing
                : scanActive
                  ? copy.faceId.stopCamera
                  : copy.faceId.startScan}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default FaceLoginPanel




















