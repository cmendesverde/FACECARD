import { useState } from 'react'
import { copy } from '../content/copy'

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
    <form onSubmit={handleSubmit} className="space-y-3 border border-fog bg-white p-4 sm:p-5">
      <p className="facecard-subtitle">{copy.bookingForm.eyebrow}</p>
      <h3 className="font-display text-xl leading-none sm:text-2xl">{copy.bookingForm.title}</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={values.project_type}
          onChange={(event) => handleChange('project_type', event.target.value)}
          placeholder={copy.bookingForm.projectType}
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
          placeholder={copy.bookingForm.location}
          className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
        />

        <input
          required
          type="number"
          min="0"
          value={values.budget}
          onChange={(event) => handleChange('budget', event.target.value)}
          placeholder={copy.bookingForm.budget}
          className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>

      <textarea
        value={values.notes}
        onChange={(event) => handleChange('notes', event.target.value)}
        placeholder={copy.bookingForm.notes}
        rows={3}
        className="w-full border border-fog bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />

      <button type="submit" disabled={loading} className="facecard-button w-full">
        {loading ? copy.bookingForm.submitting : copy.bookingForm.submit}
      </button>
    </form>
  )
}

export default BookingForm
