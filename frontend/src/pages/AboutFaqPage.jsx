import SectionHeader from '../components/ui/SectionHeader'
import FaqAccordion from '../components/ui/FaqAccordion'
import { copy } from '../content/copy'

const AboutFaqPage = () => {
  const content = copy.aboutFaq

  return (
    <section className="facecard-container py-10 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 md:space-y-12">
        <article className="border border-fog bg-white px-5 py-8 sm:p-10 md:p-14">
          <SectionHeader eyebrow={content.heroEyebrow} title={content.heroTitle} />

          <div className="space-y-5 text-sm leading-relaxed text-smoke sm:text-[0.98rem]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <article className="border border-fog bg-[#f8f8f8] p-5 sm:p-8 md:p-10">
          <p className="facecard-subtitle">{content.visionTitle}</p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {content.visionPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 border border-fog bg-white px-4 py-4">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-ink">{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="border border-fog bg-white p-5 sm:p-8 md:p-10">
          <p className="mb-5 facecard-subtitle">{content.faqTitle}</p>
          <FaqAccordion items={content.faqs} />
        </article>
      </div>
    </section>
  )
}

export default AboutFaqPage
