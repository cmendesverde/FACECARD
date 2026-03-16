import api from './api'

export const getBookings = async () => {
  const response = await api.get('/bookings')
  return response.data
}

export const createBooking = async (payload) => {
  const response = await api.post('/bookings', payload)
  return response.data
}

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/bookings/${id}/status`, { status })
  return response.data
}

export const getMyTalentProfile = async () => {
  const response = await api.get('/me/talent-profile')
  return response.data
}

export const createMyTalentProfile = async (payload) => {
  const response = await api.post('/me/talent-profile', payload)
  return response.data
}

export const updateMyTalentProfile = async (payload) => {
  const response = await api.put('/me/talent-profile', payload)
  return response.data
}

export const getMyPortfolio = async () => {
  const response = await api.get('/me/portfolio')
  return response.data
}

export const addPortfolioItem = async (payload) => {
  const response = await api.post('/me/portfolio', payload)
  return response.data
}

export const deletePortfolioItem = async (id) => {
  const response = await api.delete(`/me/portfolio/${id}`)
  return response.data
}
