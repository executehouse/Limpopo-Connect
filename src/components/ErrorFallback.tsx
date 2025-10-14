import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | string;
  onRetry?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-md p-3 mb-6">
          <p>{errorMessage}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
