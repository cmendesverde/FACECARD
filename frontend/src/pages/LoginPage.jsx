import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import FaceLoginPanel from '../components/ui/FaceLoginPanel'
import { useAuth } from '../hooks/useAuth'
import { copy } from '../content/copy'
import { FALLBACK_IMAGES } from '../utils/imageFallbacks'

const DEMO_LOGIN = {
  email: import.meta.env.VITE_DEMO_EMAIL ?? 'admin@facecard.local',
  password: import.meta.env.VITE_DEMO_PASSWORD ?? 'password',
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loginWithFace, isAuthenticated, loading } = useAuth()
  const [form, setForm] = useState(DEMO_LOGIN)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? copy.login.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFaceLogin = async (payload) => {
    await loginWithFace(payload)
    navigate('/dashboard')
  }

  return (
    <section className="bg-white py-7 md:py-10">
      <div className="facecard-container mx-auto grid max-w-[1160px] gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <div className="relative min-h-[540px] overflow-hidden border border-fog sm:min-h-[600px] lg:h-full lg:min-h-0">
          <img
            src={FALLBACK_IMAGES.portrait}
            alt="Modelo editorial"
            className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.25] brightness-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/45" />

          <div className="relative z-10 flex h-full min-h-[540px] items-center justify-center p-4 sm:min-h-[600px] sm:p-6 lg:min-h-0">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[430px] border border-white/65 bg-[rgba(247,249,252,0.85)] p-5 text-ink backdrop-blur-lg shadow-[0_20px_65px_rgba(0,0,0,0.28)] sm:p-6"
            >
              <p className="facecard-subtitle text-[#334155]">{copy.login.eyebrow}</p>
              <h1 className="mt-2 font-display text-[2rem] leading-[0.92] text-[#0f1720] sm:text-[2.65rem]">{copy.login.title}</h1>
              <p className="mt-2 text-sm text-[#2f3741]">{copy.login.subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-editorial">
                <span className="border border-ink bg-ink px-3 py-2 text-white">{copy.login.activeMethod}</span>
                <span className="border border-cyan-700/35 bg-cyan-100/80 px-3 py-2 text-[#0d3e59]">{copy.login.faceMethod}</span>
              </div>

              <div className="mt-5 space-y-2.5">
                <label className="block text-[0.65rem] uppercase tracking-editorial text-[#39424f]">{copy.login.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder={copy.login.emailPlaceholder}
                  className="w-full border border-black/25 bg-white/88 px-4 py-2.5 text-sm text-[#0f1720] placeholder:text-[#5b6675] outline-none transition focus:border-ink"
                />
              </div>

              <div className="mt-3 space-y-2.5">
                <label className="block text-[0.65rem] uppercase tracking-editorial text-[#39424f]">{copy.login.passwordLabel}</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder={copy.login.passwordPlaceholder}
                  className="w-full border border-black/25 bg-white/88 px-4 py-2.5 text-sm text-[#0f1720] placeholder:text-[#5b6675] outline-none transition focus:border-ink"
                />
              </div>

              {error ? <p className="mt-3 text-sm text-[#1f2937]">{error}</p> : null}

              <button type="submit" disabled={submitting} className="facecard-button mt-5 w-full border-black bg-white/95 text-ink hover:bg-white">
                {submitting ? copy.login.submitting : copy.login.submit}
              </button>

              <div className="mt-4 border-t border-black/20 pt-3 text-xs text-[#3f4957]">
                <p>{copy.login.hintActivate}</p>
                <p className="mt-1">{copy.login.hintDemo}</p>
              </div>
            </form>
          </div>
        </div>

        <FaceLoginPanel
          email={form.email}
          autoStart={!loading}
          onFaceLogin={handleFaceLogin}
        />
      </div>
    </section>
  )
}

export default LoginPage

