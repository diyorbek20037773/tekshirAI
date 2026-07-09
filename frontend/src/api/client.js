import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// JWT interceptor — har bir so'rovga token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — 401 da login sahifasiga yo'naltirish.
// Auth chaqiruvlarida (login/register) redirect qilmaymiz — sahifa xatoni ko'rsatsin.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthCall = url.includes('/auth/')
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
