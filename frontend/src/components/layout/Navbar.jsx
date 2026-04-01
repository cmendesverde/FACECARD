import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { copy } from '../../content/copy'

const navItems = [
  { label: copy.nav.explore, to: '/discover' },
  { label: copy.nav.cities, to: '/cities' },
  { label: copy.nav.about, to: '/quienes-somos' },
  { label: copy.nav.contact, to: '/contact' },
  { label: copy.nav.bookings, to: '/bookings' },
]

const desktopLinkClass = ({ isActive }) =>
  `text-[0.68rem] uppercase tracking-editorial transition duration-300 ${
    isActive ? 'text-ink' : 'text-smoke hover:text-ink'
  }`

const mobileLinkClass = ({ isActive }) =>
  `text-xs uppercase tracking-editorial transition duration-300 ${
    isActive ? 'text-ink' : 'text-smoke'
  }`

const MotionNav = motion.nav
const MotionBackdrop = motion.button

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="relative sticky top-0 z-50 border-b border-fog/70 bg-white/95 backdrop-blur">
      <div className="facecard-container flex h-16 items-center justify-between md:h-20">
        <NavLink to="/" className="font-display text-xl tracking-[0.14em] text-ink sm:text-2xl">
          {copy.common.appName}
        </NavLink>

        <nav className="hidden items-center gap-5 md:flex lg:gap-7">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
              {item.label}
            </NavLink>
          ))}
          {!isAuthenticated ? (
            <NavLink to="/login" className={desktopLinkClass}>
              {copy.nav.access}
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={desktopLinkClass}>
                {copy.nav.dashboard}
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="text-[0.68rem] uppercase tracking-editorial text-smoke transition hover:text-ink"
              >
                {copy.nav.logout}
              </button>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="border border-fog px-3 py-2 text-[0.62rem] uppercase tracking-editorial md:hidden"
        >
          {open ? copy.nav.close : copy.nav.menu}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <MotionBackdrop
              type="button"
              aria-label={copy.nav.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-40 border-0 bg-black/40 backdrop-blur-sm md:hidden"
            />

            <MotionNav
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-x-0 top-full z-50 overflow-hidden border-t border-fog bg-white md:hidden"
            >
              <div className="facecard-container flex flex-col gap-3 py-4">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={() => setOpen(false)}>
                    {item.label}
                  </NavLink>
                ))}

                {!isAuthenticated ? (
                  <NavLink to="/login" className={mobileLinkClass} onClick={() => setOpen(false)}>
                    {copy.nav.access}
                  </NavLink>
                ) : (
                  <>
                    <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setOpen(false)}>
                      {copy.nav.dashboard}
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className="w-fit max-w-full truncate text-left text-xs uppercase tracking-editorial text-smoke"
                    >
                      {copy.nav.logout} {user?.name ? `(${user.name})` : ''}
                    </button>
                  </>
                )}
              </div>
            </MotionNav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Navbar

