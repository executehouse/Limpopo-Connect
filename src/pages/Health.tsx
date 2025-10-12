/**
 * Health Check / Diagnostic Page
 * 
 * Purpose: Simple diagnostic page to verify deployment is working
 * Use Case: When preview shows blank page, this helps diagnose the issue
 * Access: /health route
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  checks: {
    vite: { status: string; message: string };
    supabase: { status: string; message: string };
    env: { status: string; message: string };
    routing: { status: string; message: string };
  };
}

export default function Health() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runHealthChecks = async () => {
      const timestamp = new Date().toISOString();
      const checks: HealthCheck['checks'] = {
        vite: { status: 'unknown', message: '' },
        supabase: { status: 'unknown', message: '' },
        env: { status: 'unknown', message: '' },
        routing: { status: 'unknown', message: '' },
      };

      // Check 1: Vite is running
      try {
        checks.vite = {
          status: 'ok',
          message: `React ${import.meta.env.MODE} build loaded successfully`,
        };
      } catch (error) {
        checks.vite = {
          status: 'error',
          message: `Vite error: ${error}`,
        };
      }

      // Check 2: Environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const viteBase = import.meta.env.VITE_BASE || import.meta.env.BASE_URL;

      if (supabaseUrl && supabaseAnonKey) {
        checks.env = {
          status: 'ok',
          message: `Environment variables loaded (URL: ${supabaseUrl.substring(0, 30)}..., Base: ${viteBase})`,
        };
      } else {
        checks.env = {
          status: 'error',
          message: `Missing env vars - URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`,
        };
      }

      // Check 3: Supabase connection
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          checks.supabase = {
            status: 'degraded',
            message: `Supabase query error: ${error.message}`,
          };
        } else {
          checks.supabase = {
            status: 'ok',
            message: 'Supabase connection successful',
          };
        }
      } catch (error) {
        checks.supabase = {
          status: 'error',
          message: `Supabase connection failed: ${error}`,
        };
      }

      // Check 4: Routing
      checks.routing = {
        status: 'ok',
        message: `Current path: ${window.location.pathname}, Base URL: ${import.meta.env.BASE_URL}`,
      };

      // Determine overall status
      const hasError = Object.values(checks).some((c) => c.status === 'error');
      const hasDegraded = Object.values(checks).some((c) => c.status === 'degraded');
      const status = hasError ? 'error' : hasDegraded ? 'degraded' : 'healthy';

      setHealth({ status, timestamp, checks });
      setLoading(false);
    };

    runHealthChecks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running health checks...</p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to run health checks</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">System Health Check</h1>
          <p className="text-gray-600 mb-6">
            Deployment: <span className="font-mono">{health.timestamp}</span>
          </p>

          <div
            className={`mb-8 p-4 rounded-lg ${
              health.status === 'healthy'
                ? 'bg-green-50 border-2 border-green-300'
                : health.status === 'degraded'
                ? 'bg-yellow-50 border-2 border-yellow-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}
          >
            <div className="flex items-center">
              <span className="text-3xl mr-3">
                {health.status === 'healthy' ? '✓' : health.status === 'degraded' ? '⚠' : '✗'}
              </span>
              <div>
                <h2 className="text-xl font-semibold capitalize">{health.status}</h2>
                <p className="text-sm text-gray-600">
                  {health.status === 'healthy'
                    ? 'All systems operational'
                    : health.status === 'degraded'
                    ? 'Some issues detected'
                    : 'Critical issues detected'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Component Status</h3>

            {Object.entries(health.checks).map(([key, check]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-start">
                  <span className={`text-2xl mr-3 ${getStatusColor(check.status)}`}>
                    {getStatusIcon(check.status)}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold capitalize mb-1">{key}</h4>
                    <p className="text-sm text-gray-600 font-mono">{check.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Build Information</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-600">Mode:</dt>
                <dd className="font-mono">{import.meta.env.MODE}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Dev:</dt>
                <dd className="font-mono">{import.meta.env.DEV ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Prod:</dt>
                <dd className="font-mono">{import.meta.env.PROD ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600">Base URL:</dt>
                <dd className="font-mono">{import.meta.env.BASE_URL}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Troubleshooting</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>If you see this page:</strong> The application is loading successfully! ✓
              </p>
              <p>
                <strong>If deployment shows blank page:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check browser console for JavaScript errors</li>
                <li>Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel</li>
                <li>Ensure VITE_BASE matches your deployment path (usually '/')</li>
                <li>Check network tab for 404 errors on assets</li>
                <li>Verify vercel.json rewrites are configured</li>
              </ul>
              <p className="mt-4">
                <a href="/" className="text-blue-600 hover:underline">
                  ← Return to Home
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
