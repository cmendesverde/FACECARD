import { useState } from 'react'
import SectionHeader from '../components/ui/SectionHeader'
import { copy } from '../content/copy'

const initialValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const ContactPage = () => {
  const [values, setValues] = useState(initialValues)
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setValues(initialValues)
  }

  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader eyebrow={copy.contact.eyebrow} title={copy.contact.title} description={copy.contact.description} />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <article className="border border-fog bg-white p-4 sm:p-6">
          <p className="facecard-subtitle">{copy.contact.directChannels}</p>
          <p className="mt-3 text-sm text-smoke">{copy.contact.generalEmail}: {copy.contact.generalEmailValue}</p>
          <p className="mt-1 text-sm text-smoke">{copy.contact.collaborationsEmail}: {copy.contact.collaborationsEmailValue}</p>
          <p className="mt-1 text-sm text-smoke">{copy.contact.pressEmail}: {copy.contact.pressEmailValue}</p>

          <div className="mt-6 border-t border-fog pt-5">
            <p className="facecard-subtitle">{copy.contact.scheduleTitle}</p>
            <p className="mt-2 text-sm text-smoke">{copy.contact.scheduleValue}</p>
          </div>
        </article>

        <form onSubmit={handleSubmit} className="space-y-3 border border-fog bg-white p-4 sm:p-6">
          <input
            required
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={copy.contact.form.name}
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <input
            required
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder={copy.contact.form.email}
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <input
            required
            value={values.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder={copy.contact.form.subject}
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <textarea
            required
            rows={6}
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder={copy.contact.form.message}
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <button type="submit" className="facecard-button w-full">
            {copy.contact.form.submit}
          </button>

          {submitted ? <p className="text-sm text-smoke">{copy.contact.form.success}</p> : null}
        </form>
      </div>
    </section>
  )
}

export default ContactPage

