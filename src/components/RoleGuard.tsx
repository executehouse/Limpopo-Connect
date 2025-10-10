/**
 * RoleGuard Component
 * 
 * Advanced route guard that combines authentication and role-based access control
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../lib/AuthProvider';
import type { UserRole } from '../lib/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

interface AccessDeniedProps {
  userRole?: UserRole;
  requiredRoles: UserRole[];
  onUpgradeRole?: () => void;
}

function AccessDenied({ userRole, requiredRoles, onUpgradeRole }: AccessDeniedProps) {
  const canUpgrade = userRole === 'citizen' && requiredRoles.includes('business');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You need additional permissions to access this page.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-800">
              <p><strong>Your role:</strong> {userRole || 'None'}</p>
              <p><strong>Required roles:</strong> {requiredRoles.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {canUpgrade && onUpgradeRole && (
            <button
              onClick={onUpgradeRole}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-limpopo-green hover:bg-limpopo-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green"
            >
              Upgrade to Business Account
            </button>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green"
            >
              Go Back
            </button>
            <a
              href="/"
              className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-limpopo-green bg-limpopo-green bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green text-center"
            >
              Home
            </a>
          </div>
          
          <div className="text-center">
            <a
              href="mailto:support@limpopoconnect.co.za"
              className="text-sm text-limpopo-green hover:text-limpopo-green-dark"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-limpopo-green mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  fallbackPath,
  showAccessDenied = true 
}: RoleGuardProps) {
  const { role, isAuthenticated, loading, getDefaultLandingPage } = useAuthContext();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // For visitors (no authentication required), allow access if visitor role is permitted
  if (!isAuthenticated && !requireAuth && allowedRoles.includes('visitor')) {
    return <>{children}</>;
  }

  // Check if user's role is allowed
  const userRole = isAuthenticated ? role : 'visitor';
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    if (showAccessDenied) {
      const handleUpgradeRole = () => {
        // Navigate to business verification or upgrade flow
        console.log('Navigate to role upgrade for:', userRole);
        // Could integrate with business verification system
      };
      
      return (
        <AccessDenied 
          userRole={userRole}
          requiredRoles={allowedRoles}
          onUpgradeRole={handleUpgradeRole}
        />
      );
    }
    
    // Default redirect to user's default landing page or home
    const defaultPath = isAuthenticated ? getDefaultLandingPage(userRole) : '/';
    return <Navigate to={defaultPath} replace />;
  }

  // User has required role, render children
  return <>{children}</>;
}

// Export utilities for convenience
export { AccessDenied, LoadingSpinner };