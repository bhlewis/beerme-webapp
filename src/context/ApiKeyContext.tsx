import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { getStoredApiKey, getStoredApiUrl, setApiKey as storeApiKey, setApiUrl as storeApiUrl, clearApiKey } from '../api/client'

interface ApiKeyContextType {
  apiKey: string | null
  apiUrl: string
  setApiKey: (key: string) => void
  setApiUrl: (url: string) => void
  clearCredentials: () => void
  isConfigured: boolean
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(() => getStoredApiKey())
  const [apiUrl, setApiUrlState] = useState<string>(() => getStoredApiUrl())

  const setApiKey = useCallback((key: string) => {
    storeApiKey(key)
    setApiKeyState(key)
  }, [])

  const setApiUrl = useCallback((url: string) => {
    storeApiUrl(url)
    setApiUrlState(url)
  }, [])

  const clearCredentials = useCallback(() => {
    clearApiKey()
    setApiKeyState(null)
  }, [])

  return (
    <ApiKeyContext.Provider value={{
      apiKey,
      apiUrl,
      setApiKey,
      setApiUrl,
      clearCredentials,
      isConfigured: !!apiKey,
    }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider')
  }
  return context
}
