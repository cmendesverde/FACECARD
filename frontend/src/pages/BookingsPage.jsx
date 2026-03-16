import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../hooks/useAuth'
import { getBookings, updateBookingStatus } from '../services/bookings'
import { formatCurrency, formatDate } from '../utils/format'

const statusOptions = ['pending', 'accepted', 'rejected', 'completed']

const statusLabels = {
  pending: 'pendiente',
  accepted: 'aceptada',
  rejected: 'rechazada',
  completed: 'completada',
}

const BookingsPage = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])

  const fetchBookings = async () => {
    setLoading(true)

    try {
      const data = await getBookings()
      setBookings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated])

  const handleStatusChange = async (bookingId, status) => {
    await updateBookingStatus(bookingId, status)
    await fetchBookings()
  }

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || loading) {
    return (
      <section className="facecard-container py-12 md:py-16">
        <LoadingState label="Cargando reservas..." />
      </section>
    )
  }

  return (
    <section className="facecard-container pt-10 md:pt-20">
      <SectionHeader
        eyebrow="Reservas"
        title="Pipeline de reservas"
        description="Sigue solicitudes pendientes y el estado de cada produccion desde una sola vista."
      />

      {!bookings.length ? (
        <EmptyState title="No hay reservas aun" message="Tu lista de reservas esta vacia por ahora." />
      ) : (
        <div className="space-y-3 md:space-y-4">
          {bookings.map((booking) => {
            const talent = booking.talent_profile
            const client = booking.client
            const canEditStatus = user?.role === 'talent' || user?.role === 'admin'

            return (
              <article
                key={booking.id}
                className="grid gap-4 border border-fog bg-white p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
              >
                <div>
                  <p className="facecard-subtitle">{booking.project_type}</p>
                  <h3 className="mt-2 font-display text-2xl leading-none sm:text-3xl">
                    {talent?.stage_name ?? 'Talento'} · {talent?.city ?? booking.location}
                  </h3>
                  <p className="mt-3 text-sm text-smoke">
                    Fecha: {formatDate(booking.event_date)} · Presupuesto: {formatCurrency(booking.budget)}
                  </p>
                  <p className="mt-1 text-sm text-smoke">Cliente: {client?.name ?? 'Cliente privado'}</p>
                  {booking.notes ? <p className="mt-3 text-sm text-smoke">{booking.notes}</p> : null}
                </div>

                {canEditStatus ? (
                  <select
                    value={booking.status}
                    onChange={(event) => handleStatusChange(booking.id, event.target.value)}
                    className="w-full border border-fog bg-transparent px-4 py-3 text-xs uppercase tracking-editorial outline-none focus:border-ink md:w-auto"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs uppercase tracking-editorial text-smoke">
                    {statusLabels[booking.status] ?? booking.status}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default BookingsPage
