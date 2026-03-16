import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import BookingForm from '../components/BookingForm'
import { createBooking } from '../services/bookings'
import { getTalentById } from '../services/talents'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/format'
import {
  applyFallback,
  buildTalentCoverFallback,
  buildTalentPortfolioFallback,
  resolveTalentCoverSource,
  resolveTalentPortfolioSource,
} from '../utils/imageFallbacks'
import { copy } from '../content/copy'

const TalentProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [talent, setTalent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const fetchTalent = async () => {
      setLoading(true)

      try {
        const response = await getTalentById(id)
        setTalent(response)
      } finally {
        setLoading(false)
      }
    }

    fetchTalent()
  }, [id])

  const portfolio = useMemo(() => talent?.portfolio_items ?? [], [talent])

  const handleBookingSubmit = async (values) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setBookingLoading(true)
    setFeedback('')

    try {
      await createBooking({
        ...values,
        talent_profile_id: talent.id,
        budget: Number(values.budget),
      })
      setFeedback(copy.talentProfile.feedbackSuccess)
    } catch (error) {
      setFeedback(error?.response?.data?.message ?? copy.talentProfile.feedbackError)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="facecard-container py-12 md:py-16">
        <LoadingState label={copy.common.loadingTalentProfile} />
      </section>
    )
  }

  if (!talent) {
    return (
      <section className="facecard-container py-12 md:py-16">
        <EmptyState title={copy.talentProfile.notFoundTitle} message={copy.talentProfile.notFoundMessage} />
      </section>
    )
  }

  return (
    <>
      <section className="relative h-[62vh] min-h-[380px] overflow-hidden md:h-[72vh] md:min-h-[520px]">
        <img
          src={resolveTalentCoverSource(talent)}
          onError={(event) => applyFallback(event, buildTalentCoverFallback(talent))}
          alt={talent.stage_name}
          className="h-full w-full object-cover grayscale contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="facecard-container absolute inset-x-0 bottom-0 pb-8 text-white md:pb-14">
          <p className="facecard-subtitle text-white/80">{talent.category}</p>
          <h1 className="facecard-title text-white">{talent.stage_name}</h1>
          <p className="mt-2 text-[0.65rem] uppercase tracking-editorial text-white/80 sm:text-sm">{talent.city}</p>
        </div>
      </section>

      <section className="facecard-container mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
        <div>
          <SectionHeader eyebrow={copy.talentProfile.profileEyebrow} title={copy.talentProfile.bioTitle} description={talent.bio} />

          <div className="grid gap-4 border border-fog bg-white p-4 text-sm text-smoke sm:p-6 md:grid-cols-3">
            <div>
              <p className="facecard-subtitle">{copy.talentProfile.rateDay}</p>
              <p className="mt-2 font-display text-3xl text-ink sm:text-4xl">{formatCurrency(talent.day_rate)}</p>
            </div>
            <div>
              <p className="facecard-subtitle">{copy.talentProfile.rateSession}</p>
              <p className="mt-2 font-display text-3xl text-ink sm:text-4xl">{formatCurrency(talent.session_rate)}</p>
            </div>
            <div>
              <p className="facecard-subtitle">{copy.talentProfile.availability}</p>
              <p className="mt-2 text-sm text-ink">{talent.availability_text}</p>
            </div>
          </div>

          <div className="mt-10 md:mt-12">
            <SectionHeader
              eyebrow={copy.talentProfile.portfolioEyebrow}
              title={copy.talentProfile.portfolioTitle}
              description={copy.talentProfile.portfolioDescription}
            />

            <div className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
              {portfolio.map((item) => (
                <img
                  key={item.id}
                  src={resolveTalentPortfolioSource(talent, item)}
                  onError={(event) => applyFallback(event, buildTalentPortfolioFallback(talent, item))}
                  alt={item.title || talent.stage_name}
                  className="h-[220px] w-full object-cover grayscale contrast-110 sm:h-[260px]"
                />
              ))}
            </div>
          </div>
        </div>

        <div id="booking" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BookingForm onSubmit={handleBookingSubmit} loading={bookingLoading} />

          {!isAuthenticated ? (
            <p className="text-xs uppercase tracking-editorial text-smoke">
              {copy.talentProfile.accessToReservePrefix}{' '}
              <Link to="/login" className="text-ink underline">
                {copy.talentProfile.accessToReserveLink}
              </Link>{' '}
              {copy.talentProfile.accessToReserveSuffix}
            </p>
          ) : null}

          {feedback ? <p className="text-sm text-smoke">{feedback}</p> : null}
        </div>
      </section>
    </>
  )
}

export default TalentProfilePage
