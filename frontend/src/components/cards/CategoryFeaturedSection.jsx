import TalentEditorialCard from './TalentEditorialCard'
import { copy } from '../../content/copy'

const CategoryFeaturedSection = ({ title, description, categoryLabel, talents, activeCount, mode = 'category' }) => {
  if (!talents.length) {
    return null
  }

  const sectionTypeLabel = mode === 'city' ? copy.cards.sectionCityLabel : copy.cards.sectionSpecialtyLabel

  return (
    <section className="border border-fog bg-white p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-fog pb-4">
        <div>
          <p className="facecard-subtitle text-smoke">{sectionTypeLabel}</p>
          <h2 className="mt-2 font-display text-3xl leading-none text-ink sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-smoke">{description}</p>
        </div>
        <p className="text-xs uppercase tracking-editorial text-accent">
          {activeCount} {copy.cards.activeShowcaseSuffix}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {talents.map((talent) => (
          <TalentEditorialCard key={talent.id} talent={talent} specialty={categoryLabel} mode={mode} />
        ))}
      </div>
    </section>
  )
}

export default CategoryFeaturedSection
