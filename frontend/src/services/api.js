import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error attaching auth token to request:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
