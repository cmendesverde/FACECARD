import { motion } from 'framer-motion'
import { copy } from '../../content/copy'

const MotionSpan = motion.span

const LoadingState = ({ label = copy.common.loadingProfiles }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 py-8 text-[0.68rem] uppercase tracking-editorial text-smoke md:py-10">
      <MotionSpan
        className="h-2.5 w-2.5 rounded-full bg-ink"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
