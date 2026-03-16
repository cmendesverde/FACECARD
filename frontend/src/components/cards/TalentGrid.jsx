import TalentCard from './TalentCard'
import EmptyState from '../ui/EmptyState'
import { copy } from '../../content/copy'

const TalentGrid = ({ talents }) => {
  if (!talents.length) {
    return <EmptyState title={copy.cards.noTalentsTitle} message={copy.cards.noTalentsMessage} />
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
