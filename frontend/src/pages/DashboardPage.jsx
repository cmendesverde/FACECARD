import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../hooks/useAuth'
import { getBookings, getMyTalentProfile } from '../services/bookings'
import { applyFallback, buildTalentCoverFallback, resolveTalentCoverSource } from '../utils/imageFallbacks'
import { copy } from '../content/copy'

const INTERNAL_PROFILE_IMAGE = '/media/demo-face-login.jfif'

const DashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isAuthenticated || !user) return

      setLoading(true)

      try {
        const bookingsData = await getBookings()
        setBookings(bookingsData)

        if (user.role === 'talent') {
          const profileData = await getMyTalentProfile()
          setProfile(profileData)
        }
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [isAuthenticated, user])

  const byStatus = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1
        return acc
      },
      { pending: 0, accepted: 0, rejected: 0, completed: 0 },
    )
  }, [bookings])

  const isInternalUser = user?.role === 'admin'

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || loading) {
    return (
      <section className="facecard-container py-12 md:py-16">
        <LoadingState label={copy.common.loadingPanel} />
      </section>
    )
  }

  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader
        eyebrow={copy.dashboard.eyebrow}
        title={copy.dashboard.welcome(user?.name ?? '')}
        description={isInternalUser ? copy.dashboard.internalDescription : copy.dashboard.description}
      />

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        {['pending', 'accepted', 'rejected', 'completed'].map((status) => (
          <div key={status} className="border border-fog bg-white p-4 sm:p-6">
            <p className="facecard-subtitle">{copy.dashboard.statuses[status]}</p>
            <p className="mt-2 font-display text-3xl text-ink sm:text-4xl">{byStatus[status] || 0}</p>
          </div>
        ))}
      </div>

      {isInternalUser ? (
        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[1fr_0.9fr] lg:gap-8">
          <article className="border border-fog bg-white p-4 sm:p-6">
            <p className="facecard-subtitle">{copy.dashboard.internalProfileTitle}</p>
            <h3 className="mt-3 font-display text-3xl leading-none sm:text-4xl">{user?.name}</h3>
            <p className="mt-3 text-sm text-smoke">{copy.dashboard.internalBio}</p>
            <img
              src={INTERNAL_PROFILE_IMAGE}
              alt={user?.name}
              className="mt-5 h-56 w-full object-cover grayscale contrast-110 sm:h-64"
            />
          </article>

          <div className="border border-fog bg-white p-4 sm:p-6">
            <div className="grid gap-5">
              <div>
                <p className="facecard-subtitle">{copy.dashboard.internalRoleLabel}</p>
                <p className="mt-2 text-sm text-ink">{copy.dashboard.internalRoleValue}</p>
              </div>
              <div>
                <p className="facecard-subtitle">{copy.dashboard.internalAreaLabel}</p>
                <p className="mt-2 text-sm text-ink">{copy.dashboard.internalAreaValue}</p>
              </div>
              <div>
                <p className="facecard-subtitle">{copy.dashboard.internalAccessLabel}</p>
                <p className="mt-2 text-sm text-ink">{copy.dashboard.internalAccessValue}</p>
              </div>
              <div>
                <p className="facecard-subtitle">{copy.dashboard.internalEmailLabel}</p>
                <p className="mt-2 text-sm text-ink">{user?.email}</p>
              </div>
              <div>
                <p className="facecard-subtitle">{copy.dashboard.totalBookings}</p>
                <p className="mt-2 font-display text-3xl sm:text-4xl">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>
      ) : user?.role === 'talent' ? (
        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
          <div>
            {profile ? (
              <article className="border border-fog bg-white p-4 sm:p-6">
                <p className="facecard-subtitle">{copy.dashboard.profileTitle}</p>
                <h3 className="mt-3 font-display text-3xl leading-none sm:text-4xl">{profile.stage_name}</h3>
                <p className="mt-3 text-sm text-smoke">{profile.bio}</p>
                <img
                  src={resolveTalentCoverSource(profile)}
                  onError={(event) => applyFallback(event, buildTalentCoverFallback(profile))}
                  alt={profile.stage_name}
                  className="mt-5 h-52 w-full object-cover grayscale contrast-110 sm:h-56"
                />
              </article>
            ) : (
              <EmptyState title={copy.dashboard.noProfileTitle} message={copy.dashboard.noProfileMessage} />
            )}
          </div>

          <div className="border border-fog bg-white p-4 sm:p-6">
            <p className="facecard-subtitle">{copy.dashboard.availability}</p>
            <p className="mt-3 text-sm text-smoke">{profile?.availability_text ?? copy.dashboard.availabilityMissing}</p>
            <p className="mt-6 facecard-subtitle">{copy.dashboard.totalBookings}</p>
            <p className="mt-2 font-display text-3xl sm:text-4xl">{bookings.length}</p>
          </div>
        </div>
      ) : (
        <div className="mt-10 md:mt-12">
          <EmptyState title={copy.dashboard.clientPanelTitle} message={copy.dashboard.clientPanelMessage} />
        </div>
      )}
    </section>
  )
}

export default DashboardPage
