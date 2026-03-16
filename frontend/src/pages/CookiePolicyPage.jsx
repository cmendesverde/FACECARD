import SectionHeader from '../components/ui/SectionHeader'
import { copy } from '../content/copy'

const cookieSections = copy.legal.cookieSections

const CookiePolicyPage = () => {
  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader
        eyebrow={copy.legal.eyebrow}
        title={copy.legal.cookieTitle}
        description={copy.legal.cookieDescription}
      />

      <div className="space-y-4">
        {cookieSections.map((section) => (
          <article key={section.title} className="border border-fog bg-white p-4 sm:p-6">
            <h3 className="font-display text-2xl leading-none text-ink sm:text-3xl">{section.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CookiePolicyPage

