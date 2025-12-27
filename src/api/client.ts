import axios, { AxiosInstance } from 'axios'

const API_KEY_STORAGE_KEY = 'beerme_api_key'
const API_URL_STORAGE_KEY = 'beerme_api_url'

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY)
}

export const getStoredApiUrl = (): string => {
  return localStorage.getItem(API_URL_STORAGE_KEY) || 'http://localhost:8000'
}

export const setApiKey = (key: string) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key)
}

export const setApiUrl = (url: string) => {
  localStorage.setItem(API_URL_STORAGE_KEY, url)
}

export const clearApiKey = () => {
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

export const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add API key and base URL
apiClient.interceptors.request.use((config) => {
  const apiKey = getStoredApiKey()
  const apiUrl = getStoredApiUrl()

  config.baseURL = `${apiUrl}/api/v1`

  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }

  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Invalid API key')
    }
    return Promise.reject(error)
  }
)
