import SectionHeader from '../components/ui/SectionHeader'

const policySections = [
  {
    title: '1. Responsable del tratamiento',
    body: 'FACECARD opera este sitio para discovery y reserva de talento creativo. Gestionamos datos de cuenta, contacto y reservas bajo principios de minimizacion y seguridad.',
  },
  {
    title: '2. Datos que recopilamos',
    body: 'Recopilamos nombre, email, ciudad, datos de perfil profesional, reservas y metadatos tecnicos necesarios para funcionamiento, analitica y seguridad.',
  },
  {
    title: '3. Finalidad del uso',
    body: 'Utilizamos los datos para autenticar usuarios, gestionar reservas, mejorar experiencia de navegacion y enviar comunicaciones relacionadas al servicio.',
  },
  {
    title: '4. Conservacion y derechos',
    body: 'Conservamos datos durante el tiempo necesario para prestar el servicio y cumplir obligaciones legales. Puedes solicitar acceso, rectificacion o supresion mediante el formulario de contacto.',
  },
  {
    title: '5. Seguridad',
    body: 'Aplicamos controles tecnicos y organizativos para proteger la informacion contra accesos no autorizados, perdida o alteracion.',
  },
]

const PrivacyPolicyPage = () => {
  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader
        eyebrow="Legal"
        title="Politica de privacidad"
        description="Informacion clara sobre como recopilamos, usamos y protegemos tus datos en FACECARD."
      />

      <div className="space-y-4">
        {policySections.map((section) => (
          <article key={section.title} className="border border-fog bg-white p-4 sm:p-6">
            <h3 className="font-display text-2xl leading-none text-ink sm:text-3xl">{section.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PrivacyPolicyPage
