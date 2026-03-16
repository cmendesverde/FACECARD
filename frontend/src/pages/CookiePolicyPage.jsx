import SectionHeader from '../components/ui/SectionHeader'

const cookieSections = [
  {
    title: '1. Cookies esenciales',
    body: 'Permiten autenticacion, seguridad de sesion y continuidad del flujo de reserva. No pueden desactivarse para operar el servicio.',
  },
  {
    title: '2. Cookies analiticas',
    body: 'Miden rendimiento, navegacion y uso de secciones para mejorar interfaz, tiempos de carga y priorizacion de funcionalidades.',
  },
  {
    title: '3. Cookies de marketing',
    body: 'Ayudan a personalizar mensajes promocionales y contenidos comerciales cuando otorgas consentimiento explicito.',
  },
  {
    title: '4. Gestion de preferencias',
    body: 'Puedes aceptar, rechazar o ajustar cookies opcionales desde el panel de preferencias mostrado en el banner de consentimiento.',
  },
]

const CookiePolicyPage = () => {
  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="Resumen de categorias de cookies y como gestionar tus preferencias de consentimiento."
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
