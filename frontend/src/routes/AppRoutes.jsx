import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomePage from '../pages/HomePage'
import DiscoverPage from '../pages/DiscoverPage'
import TalentProfilePage from '../pages/TalentProfilePage'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import BookingsPage from '../pages/BookingsPage'
import ContactPage from '../pages/ContactPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import CookiePolicyPage from '../pages/CookiePolicyPage'
import NotFoundPage from '../pages/NotFoundPage'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="cities" element={<DiscoverPage />} />
          <Route path="talents/:id" element={<TalentProfilePage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="cookie-policy" element={<CookiePolicyPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
