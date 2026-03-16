import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CookieConsent from '../ui/CookieConsent'

const MainLayout = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      {!isHome ? <Navbar /> : null}
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}

export default MainLayout
