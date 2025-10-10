export default function DiagnosticPage() {
  const envInfo = {
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...' || 'Not set',
    baseUrl: import.meta.env.BASE_URL,
    mode: import.meta.env.MODE,
    url: window.location.href,
    hostname: window.location.hostname,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔍 Deployment Diagnostic
          </h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Environment Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span>Supabase URL:</span>
                    <span className={envInfo.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                      {envInfo.hasSupabaseUrl ? '✅ Set' : '❌ Missing'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span>Supabase Key:</span>
                    <span className={envInfo.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                      {envInfo.hasSupabaseKey ? '✅ Set' : '❌ Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Build Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm space-y-1">
                  <div>Base URL: {envInfo.baseUrl}</div>
                  <div>Mode: {envInfo.mode}</div>
                  <div>Current URL: {envInfo.url}</div>
                  <div>Hostname: {envInfo.hostname}</div>
                </div>
              </div>
            </section>

            {!envInfo.hasSupabaseUrl || !envInfo.hasSupabaseKey ? (
              <section className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold mb-2">⚠️ Configuration Issue Detected</h3>
                <p className="text-red-700 mb-3">
                  The blank page issue is likely caused by missing environment variables.
                </p>
                <div className="text-sm text-red-600">
                  <p className="font-semibold">To fix this:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to your deployment platform (Vercel, Netlify, etc.)</li>
                    <li>Add environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                    <li>Redeploy the application</li>
                  </ol>
                </div>
              </section>
            ) : (
              <section className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">✅ Configuration Looks Good</h3>
                <p className="text-green-700">
                  Environment variables are properly configured. If you're still seeing issues, 
                  check the browser console for JavaScript errors.
                </p>
              </section>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
