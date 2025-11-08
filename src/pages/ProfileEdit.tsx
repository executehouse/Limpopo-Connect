/**
 * ProfileEdit Component - Complete profile editing with avatar upload
 * 
 * Features:
 * - Form validation with real-time feedback
 * - Avatar upload with preview and validation
 * - Privacy controls
 * - Optimistic UI updates
 * - Comprehensive error handling
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuthContext } from '../lib/AuthProvider';
import {
  useProfileMutations,
  validateProfileData
} from '../lib/useProfile';

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  is_public_profile: boolean;
  show_contact: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const ProfileEdit: React.FC = () => {
  const { user, profile, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { updateProfile, uploadAvatar, deleteAvatar, loading: mutationLoading, error: mutationError } = useProfileMutations();
  
  const [formData, setFormData] = React.useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    is_public_profile: true,
    show_contact: false
  });
  
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && user === null) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Initialize form with profile data
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        is_public_profile: profile.is_public_profile ?? true,
        show_contact: profile.show_contact ?? false
      });
    }
  }, [profile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked! : value
    }));

    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (success) setSuccess(null);
  }, [formErrors, success]);

  const validateForm = (): boolean => {
    const errors = validateProfileData(formData);
    const fieldErrors: FormErrors = {};
    
    errors.forEach(error => {
      if (error.includes('Bio')) fieldErrors.bio = error;
      if (error.includes('Phone')) fieldErrors.phone = error;
      if (error.includes('First name')) fieldErrors.first_name = error;
      if (error.includes('Last name')) fieldErrors.last_name = error;
    });
    
    setFormErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Redirect to profile view after a delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, avatar: 'Image must be less than 5MB' }));
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear avatar error
    if (formErrors.avatar) {
      setFormErrors(prev => ({ ...prev, avatar: '' }));
    }
  }, [formErrors.avatar]);

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    
    try {
      await uploadAvatar(avatarFile);
      setSuccess('Avatar updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setFormErrors(prev => ({ 
        ...prev, 
        avatar: err instanceof Error ? err.message : 'Failed to upload avatar' 
      }));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) return;

    try {
      await deleteAvatar();
      setSuccess('Avatar removed successfully!');
    } catch (err) {
      setFormErrors(prev => ({ 
        ...prev, 
        avatar: err instanceof Error ? err.message : 'Failed to remove avatar' 
      }));
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-limpopo-blue" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // const displayName = getDisplayName(profile);
  const currentAvatar = avatarPreview || profile.avatar_url;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
            title="Cancel"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <p>{success}</p>
          </div>
        )}

        {/* Mutation Error */}
        {mutationError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{mutationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Avatar Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </h2>
            
            <div className="flex items-start gap-6">
              {/* Avatar Display */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-limpopo-blue to-limpopo-green rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Profile"
                      className="w-24 h-24 object-cover"
                    />
                  ) : (
                    <span>
                      {profile.first_name?.charAt(0) || profile.email?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Avatar Actions */}
              <div className="flex-1 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="btn-secondary flex items-center gap-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fileInputRef.current?.click();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Choose profile photo"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Photo
                  </button>
                  
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {avatarUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Upload
                    </button>
                  )}
                  
                  {profile.avatar_url && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={avatarUploading || mutationLoading}
                      className="btn-outline border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                
                {formErrors.avatar && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.avatar}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent ${
                    formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.first_name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent ${
                  formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Email (Read-only) */}
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

          {/* Phone */}
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
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent ${
                  formErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +27 82 123 4567"
              />
            </div>
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formErrors.phone}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={1000}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent ${
                formErrors.bio ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell others about yourself..."
            />
            <div className="flex justify-between mt-1">
              <div>
                {formErrors.bio && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.bio}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formData.bio.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Role (Read-only) */}
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

          {/* Privacy Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-limpopo-blue bg-opacity-10 rounded-lg">
                    {formData.is_public_profile ? (
                      <Eye className="h-4 w-4 text-limpopo-blue" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Public Profile</h3>
                    <p className="text-sm text-gray-600">
                      Other users can find and view your profile
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public_profile"
                    checked={formData.is_public_profile}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-limpopo-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-limpopo-blue"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-limpopo-green bg-opacity-10 rounded-lg">
                    {formData.show_contact ? (
                      <Mail className="h-4 w-4 text-limpopo-green" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Show Contact Info</h3>
                    <p className="text-sm text-gray-600">
                      Display email and phone to other users
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="show_contact"
                    checked={formData.show_contact}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-limpopo-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-limpopo-green"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving || mutationLoading}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving || mutationLoading}
              className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
