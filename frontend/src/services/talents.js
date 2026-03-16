import api from './api'

export const getTalents = async (params = {}) => {
  const response = await api.get('/talents', { params })
  return response.data
}

export const getTalentById = async (id) => {
  const response = await api.get(`/talents/${id}`)
  return response.data
}

export const getFeaturedTalents = async () => {
  const response = await api.get('/featured-talents')
  return response.data
}
