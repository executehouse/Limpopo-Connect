/**
 * Profile Component - Redirects authenticated users to their profile view.
 *
 * This component acts as a gateway for the `/profile` route. It fetches the
 * authenticated user's ID and redirects them to their specific profile page
 * at `/profile/view/:userId`.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/AuthProvider';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user?.id) {
      // Redirect to the user's own profile view
      navigate(`/profile/view/${user.id}`, { replace: true });
    }
    // If there's no user, the `RequireRole` wrapper will handle redirection
    // to the login page, so no explicit else case is needed here.
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limpopo-blue"></div>
      <p className="ml-4 text-gray-600">Loading your profile...</p>
    </div>
  );
};

export default Profile;
