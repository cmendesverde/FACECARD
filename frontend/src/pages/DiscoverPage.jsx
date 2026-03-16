import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import FilterBar from '../components/filters/FilterBar'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import CategoryFeaturedSection from '../components/cards/CategoryFeaturedSection'
import { getTalents } from '../services/talents'
import { copy } from '../content/copy'

const CATEGORY_ORDER = ['model', 'photographer', 'makeup artist', 'tattoo artist', 'creative director', 'stylist']
const CITY_ORDER = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla']

const normalizeCategory = (value) => String(value ?? '').trim().toLowerCase()
const normalizeCity = (value) => String(value ?? '').trim()

const formatFallbackTitle = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`)
    .join(' ')

const resolveMode = (pathname) => (pathname.startsWith('/cities') ? 'city' : 'category')

const DiscoverPage = () => {
  const { pathname } = useLocation()
  const mode = resolveMode(pathname)
  const isCityMode = mode === 'city'

  const [loading, setLoading] = useState(true)
  const [talents, setTalents] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    availability: '',
    maxDayRate: '',
  })

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      category: filters.category || undefined,
      city: filters.city || undefined,
      availability: filters.availability || undefined,
      max_day_rate: filters.maxDayRate || undefined,
      featured_only: 1,
      per_page: 120,
    }),
    [filters],
  )

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true)

      try {
        const response = await getTalents(queryParams)
        setTalents(Array.isArray(response.data) ? response.data : [])
        setMeta({ total: Number(response.total ?? 0) })
      } finally {
        setLoading(false)
      }
    }

    fetchTalents()
  }, [queryParams])

  const featuredSections = useMemo(() => {
    const grouped = talents.reduce((acc, talent) => {
      const key = isCityMode ? normalizeCity(talent.city) : normalizeCategory(talent.category)

      if (!key) {
        return acc
      }

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(talent)
      return acc
    }, {})

    const selectedKey = isCityMode ? normalizeCity(filters.city) : normalizeCategory(filters.category)
    const baseOrder = isCityMode ? CITY_ORDER : CATEGORY_ORDER
    const preferredOrder = selectedKey ? [selectedKey] : baseOrder
    const dynamicKeys = Object.keys(grouped).filter((key) => !preferredOrder.includes(key))
    const orderedKeys = [...preferredOrder, ...dynamicKeys]

    return orderedKeys
      .filter((key) => grouped[key]?.length)
      .map((key) => {
        if (isCityMode) {
          return {
            key,
            mode: 'city',
            title: `${key} ${copy.discover.citySection.titleSuffix}`,
            categoryLabel: key,
            description: `${copy.discover.citySection.descriptionPrefix} ${key}.`,
            talents: grouped[key].slice(0, 6),
            activeCount: grouped[key].filter((talent) => Boolean(talent.is_featured)).length,
          }
        }

        const metaInfo = copy.discover.categoryMeta[key]

        return {
          key,
          mode: 'category',
          title: metaInfo?.title ?? `${formatFallbackTitle(key)} destacados`,
          categoryLabel: metaInfo?.label ?? formatFallbackTitle(key),
          description: metaInfo?.description ?? copy.discover.categoryMeta.fallbackDescription,
          talents: grouped[key].slice(0, 6),
          activeCount: grouped[key].filter((talent) => Boolean(talent.is_featured)).length,
        }
      })
  }, [talents, filters.category, filters.city, isCityMode])

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const headerText = isCityMode ? copy.discover.cityHeader : copy.discover.categoryHeader

  return (
    <section className="facecard-container bg-white pt-10 md:pt-20">
      <SectionHeader eyebrow={headerText.eyebrow} title={headerText.title} description={headerText.description} />

      <FilterBar filters={filters} onChange={updateFilter} onSearch={(value) => updateFilter('search', value)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-fog py-3">
        <p className="text-[0.65rem] uppercase tracking-editorial text-smoke">
          {meta.total} {copy.discover.resultCountSuffix}
        </p>
        <p className="text-[0.65rem] uppercase tracking-editorial text-accent">{copy.discover.gridHint}</p>
      </div>

      {loading ? <LoadingState label={copy.discover.loadingBlocks} /> : null}

      {!loading && !featuredSections.length ? (
        <EmptyState title={copy.discover.emptyTitle} message={copy.discover.emptyMessage} />
      ) : null}

      {!loading && featuredSections.length ? (
        <div className="space-y-8 md:space-y-10">
          {featuredSections.map((section) => (
            <CategoryFeaturedSection
              key={section.key}
              title={section.title}
              description={section.description}
              categoryLabel={section.categoryLabel}
              talents={section.talents}
              activeCount={section.activeCount}
              mode={section.mode}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default DiscoverPage
