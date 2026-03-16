import { Link } from 'react-router-dom'
import { copy } from '../content/copy'

const NotFoundPage = () => {
  return (
    <section className="facecard-container py-16 text-center sm:py-24">
      <p className="facecard-subtitle">{copy.notFound.code}</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">{copy.notFound.title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-smoke">{copy.notFound.description}</p>
      <div className="mt-8">
        <Link to="/" className="facecard-button w-full sm:w-auto">
          {copy.notFound.cta}
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
