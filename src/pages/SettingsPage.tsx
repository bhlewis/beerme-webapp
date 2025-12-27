import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApiKey } from '../context/ApiKeyContext'
import { healthApi } from '../api/health'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsForm {
  apiUrl: string
  apiKey: string
}

export function SettingsPage() {
  const { apiKey, apiUrl, setApiKey, setApiUrl } = useApiKey()
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, getValues } = useForm<SettingsForm>({
    defaultValues: {
      apiUrl: apiUrl,
      apiKey: apiKey || '',
    },
  })

  const onSubmit = (data: SettingsForm) => {
    setApiUrl(data.apiUrl)
    setApiKey(data.apiKey)
    toast.success('Settings saved')
  }

  const testConnection = async () => {
    const values = getValues()
    setApiUrl(values.apiUrl)
    setApiKey(values.apiKey)

    setTestStatus('loading')
    try {
      await healthApi.check()
      setTestStatus('success')
      toast.success('Connection successful')
    } catch {
      setTestStatus('error')
      toast.error('Connection failed')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Configure your API connection</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
            API URL
          </label>
          <input
            type="url"
            id="apiUrl"
            {...register('apiUrl')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            placeholder="http://localhost:8000"
          />
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            {...register('apiKey')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            placeholder="Enter your API key"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={testConnection}
            disabled={testStatus === 'loading'}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {testStatus === 'loading' ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </span>
            ) : (
              'Test Connection'
            )}
          </button>

          {testStatus === 'success' && (
            <span className="flex items-center text-green-600">
              <CheckCircle className="mr-1 h-5 w-5" />
              Connected
            </span>
          )}

          {testStatus === 'error' && (
            <span className="flex items-center text-red-600">
              <XCircle className="mr-1 h-5 w-5" />
              Failed
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
