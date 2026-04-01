import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { applyFallback, buildTalentPortraitFallback, resolveTalentPortraitSource } from '../../utils/imageFallbacks'
import { copy } from '../../content/copy'

const MotionArticle = motion.article

const TalentCard = ({ talent }) => {
  return (
    <MotionArticle
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group relative min-w-0 overflow-hidden bg-white"
    >
      <img
        src={resolveTalentPortraitSource(talent)}
        onError={(event) => applyFallback(event, buildTalentPortraitFallback(talent))}
        alt={talent.stage_name}
        className="h-[250px] w-full object-cover grayscale contrast-110 transition duration-700 group-hover:scale-[1.03] sm:h-[340px] lg:h-[430px]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/18 to-transparent opacity-100 transition duration-500 md:opacity-0 md:group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-5">
        <p className="text-[0.56rem] uppercase tracking-editorial text-white/80 sm:text-[0.62rem]">{talent.category}</p>
        <h3 className="mt-1 font-display text-xl leading-none sm:text-3xl">{talent.stage_name}</h3>
        <p className="mt-2 text-[0.56rem] uppercase tracking-editorial text-white/80 sm:text-xs">{talent.city}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 opacity-100 transition duration-500 md:mt-5 md:opacity-0 md:group-hover:opacity-100">
          <Link
            to={`/talents/${talent.id}`}
            className="facecard-button w-full border-white text-white hover:bg-white hover:text-ink"
          >
            {copy.cards.viewProfile}
          </Link>
          <Link
            to={`/talents/${talent.id}#booking`}
            className="facecard-button w-full border-white text-white hover:bg-white hover:text-ink"
          >
            {copy.cards.reserve}
          </Link>
        </div>
      </div>
    </MotionArticle>
  )
}

export default TalentCard
