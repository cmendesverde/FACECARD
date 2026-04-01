import TalentEditorialCard from './TalentEditorialCard'
import { copy } from '../../content/copy'

const CategoryFeaturedSection = ({ title, description, categoryLabel, talents, mode = 'category' }) => {
  if (!talents.length) {
    return null
  }

  const sectionTypeLabel = mode === 'city' ? copy.cards.sectionCityLabel : copy.cards.sectionSpecialtyLabel

  return (
    <section className="border border-fog bg-white p-3 sm:p-5 md:p-6">
      <div className="mb-4 border-b border-fog pb-3 sm:mb-5 sm:pb-4">
        <div>
          <p className="facecard-subtitle text-smoke">{sectionTypeLabel}</p>
          <h2 className="mt-2 font-display text-[2rem] leading-none text-ink sm:text-3xl md:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-xs text-smoke sm:text-sm">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {talents.map((talent) => (
          <TalentEditorialCard key={talent.id} talent={talent} specialty={categoryLabel} mode={mode} />
        ))}
      </div>
    </section>
  )
}

export default CategoryFeaturedSection
