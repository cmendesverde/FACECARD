import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import FaceLoginPanel from '../components/ui/FaceLoginPanel'
import { useAuth } from '../hooks/useAuth'
import { copy } from '../content/copy'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loginWithFace, isAuthenticated, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
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
    <section className="min-h-[calc(100vh-140px)] bg-white py-8 md:min-h-[calc(100vh-160px)] md:py-16">
      <div className="facecard-container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col border border-fog bg-white p-5 sm:p-6 md:p-10">
          <p className="facecard-subtitle">{copy.login.eyebrow}</p>
          <h1 className="mt-3 font-display text-[2.35rem] leading-[0.9] text-ink sm:text-5xl">{copy.login.title}</h1>
          <p className="mt-4 max-w-md text-sm text-smoke">{copy.login.subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-editorial">
            <span className="border border-ink bg-ink px-3 py-2 text-white">{copy.login.activeMethod}</span>
            <span className="border border-cyan-300/40 bg-cyan-50 px-3 py-2 text-[#0d3e59]">{copy.login.faceMethod}</span>
          </div>

          <div className="mt-8 space-y-3">
            <label className="block text-[0.65rem] uppercase tracking-editorial text-smoke">{copy.login.emailLabel}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder={copy.login.emailPlaceholder}
              className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-[0.65rem] uppercase tracking-editorial text-smoke">{copy.login.passwordLabel}</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder={copy.login.passwordPlaceholder}
              className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
          </div>

          {error ? <p className="mt-4 text-sm text-smoke">{error}</p> : null}

          <button type="submit" disabled={submitting} className="facecard-button mt-8 w-full">
            {submitting ? copy.login.submitting : copy.login.submit}
          </button>

          <div className="mt-7 border-t border-fog pt-5 text-xs text-smoke">
            <p>{copy.login.hintActivate}</p>
            <p className="mt-1">{copy.login.hintDemo}</p>
          </div>
        </form>

        <FaceLoginPanel
          email={form.email}
          password={form.password}
          onEmailChange={(value) => updateField('email', value)}
          onFaceLogin={handleFaceLogin}
        />
      </div>
    </section>
  )
}

export default LoginPage
