import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (response?.status !== 401 || config._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      return Promise.reject(error)
    }

    config._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject, config })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post(`${API_URL}/users/token/refresh/`, { refresh: refreshToken })
      localStorage.setItem('access_token', data.access)
      refreshQueue.forEach(({ resolve, config: queuedConfig }) => {
        queuedConfig.headers.Authorization = `Bearer ${data.access}`
        resolve(api(queuedConfig))
      })
      refreshQueue = []
      config.headers.Authorization = `Bearer ${data.access}`
      return api(config)
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError))
      refreshQueue = []
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err.response) {
    // Request never got a response: server down, wrong API URL, CORS/Private
    // Network Access block, offline, etc. Showing a credential-style message
    // here would hide the real problem.
    return 'Could not reach the server. Check your connection and that the API is running.'
  }
  const data = err.response.data
  if (!data) return fallback
  if (data.non_field_errors?.[0]) return data.non_field_errors[0]
  if (data.detail) return data.detail
  const firstValue = Object.values(data).flat()[0]
  return firstValue || fallback
}

export default api
