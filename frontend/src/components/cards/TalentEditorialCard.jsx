import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { applyFallback, buildTalentPortraitFallback, resolveTalentPortraitSource } from '../../utils/imageFallbacks'
import { copy } from '../../content/copy'

const resolveSpecialty = (talent, specialty, mode) => {
  if (mode === 'city') {
    const key = String(talent.category ?? '').trim().toLowerCase()
    return copy.cards.categories[key] ?? talent.category
  }

  return specialty
}

const TalentEditorialCard = ({ talent, specialty, mode = 'category' }) => {
  const specialtyText = resolveSpecialty(talent, specialty, mode)

  return (
    <Link
      to={`/talents/${talent.id}`}
      className="group block overflow-hidden border border-fog bg-white transition duration-300 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <article className="h-full">
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
          <img
            src={resolveTalentPortraitSource(talent)}
            onError={(event) => applyFallback(event, buildTalentPortraitFallback(talent))}
            alt={talent.stage_name}
            className="h-full w-full object-cover grayscale contrast-110 transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
        </div>

        <div className="space-y-2 p-2.5 sm:space-y-3 sm:p-4">
          <h3 className="font-display text-xl leading-[0.95] text-ink sm:text-2xl">{talent.stage_name}</h3>

          <dl className="space-y-1 text-[0.56rem] uppercase tracking-editorial text-smoke sm:text-[0.68rem]">
            <div className="flex items-start justify-between gap-2">
              <dt>{copy.cards.city}</dt>
              <dd className="text-right text-ink">{talent.city}</dd>
            </div>
            <div className="flex items-start justify-between gap-2">
              <dt>{copy.cards.specialty}</dt>
              <dd className="text-right text-ink">{specialtyText}</dd>
            </div>
            <div className="flex items-start justify-between gap-2">
              <dt>{copy.cards.rate}</dt>
              <dd className="text-right text-ink">
                {formatCurrency(talent.day_rate)}
                {copy.cards.daySuffix}
              </dd>
            </div>
          </dl>

          <span className="inline-flex text-[0.56rem] uppercase tracking-editorial text-accent sm:text-[0.62rem]">
            {copy.cards.viewSheet}
          </span>
        </div>
      </article>
    </Link>
  )
}

export default TalentEditorialCard
