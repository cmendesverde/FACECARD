import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FALLBACK_IMAGES } from '../../utils/imageFallbacks'
import { copy } from '../../content/copy'

const MotionAside = motion.aside
const MotionOverlay = motion.div

const menuItems = [
  { label: copy.nav.explore, to: '/discover' },
  { label: copy.nav.cities, to: '/cities' },
  { label: copy.nav.contact, to: '/contact' },
  { label: copy.hero.menu.privacy, to: '/privacy-policy' },
  { label: copy.hero.menu.cookies, to: '/cookie-policy' },
  { label: copy.nav.access, to: '/login' },
]

const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoError, setVideoError] = useState(false)

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-black">
      {!videoError ? (
        <video
          className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.3] brightness-[0.58]"
          src="/media/videoIntro.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={FALLBACK_IMAGES.hero}
          onError={() => setVideoError(true)}
        />
      ) : (
        <img
          src={FALLBACK_IMAGES.hero}
          alt={copy.hero.fallbackAlt}
          className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.3] brightness-[0.58]"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 text-white sm:px-6 sm:pt-5 md:px-10 md:pt-7">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={copy.nav.openMenu}
          className="flex h-9 w-9 items-center justify-center border border-white/30 text-lg leading-none transition hover:border-white md:h-10 md:w-10"
        >
          =
        </button>

        <Link
          to="/"
          className={`font-display text-3xl leading-[0.82] tracking-[0.06em] transition-opacity duration-200 sm:text-4xl md:text-5xl ${
            menuOpen ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
          }`}
        >
          {copy.common.appName}
        </Link>

        <button
          type="button"
          className={`hidden items-center gap-4 text-xs uppercase tracking-editorial transition-opacity duration-200 lg:flex ${
            menuOpen ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
          }`}
        >
          {copy.nav.search}
          <span className="h-px w-16 bg-white/70" />
        </button>

        <div
          className={`w-9 transition-opacity duration-200 lg:hidden ${menuOpen ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'}`}
        />
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <MotionOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 z-30 bg-black/72 backdrop-blur-sm"
            />

            <MotionAside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute left-0 top-0 z-40 h-full w-[84vw] max-w-[340px] border-r border-fog bg-white px-5 py-6 text-ink sm:px-6 sm:py-7"
            >
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="mb-8 text-xs uppercase tracking-editorial text-smoke"
                aria-label={copy.nav.closeMenu}
              >
                {copy.nav.close}
              </button>

              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="text-xl font-medium leading-none tracking-tight transition hover:opacity-60 sm:text-2xl"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </MotionAside>
          </>
        ) : null}
      </AnimatePresence>

      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-4 pb-10 text-white transition-opacity duration-200 sm:px-6 sm:pb-12 md:px-16 md:pb-20 ${
          menuOpen ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
        }`}
      >
        <p className="mb-5 text-[0.62rem] uppercase tracking-editorial sm:mb-6 sm:text-[0.68rem]">{copy.hero.eyebrow}</p>

        <h1 className="facecard-title max-w-5xl text-white">{copy.hero.title}</h1>

        <div className="mt-7 sm:mt-8">
          <Link
            to="/discover"
            className="facecard-button w-full border-white text-white hover:bg-white hover:text-ink sm:w-auto"
          >
            {copy.hero.cta}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
