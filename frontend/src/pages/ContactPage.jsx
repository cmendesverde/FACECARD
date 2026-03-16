import { useState } from 'react'
import SectionHeader from '../components/ui/SectionHeader'

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
      <SectionHeader
        eyebrow="Contacto"
        title="Formulario de contacto"
        description="Escribe tu consulta y te responderemos por email con seguimiento editorial o comercial segun tu solicitud."
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <article className="border border-fog bg-white p-4 sm:p-6">
          <p className="facecard-subtitle">Canales directos</p>
          <p className="mt-3 text-sm text-smoke">Email general: hello@facecard.local</p>
          <p className="mt-1 text-sm text-smoke">Colaboraciones: editorial@facecard.local</p>
          <p className="mt-1 text-sm text-smoke">Prensa: press@facecard.local</p>

          <div className="mt-6 border-t border-fog pt-5">
            <p className="facecard-subtitle">Horario</p>
            <p className="mt-2 text-sm text-smoke">Lunes a Viernes, 09:00 - 18:00 (CET)</p>
          </div>
        </article>

        <form onSubmit={handleSubmit} className="space-y-3 border border-fog bg-white p-4 sm:p-6">
          <input
            required
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Nombre"
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <input
            required
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="Email"
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <input
            required
            value={values.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder="Asunto"
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <textarea
            required
            rows={6}
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="Mensaje"
            className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />

          <button type="submit" className="facecard-button w-full">
            Enviar mensaje
          </button>

          {submitted ? <p className="text-sm text-smoke">Tu mensaje fue enviado. Te responderemos pronto.</p> : null}
        </form>
      </div>
    </section>
  )
}

export default ContactPage
