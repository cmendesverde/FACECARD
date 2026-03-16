import { AVAILABILITY_OPTIONS, CATEGORY_OPTIONS, CITY_OPTIONS } from '../../data/filters'

const FilterBar = ({ filters, onChange, onSearch }) => {
  return (
    <section className="mb-8 border border-fog bg-white p-4 sm:p-5 md:mb-10 md:p-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-6">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar por nombre, estilo o ciudad"
          className="min-w-0 border border-fog bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-accent xl:col-span-2"
        />

        <select
          value={filters.category}
          onChange={(event) => onChange('category', event.target.value)}
          className="min-w-0 border border-fog bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value || 'all-categories'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(event) => onChange('city', event.target.value)}
          className="min-w-0 border border-fog bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
        >
          {CITY_OPTIONS.map((option) => (
            <option key={option.value || 'all-cities'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.availability}
          onChange={(event) => onChange('availability', event.target.value)}
          className="min-w-0 border border-fog bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value || 'all-availability'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          step="50"
          value={filters.maxDayRate}
          onChange={(event) => onChange('maxDayRate', event.target.value)}
          placeholder="Tarifa maxima por dia"
          className="min-w-0 border border-fog bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
        />
      </div>
    </section>
  )
}

export default FilterBar
