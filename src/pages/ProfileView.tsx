/**
 * ProfileView Component - Displays user profiles with privacy controls
 * 
 * Features:
 * - View own profile or other users' profiles
 * - Privacy-aware field display
 * - Profile statistics
 * - Avatar display
 * - Edit button for own profile
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit, 
  Calendar, 
  Users,
  Building,
  MessageSquare,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthContext } from '../lib/AuthProvider';
import { useProfile, getDisplayName, canViewProfile } from '../lib/useProfile';

const ProfileView: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuthContext();
  
  // Use current user's ID if no userId provided (for /profile route)
  const targetUserId = userId || user?.id;
  const isOwnProfile = targetUserId === user?.id;
  
  const { profile, stats, loading, error } = useProfile(targetUserId, { 
    includeStats: true 
  });

  const isAdmin = authProfile?.role === 'admin';
  const canView = canViewProfile(profile, user?.id || null, isAdmin);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limpopo-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Profile not found'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EyeOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Private Profile</h2>
          <p className="text-gray-600 mb-4">This profile is set to private.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(profile);
  const showContact = isOwnProfile || isAdmin || profile.show_contact;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-limpopo-blue to-limpopo-green rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${displayName}'s avatar`}
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <span>
                  {profile.first_name?.charAt(0) || profile.email?.charAt(0) || '?'}
                </span>
              )}
            </div>
            {!profile.is_public_profile && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full" title="Private Profile">
                <EyeOff className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profile.role?.replace('_', ' ')}</span>
                </div>
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
                )}
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {showContact ? (
                    <p className="font-medium">{profile.email}</p>
                  ) : (
                    <p className="text-gray-400 italic">Hidden</p>
                  )}
                </div>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {showContact ? (
                      <p className="font-medium">{profile.phone}</p>
                    ) : (
                      <p className="text-gray-400 italic">Hidden</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Statistics */}
        <div className="space-y-6">
          {stats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-limpopo-blue" />
                    <span className="text-sm text-gray-600">Messages</span>
                  </div>
                  <span className="font-semibold">{stats.messages_sent}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-limpopo-green" />
                    <span className="text-sm text-gray-600">Rooms Joined</span>
                  </div>
                  <span className="font-semibold">{stats.rooms_joined}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-limpopo-gold" />
                    <span className="text-sm text-gray-600">Businesses</span>
                  </div>
                  <span className="font-semibold">{stats.businesses_owned}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Reports</span>
                  </div>
                  <span className="font-semibold">{stats.reports_submitted}</span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings (own profile only) */}
          {isOwnProfile && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Public Profile</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.is_public_profile 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.is_public_profile ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Contact Info</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.show_contact 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.show_contact ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Edit your profile to change these settings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && !isOwnProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Admin Actions</h3>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs">
              Edit Profile
            </button>
            <button className="btn-outline text-xs border-red-300 text-red-600">
              Suspend User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;