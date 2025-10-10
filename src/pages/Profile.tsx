/**
 * Profile Component - Redirects to ProfileView
 * 
 * This component serves as a compatibility layer to redirect /profile to /profile/view
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new ProfileView component
    navigate('/profile/view', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
};

export default Profile;
