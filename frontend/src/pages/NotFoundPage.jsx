import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <section className="facecard-container py-16 text-center sm:py-24">
      <p className="facecard-subtitle">404</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Pagina no encontrada</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-smoke">La pagina solicitada no existe en esta version.</p>
      <div className="mt-8">
        <Link to="/" className="facecard-button w-full sm:w-auto">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
