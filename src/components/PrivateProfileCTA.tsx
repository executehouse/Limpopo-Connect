import React from 'react';
import { Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const PrivateProfileCTA: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile is Private</h2>
        <p className="text-gray-600 mb-6">
          This user's profile is not public. Please sign in to see if you have access.
        </p>
        <div className="space-y-3">
          <Link
            to={`/auth/login?redirect=/profile/view/${userId}`}
            className="btn-primary w-full block"
          >
            Sign In
          </Link>
          <p className="text-sm text-gray-500">or</p>
          <Link to="/auth/register" className="btn-secondary w-full block">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivateProfileCTA;
