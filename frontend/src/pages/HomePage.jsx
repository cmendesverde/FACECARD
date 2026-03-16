import { useEffect, useState } from 'react'
import HeroSection from '../components/ui/HeroSection'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import TalentGrid from '../components/cards/TalentGrid'
import { getFeaturedTalents } from '../services/talents'
import { copy } from '../content/copy'

const HomePage = () => {
  const [featuredTalents, setFeaturedTalents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedTalents()
        setFeaturedTalents(data)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <>
      <HeroSection />

      <section className="facecard-container mt-14 md:mt-20">
        <SectionHeader
          eyebrow={copy.home.featuredEyebrow}
          title={copy.home.featuredTitle}
          description={copy.home.featuredDescription}
        />

        {loading ? <LoadingState /> : <TalentGrid talents={featuredTalents} />}
      </section>

      <section className="facecard-container mt-14 md:mt-20">
        <div className="grid gap-6 border border-fog bg-white p-5 sm:p-6 md:grid-cols-3 md:gap-8 md:p-8">
          <div>
            <p className="facecard-subtitle">{copy.home.valueCards.editorialTitle}</p>
            <p className="mt-3 text-sm text-smoke">{copy.home.valueCards.editorialDescription}</p>
          </div>
          <div>
            <p className="facecard-subtitle">{copy.home.valueCards.bookingTitle}</p>
            <p className="mt-3 text-sm text-smoke">{copy.home.valueCards.bookingDescription}</p>
          </div>
          <div>
            <p className="facecard-subtitle">{copy.home.valueCards.launchTitle}</p>
            <p className="mt-3 text-sm text-smoke">{copy.home.valueCards.launchDescription}</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
