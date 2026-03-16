import { Link } from 'react-router-dom'
import { copy } from '../../content/copy'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true">
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true">
    <path d="M14.8 3h2.8c.2 1 .9 2 1.9 2.6.7.4 1.6.7 2.5.7V9c-1.5 0-3-.5-4.2-1.3v6.5a6.3 6.3 0 1 1-5.3-6.2v2.8a3.5 3.5 0 1 0 2.3 3.3V3Z" />
  </svg>
)

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-black/5 bg-[#f3f3f3] py-12 md:py-14">
      <div className="facecard-container flex flex-col items-center text-center">
        <p className="font-display text-3xl tracking-[0.02em] text-ink sm:text-4xl">{copy.common.appName}</p>

        <nav className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[0.62rem] uppercase tracking-editorial text-smoke sm:gap-3 sm:text-[0.66rem]">
          <Link to="/contact" className="transition hover:text-ink">
            {copy.footer.links.contact}
          </Link>
          <span aria-hidden="true">|</span>
          <Link to="/privacy-policy" className="transition hover:text-ink">
            {copy.footer.links.privacy}
          </Link>
          <span aria-hidden="true">|</span>
          <Link to="/cookie-policy" className="transition hover:text-ink">
            {copy.footer.links.consent}
          </Link>
        </nav>

        <div className="mt-5 flex items-center gap-4 text-ink">
          <a
            href={copy.footer.social.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={copy.footer.social.instagram}
            className="transition hover:opacity-65"
          >
            <InstagramIcon />
          </a>
          <a
            href={copy.footer.social.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={copy.footer.social.tiktok}
            className="transition hover:opacity-65"
          >
            <TikTokIcon />
          </a>
        </div>

        <p className="mt-6 text-[0.62rem] text-smoke">{copy.footer.rights(year)}</p>
      </div>
    </footer>
  )
}

export default Footer

