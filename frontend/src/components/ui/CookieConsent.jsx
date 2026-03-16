import { useState } from 'react'
import { Link } from 'react-router-dom'
import { copy } from '../../content/copy'

const STORAGE_KEY = 'facecard_cookie_preferences_v1'

const defaultPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
}

const parseStoredPreferences = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue)
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updated_at: parsed.updated_at ?? null,
    }
  } catch {
    return null
  }
}

const CookieConsent = () => {
  const initialStoredPreferences = parseStoredPreferences()

  const [bannerVisible, setBannerVisible] = useState(true)
  const [draftPreferences, setDraftPreferences] = useState(initialStoredPreferences ?? defaultPreferences)
  const [showPreferences, setShowPreferences] = useState(false)

  const persistPreferences = (preferences) => {
    const payload = {
      essential: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      updated_at: new Date().toISOString(),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setDraftPreferences(payload)
    setBannerVisible(false)
    setShowPreferences(false)
  }

  const acceptAll = () => {
    persistPreferences({ essential: true, analytics: true, marketing: true })
  }

  const rejectOptional = () => {
    persistPreferences({ essential: true, analytics: false, marketing: false })
  }

  const savePreferences = () => {
    persistPreferences(draftPreferences)
  }

  if (!bannerVisible && !showPreferences) {
    return null
  }

  return (
    <>
      {bannerVisible ? (
        <aside className="fixed bottom-4 left-4 right-4 z-[70] border border-white/20 bg-black px-4 py-4 text-white shadow-2xl md:left-auto md:w-[460px]">
          <button
            type="button"
            aria-label={copy.cookies.closeNotice}
            onClick={rejectOptional}
            className="absolute right-3 top-3 text-xs text-white/70 transition hover:text-white"
          >
            {copy.cookies.close}
          </button>

          <p className="pr-16 text-xs leading-relaxed text-white/85">
            {copy.cookies.bannerText}{' '}
            <Link to="/cookie-policy" className="underline" onClick={() => setShowPreferences(false)}>
              {copy.legal.cookieTitle}
            </Link>{' '}
            y{' '}
            <Link to="/privacy-policy" className="underline" onClick={() => setShowPreferences(false)}>
              {copy.legal.privacyTitle}
            </Link>
            .
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="border border-white/70 px-4 py-2 text-xs uppercase tracking-editorial text-white transition hover:bg-white hover:text-black"
            >
              {copy.cookies.preferences}
            </button>
            <button
              type="button"
              onClick={rejectOptional}
              className="border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-editorial transition hover:bg-white/20"
            >
              {copy.cookies.reject}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="border border-white bg-white px-4 py-2 text-xs uppercase tracking-editorial text-black transition hover:bg-white/85"
            >
              {copy.cookies.accept}
            </button>
          </div>
        </aside>
      ) : null}

      {showPreferences ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-4 sm:items-center">
          <div className="w-full max-w-lg border border-fog bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="facecard-subtitle">{copy.cookies.preferences}</p>
                <h3 className="mt-2 font-display text-3xl leading-none text-ink">{copy.cookies.modalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-xs uppercase tracking-editorial text-smoke"
              >
                {copy.cookies.close}
              </button>
            </div>

            <div className="space-y-4 text-sm text-smoke">
              <label className="flex items-start justify-between gap-4 border border-fog p-3">
                <span>
                  <span className="block text-xs uppercase tracking-editorial text-ink">{copy.cookies.essentialTitle}</span>
                  <span className="mt-1 block text-sm">{copy.cookies.essentialDescription}</span>
                </span>
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-ink" />
              </label>

              <label className="flex items-start justify-between gap-4 border border-fog p-3">
                <span>
                  <span className="block text-xs uppercase tracking-editorial text-ink">{copy.cookies.analyticsTitle}</span>
                  <span className="mt-1 block text-sm">{copy.cookies.analyticsDescription}</span>
                </span>
                <input
                  type="checkbox"
                  checked={draftPreferences.analytics}
                  onChange={(event) =>
                    setDraftPreferences((prev) => ({
                      ...prev,
                      analytics: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-ink"
                />
              </label>

              <label className="flex items-start justify-between gap-4 border border-fog p-3">
                <span>
                  <span className="block text-xs uppercase tracking-editorial text-ink">{copy.cookies.marketingTitle}</span>
                  <span className="mt-1 block text-sm">{copy.cookies.marketingDescription}</span>
                </span>
                <input
                  type="checkbox"
                  checked={draftPreferences.marketing}
                  onChange={(event) =>
                    setDraftPreferences((prev) => ({
                      ...prev,
                      marketing: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 accent-ink"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectOptional}
                className="border border-fog px-4 py-2 text-xs uppercase tracking-editorial text-smoke"
              >
                {copy.cookies.rejectOptional}
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-editorial text-white"
              >
                {copy.cookies.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default CookieConsent
