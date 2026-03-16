import { useState } from 'react'

const initialValues = {
  project_type: '',
  event_date: '',
  location: '',
  budget: '',
  notes: '',
}

const BookingForm = ({ onSubmit, loading }) => {
  const [values, setValues] = useState(initialValues)

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(values)
    setValues(initialValues)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-fog bg-white p-4 sm:p-6">
      <p className="facecard-subtitle">Reservar ahora</p>
      <h3 className="font-display text-2xl leading-none sm:text-3xl">Solicitud de proyecto</h3>

      <input
        required
        value={values.project_type}
        onChange={(event) => handleChange('project_type', event.target.value)}
        placeholder="Tipo de proyecto"
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <input
        required
        type="date"
        value={values.event_date}
        onChange={(event) => handleChange('event_date', event.target.value)}
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <input
        required
        value={values.location}
        onChange={(event) => handleChange('location', event.target.value)}
        placeholder="Ubicacion"
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <input
        required
        type="number"
        min="0"
        value={values.budget}
        onChange={(event) => handleChange('budget', event.target.value)}
        placeholder="Presupuesto (EUR)"
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <textarea
        value={values.notes}
        onChange={(event) => handleChange('notes', event.target.value)}
        placeholder="Notas del proyecto"
        rows={4}
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <button type="submit" disabled={loading} className="facecard-button w-full">
        {loading ? 'Enviando...' : 'Solicitar reserva'}
      </button>
    </form>
  )
}

export default BookingForm
