import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Contacto', to: '/contact' },
  { label: 'Privacidad', to: '/privacy-policy' },
  { label: 'Cookies', to: '/cookie-policy' },
]

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-fog/70 py-10 md:mt-24 md:py-12">
      <div className="facecard-container space-y-4">
        <div className="flex flex-col gap-2 text-center text-[0.65rem] uppercase tracking-editorial text-smoke md:flex-row md:items-center md:justify-between md:text-left">
          <p>FACECARD</p>
          <p>Plataforma premium de reserva de talento visual</p>
          <p>{new Date().getFullYear()}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-3 text-[0.65rem] uppercase tracking-editorial text-smoke md:justify-start">
          {footerLinks.map((item) => (
            <Link key={item.to} to={item.to} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
