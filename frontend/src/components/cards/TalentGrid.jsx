import TalentCard from './TalentCard'
import EmptyState from '../ui/EmptyState'

const TalentGrid = ({ talents }) => {
  if (!talents.length) {
    return <EmptyState title="No se encontraron talentos" message="Ajusta los filtros para descubrir perfiles que encajen con tu proyecto." />
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      {talents.map((talent) => (
        <TalentCard key={talent.id} talent={talent} />
      ))}
    </div>
  )
}

export default TalentGrid
