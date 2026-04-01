import axios from 'axios'

const normalizeApiUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  return value.replace(/\/+$/, '')
}

const fallbackApiUrl = import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : ''

const configuredApiUrl = normalizeApiUrl(
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? fallbackApiUrl,
)

if (!configuredApiUrl) {
  throw new Error('Falta VITE_API_URL. Configura la URL del backend antes de compilar para produccion.')
}

const api = axios.create({
  baseURL: configuredApiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('facecard_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
