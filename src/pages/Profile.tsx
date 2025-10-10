import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Save, X } from 'lucide-react';
import { useAuthContext } from '../lib/AuthProvider';

const Profile: React.FC = () => {
  const { user, profile, updateProfile, loading, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim()
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary px-4 py-2"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                    isEditing ? 'focus:ring-2 focus:ring-limpopo-blue focus:border-transparent' : 'bg-gray-50'
                  }`}
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                disabled={!isEditing}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:ring-2 focus:ring-limpopo-blue focus:border-transparent' : 'bg-gray-50'
                }`}
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                value={profile.email || user?.email || ''}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="phone"
                name="phone"
                type="tel"
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  isEditing ? 'focus:ring-2 focus:ring-limpopo-blue focus:border-transparent' : 'bg-gray-50'
                }`}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="role"
                type="text"
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                value={profile.role?.replace('_', ' ') || 'citizen'}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
