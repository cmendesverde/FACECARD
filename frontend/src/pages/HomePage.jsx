import { useEffect, useState } from 'react'
import HeroSection from '../components/ui/HeroSection'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import TalentGrid from '../components/cards/TalentGrid'
import { getFeaturedTalents } from '../services/talents'

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
          eyebrow="Talentos destacados"
          title="Un casting curado de creadores visuales"
          description="Cada perfil se selecciona por calidad editorial, consistencia visual y fiabilidad de booking."
        />

        {loading ? <LoadingState /> : <TalentGrid talents={featuredTalents} />}
      </section>

      <section className="facecard-container mt-14 md:mt-20">
        <div className="grid gap-6 border border-fog bg-white p-5 sm:p-6 md:grid-cols-3 md:gap-8 md:p-8">
          <div>
            <p className="facecard-subtitle">Calidad editorial</p>
            <p className="mt-3 text-sm text-smoke">Estetica limpia, criterio visual y nivel de agencia premium.</p>
          </div>
          <div>
            <p className="facecard-subtitle">Reserva agil</p>
            <p className="mt-3 text-sm text-smoke">Desde discovery hasta confirmacion en un flujo simple y elegante.</p>
          </div>
          <div>
            <p className="facecard-subtitle">Foco en Espana</p>
            <p className="mt-3 text-sm text-smoke">Madrid, Barcelona, Valencia y Sevilla activas en este lanzamiento.</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
