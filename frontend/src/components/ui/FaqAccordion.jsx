import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionContent = motion.div

const FaqAccordion = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <article key={item.question} className="overflow-hidden border border-fog bg-white/90">
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-mist sm:px-6"
              >
                <span className="text-sm font-semibold leading-snug text-ink sm:text-base">{item.question}</span>
                <span className="text-xl leading-none text-smoke">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <MotionContent
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <p className="px-4 pb-5 text-sm leading-relaxed text-smoke sm:px-6">{item.answer}</p>
                </MotionContent>
              ) : null}
            </AnimatePresence>
          </article>
        )
      })}
    </div>
  )
}

export default FaqAccordion

